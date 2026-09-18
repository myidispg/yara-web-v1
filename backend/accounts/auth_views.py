import requests
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTP

User = get_user_model()

class SendOTPView(APIView):
    """Generates and sends an OTP via Resend."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limiting: max 3 OTPs per hour for this email
        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_otps = OTP.objects.filter(target_type='email', target_value=email, created_at__gte=one_hour_ago).count()
        if recent_otps >= 3:
            return Response({'error': 'Too many OTP requests. Please try again later.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Invalidate old unverified OTPs for this email
        OTP.objects.filter(target_type='email', target_value=email, is_verified=False).update(is_verified=True)

        # Create new OTP
        otp = OTP.objects.create(target_type='email', target_value=email)

        # Send via Resend
        try:
            import resend
            resend.api_key = settings.RESEND_API_KEY
            
            resend.Emails.send({
                "from": settings.RESEND_FROM_EMAIL, 
                "to": [email],
                "subject": f"Your YA-RA Verification Code: {otp.code}",
                "html": f"""
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                    <h2>Verify your email</h2>
                    <p>Your verification code is:</p>
                    <h1 style="letter-spacing: 5px; color: #B86B5A;">{otp.code}</h1>
                    <p>This code expires in 5 minutes.</p>
                </div>
                """
            })
            return Response({'status': 'OTP sent'})
        except Exception as e:
            import traceback
            print("\n🔥 [RESEND ERROR] Failed to send email:")
            print(str(e))
            traceback.print_exc()
            print(f"🔥 [DEV MODE FALLBACK] OTP for {email}: {otp.code}\n")
            return Response({'status': 'OTP sent (Dev Mode - check terminal)'})


class VerifyOTPView(APIView):
    """Validates OTP and issues JWT tokens via HttpOnly Cookies."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()

        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp = OTP.objects.filter(target_type='email', target_value=email, is_verified=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({'error': 'No active OTP found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.attempts += 1
        otp.save()

        if not otp.is_valid:
            return Response({'error': 'OTP is expired or exceeded attempts.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp.code != code:
            return Response({'error': 'Invalid code.'}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create user
        user = User.objects.filter(email=email).first()
        
        # AUTO-REACTIVATION: If they prove they own the email via OTP, let them back in!
        if user and not user.is_active:
            user.is_active = True
            user.save()
            
        created = False
        
        if not user:
            # New user! We require first_name to create the account
            if not first_name:
                # Return error but DO NOT mark OTP as verified yet, so Step 3 can use it
                return Response({'error': 'First name is required for new accounts'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=True
            )
            created = True
        else:
            # Existing user logging in
            if not user.is_email_verified:
                user.is_email_verified = True
                user.save()

        # OTP is fully verified and user is successfully resolved!
        otp.is_verified = True
        otp.save()

        # Set HttpOnly Cookies instead of returning tokens in JSON
        response = Response({
            'status': 'success',
            'is_new_user': created,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'is_phone_verified': user.is_phone_verified
            }
        })
        
        refresh = RefreshToken.for_user(user)
        response.set_cookie(
            "access", 
            str(refresh.access_token), 
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), 
            httponly=True, 
            secure=not settings.DEBUG, 
            samesite="Lax", 
            path="/"
        )
        response.set_cookie(
            "refresh", 
            str(refresh), 
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), 
            httponly=True, 
            secure=not settings.DEBUG, 
            samesite="Lax", 
            path="/"
        )
        
        return response


class GoogleAuthView(APIView):
    """Handles Google OAuth access token verification and sets HttpOnly Cookies."""
    permission_classes = [AllowAny]

    def post(self, request):
        # The frontend sends the Google Access Token here
        access_token = request.data.get('credential') 
        if not access_token:
            return Response({'error': 'Google token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch user info from Google using the access token
            res = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            res.raise_for_status()
            payload = res.json()
        except Exception as e:
            return Response({'error': f'Invalid Google token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        google_id = payload.get('sub')
        email = payload.get('email')
        first_name = payload.get('given_name', '')
        last_name = payload.get('family_name', '')

        if not google_id or not email:
            return Response({'error': 'Could not extract user info from Google'}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create user
        user = User.objects.filter(google_id=google_id).first()
        if not user:
            user = User.objects.filter(email=email).first()
            if user:
                # Link existing email account to Google
                user.google_id = google_id
                # AUTO-REACTIVATION: Google login proves identity, let them back in!
                if not user.is_active:
                    user.is_active = True
                user.is_email_verified = True
                user.save()
            else:
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    google_id=google_id,
                    first_name=first_name,
                    last_name=last_name,
                    is_email_verified=True
                )
        else:
            # Existing Google user logging in - AUTO-REACTIVATION
            if not user.is_active:
                user.is_active = True
                user.save()
        
        # Set HttpOnly Cookies
        response = Response({
            'status': 'success',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'is_phone_verified': user.is_phone_verified
            }
        })
        
        refresh = RefreshToken.for_user(user)
        response.set_cookie(
            "access", 
            str(refresh.access_token), 
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), 
            httponly=True, 
            secure=not settings.DEBUG, 
            samesite="Lax", 
            path="/"
        )
        response.set_cookie(
            "refresh", 
            str(refresh), 
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), 
            httponly=True, 
            secure=not settings.DEBUG, 
            samesite="Lax", 
            path="/"
        )
        
        return response