import requests
import re
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

def issue_cookies(user):
    """Issue JWT tokens via HttpOnly cookies"""
    refresh = RefreshToken.for_user(user)
    response = Response({
        'status': 'success',
        'is_new_user': False,
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


class SendOTPView(APIView):
    """Send email OTP via Resend"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limiting: max 3 OTPs per hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_otps = OTP.objects.filter(
            target_type='email',
            target_value=email,
            created_at__gte=one_hour_ago
        ).count()
        
        if recent_otps >= 3:
            return Response(
                {'error': 'Too many OTP requests. Please wait.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Invalidate old unverified OTPs
        OTP.objects.filter(
            target_type='email',
            target_value=email,
            is_verified=False
        ).update(is_verified=True)

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
                    <h1 style="letter-spacing: 5px; color: #B86B5A;">{otp.code}</h1>
                    <p>This code expires in 5 minutes.</p>
                </div>
                """
            })
            return Response({'status': 'OTP sent'})
        except Exception as e:
            print(f"🔥 [RESEND ERROR]: {str(e)}")
            print(f"🔥 [DEV MODE] OTP for {email}: {otp.code}")
            return Response({'status': 'OTP sent (Dev Mode - check terminal)'})


class VerifyOTPView(APIView):
    """Verify email OTP and login/register user"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        phone = request.data.get('phone', '').strip()

        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Find OTP
        try:
            otp = OTP.objects.filter(
                target_type='email',
                target_value=email,
                is_verified=False
            ).latest('created_at')
        except OTP.DoesNotExist:
            return Response(
                {'error': 'No active OTP found. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if OTP is expired
        if not otp.is_valid:
            return Response(
                {'error': 'Invalid or expired code.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate code matches
        if otp.code != code:
            otp.attempts += 1
            otp.save()
            return Response(
                {'error': 'Invalid or expired code.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find or create user
        user = User.objects.filter(email=email).first()
        is_new_user = False

        if not user:
            # New user - require first name
            if not first_name:
                return Response(
                    {'error': 'First name is required for new accounts'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate phone format if provided
            if phone and not re.match(r'^[6-9]\d{9}$', phone):
                return Response(
                    {'error': 'Invalid phone number format'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = User.objects.create_user(
                email=email,
                phone=phone if phone else None,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=True,
                is_phone_verified=bool(phone)  # Trust user input
            )
            is_new_user = True
        else:
            # Existing user
            if not user.is_email_verified:
                user.is_email_verified = True
            
            # Update phone if provided and not already set
            if phone and not user.phone:
                if re.match(r'^[6-9]\d{9}$', phone):
                    user.phone = phone
                    user.is_phone_verified = True
            
            if not user.is_active:
                user.is_active = True
            
            user.save()

        # Only mark OTP as verified AFTER we successfully create/find the user
        otp.is_verified = True
        otp.save()

        response = issue_cookies(user)
        response.data['is_new_user'] = is_new_user
        return response


class GoogleAuthView(APIView):
    """Google OAuth login"""
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('credential')
        if not access_token:
            return Response(
                {'error': 'Google token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            res = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            res.raise_for_status()
            payload = res.json()
        except Exception:
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        google_id = payload.get('sub')
        email = payload.get('email')
        
        if not google_id or not email:
            return Response(
                {'error': 'Could not extract user info'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(google_id=google_id).first()
        
        if not user:
            user = User.objects.filter(email=email).first()
            if user:
                user.google_id = google_id
                user.is_email_verified = True
                if not user.is_active:
                    user.is_active = True
                user.save()
            else:
                user = User.objects.create_user(
                    email=email,
                    google_id=google_id,
                    first_name=payload.get('given_name', ''),
                    last_name=payload.get('family_name', ''),
                    is_email_verified=True
                )
        else:
            if not user.is_active:
                user.is_active = True
            user.save()

        return issue_cookies(user)