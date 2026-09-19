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

from rest_framework.permissions import IsAuthenticated
from .firebase_service import verify_firebase_token

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
        id_token = request.data.get('idToken')
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip().lower()
        email_otp = request.data.get('email_otp', '').strip()  # NEW: Email OTP code

        if not id_token:
            return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)

        decoded = verify_firebase_token(id_token)
        if not decoded:
            return Response({'error': 'Invalid or expired Firebase token'}, status=status.HTTP_400_BAD_REQUEST)

        firebase_phone = decoded.get('phone_number', '')
        phone = firebase_phone.replace('+91', '').replace(' ', '').replace('-', '')

        if not phone:
            return Response({'error': 'Could not extract phone number'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone=phone).first()
        created = False

        # If email is provided, verify it via email OTP
        email_verified = False
        if email:
            if not email_otp:
                return Response({
                    'status': 'needs_email_otp',
                    'email': email
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the email OTP
            try:
                otp_obj = OTP.objects.filter(
                    target_type='email', 
                    target_value=email, 
                    is_verified=False
                ).latest('created_at')
                
                otp_obj.attempts += 1
                otp_obj.save()
                
                if not otp_obj.is_valid or otp_obj.code != email_otp:
                    return Response({'error': 'Invalid or expired email verification code'}, status=status.HTTP_400_BAD_REQUEST)
                
                otp_obj.is_verified = True
                otp_obj.save()
                email_verified = True
            except OTP.DoesNotExist:
                return Response({'error': 'No active email OTP found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user:
            if not first_name:
                return Response({
                    'status': 'needs_details', 
                    'phone': phone
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if this email is already registered to another user
            if email and User.objects.filter(email=email).exists():
                return Response({'error': 'An account with this email already exists. Please use a different email or sign in.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(
                phone=phone,
                email=email if email else None,
                first_name=first_name,
                last_name=last_name,
                is_phone_verified=True,
                is_email_verified=email_verified
            )
            created = True
        else:
            if not user.is_active:
                user.is_active = True
            
            if not user.is_phone_verified:
                user.is_phone_verified = True
                
            # Update email if provided and verified (and not already set)
            if email and email_verified:
                if user.email and user.email != email:
                    # Check if new email belongs to another user
                    if User.objects.filter(email=email).exclude(id=user.id).exists():
                        return Response({'error': 'This email is already used by another account.'}, status=status.HTTP_400_BAD_REQUEST)
                user.email = email
                user.is_email_verified = True
                
            user.save()

        refresh = RefreshToken.for_user(user)
        response = Response({
            'status': 'success',
            'is_new_user': created,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'is_phone_verified': user.is_phone_verified,
                'is_email_verified': user.is_email_verified,
                'is_active': user.is_active
            }
        })
        
        response.set_cookie("access", str(refresh.access_token), max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
        response.set_cookie("refresh", str(refresh), max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
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

class VerifyPhoneView(APIView):
    """Accepts a Firebase ID token, verifies it, and marks the user's phone as verified."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id_token = request.data.get('idToken')
        if not id_token:
            return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)

        decoded = verify_firebase_token(id_token)
        if not decoded:
            return Response({'error': 'Invalid or expired Firebase token'}, status=status.HTTP_400_BAD_REQUEST)

        # Firebase returns phone in format "+919876543210", let's strip the country code
        firebase_phone = decoded.get('phone_number', '')
        phone_10_digit = firebase_phone.replace('+91', '').replace(' ', '').replace('-', '')

        user = request.user
        user.phone = phone_10_digit
        user.is_phone_verified = True
        user.save()

        return Response({
            'status': 'success',
            'phone': user.phone,
            'is_phone_verified': True
        })

from .firebase_service import verify_firebase_token

class PhoneAuthView(APIView):
    """
    Handles Phone-based Login and Registration via Firebase.
    Step 1: Frontend verifies SMS -> sends idToken.
    Step 2: If user exists -> logs them in. If new -> returns 'needs_details'.
    Step 3: Frontend asks for Name -> sends idToken + Name -> Backend creates user.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get('idToken')
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip().lower()

        if not id_token:
            return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)

        decoded = verify_firebase_token(id_token)
        if not decoded:
            return Response({'error': 'Invalid or expired Firebase token'}, status=status.HTTP_400_BAD_REQUEST)

        # Extract 10-digit phone from Firebase (e.g., "+919876543210" -> "9876543210")
        firebase_phone = decoded.get('phone_number', '')
        phone = firebase_phone.replace('+91', '').replace(' ', '').replace('-', '')

        if not phone:
            return Response({'error': 'Could not extract phone number'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone=phone).first()
        created = False

        if not user:
            # NEW USER FLOW
            if not first_name:
                # We don't have their name yet. Tell frontend to ask for it.
                return Response({
                    'status': 'needs_details', 
                    'phone': phone
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the new user
            user = User.objects.create_user(
                phone=phone,
                email=email if email else None,
                first_name=first_name,
                last_name=last_name,
                is_phone_verified=True,
                is_email_verified=bool(email) # If they provided email, mark it verified
            )
            created = True
        else:
            # EXISTING USER FLOW
            if not user.is_active:
                user.is_active = True # Auto-reactivate
            
            if not user.is_phone_verified:
                user.is_phone_verified = True
                
            # If they didn't have an email before, but just provided one, save it
            if not user.email and email:
                user.email = email
                user.is_email_verified = True
                
            user.save()

        # Issue JWT Cookies (Storefront session)
        refresh = RefreshToken.for_user(user)
        response = Response({
            'status': 'success',
            'is_new_user': created,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'is_phone_verified': user.is_phone_verified,
                'is_email_verified': user.is_email_verified
            }
        })
        
        response.set_cookie("access", str(refresh.access_token), max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
        response.set_cookie("refresh", str(refresh), max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
        return response