import requests
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .firebase_service import verify_firebase_token
from .models import OTP

User = get_user_model()

def issue_cookies(user):
    refresh = RefreshToken.for_user(user)
    response = Response({
        'status': 'success',
        'is_new_user': True,
        'user': {
            'id': user.id, 'email': user.email, 'first_name': user.first_name, 
            'last_name': user.last_name, 'phone': user.phone, 
            'is_phone_verified': user.is_phone_verified, 'is_email_verified': user.is_email_verified
        }
    })
    response.set_cookie("access", str(refresh.access_token), max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
    response.set_cookie("refresh", str(refresh), max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), httponly=True, secure=not settings.DEBUG, samesite="Lax", path="/")
    return response

class SendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email: return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        one_hour_ago = timezone.now() - timedelta(hours=1)
        if OTP.objects.filter(target_type='email', target_value=email, created_at__gte=one_hour_ago).count() >= 3:
            return Response({'error': 'Too many OTP requests. Please wait.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        OTP.objects.filter(target_type='email', target_value=email, is_verified=False).update(is_verified=True)
        otp = OTP.objects.create(target_type='email', target_value=email)

        try:
            import resend
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": settings.RESEND_FROM_EMAIL, "to": [email],
                "subject": f"Your YA-RA Verification Code: {otp.code}",
                "html": f"""<div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;"><h2>Verify your email</h2><h1 style="letter-spacing: 5px; color: #B86B5A;">{otp.code}</h1><p>This code expires in 5 minutes.</p></div>"""
            })
            return Response({'status': 'OTP sent'})
        except Exception as e:
            print(f"🔥 [RESEND ERROR] Failed to send email: {str(e)}")
            print(f"🔥 [DEV MODE FALLBACK] OTP for {email}: {otp.code}\n")
            return Response({'status': 'OTP sent (Dev Mode - check terminal)'})

class VerifyOTPView(APIView):
    """Email Login / Verify"""
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        phone_id_token = request.data.get('phone_id_token', '').strip()

        if not email or not code: return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp = OTP.objects.filter(target_type='email', target_value=email, is_verified=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({'error': 'No active OTP found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.attempts += 1
        otp.save()
        if not otp.is_valid or otp.code != code:
            return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_verified = True
        otp.save()

        user = User.objects.filter(email=email).first()
        
        verified_phone = None
        if phone_id_token:
            decoded = verify_firebase_token(phone_id_token)
            if decoded:
                verified_phone = decoded.get('phone_number', '').replace('+91', '').replace(' ', '').replace('-', '')

        if not user:
            if not first_name:
                return Response({'error': 'First name is required for new accounts'}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.create_user(
                email=email, phone=verified_phone, first_name=first_name, last_name=last_name,
                is_email_verified=True, is_phone_verified=bool(verified_phone)
            )
        else:
            if not user.is_email_verified: user.is_email_verified = True
            if verified_phone and not user.phone:
                user.phone = verified_phone
                user.is_phone_verified = True
            if not user.is_active: user.is_active = True
            user.save()

        return issue_cookies(user)

class PhoneAuthView(APIView):
    """Phone Login / Verify"""
    permission_classes = [AllowAny]
    def post(self, request):
        id_token = request.data.get('idToken')
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip().lower()
        email_otp = request.data.get('email_otp', '').strip()

        if not id_token: return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)

        decoded = verify_firebase_token(id_token)
        if not decoded: return Response({'error': 'Invalid Firebase token'}, status=status.HTTP_400_BAD_REQUEST)

        phone = decoded.get('phone_number', '').replace('+91', '').replace(' ', '').replace('-', '')
        if not phone: return Response({'error': 'Could not extract phone'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone=phone).first()

        if email:
            if not email_otp:
                return Response({'status': 'needs_email_otp', 'email': email}, status=status.HTTP_400_BAD_REQUEST)
            try:
                otp_obj = OTP.objects.filter(target_type='email', target_value=email, is_verified=False).latest('created_at')
                otp_obj.attempts += 1
                otp_obj.save()
                if not otp_obj.is_valid or otp_obj.code != email_otp:
                    return Response({'error': 'Invalid email verification code'}, status=status.HTTP_400_BAD_REQUEST)
                otp_obj.is_verified = True
                otp_obj.save()
            except OTP.DoesNotExist:
                return Response({'error': 'No active email OTP found'}, status=status.HTTP_400_BAD_REQUEST)

        if not user:
            if not first_name:
                return Response({'status': 'needs_details', 'phone': phone}, status=status.HTTP_400_BAD_REQUEST)
            if email and User.objects.filter(email=email).exists():
                return Response({'error': 'Email already in use by another account'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(
                phone=phone, email=email if email else None, first_name=first_name, last_name=last_name,
                is_phone_verified=True, is_email_verified=bool(email)
            )
        else:
            if not user.is_phone_verified: user.is_phone_verified = True
            if email and not user.email:
                user.email = email
                user.is_email_verified = True
            if not user.is_active: user.is_active = True
            user.save()

        return issue_cookies(user)

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        access_token = request.data.get('credential')
        if not access_token: return Response({'error': 'Google token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            res = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={"Authorization": f"Bearer {access_token}"})
            res.raise_for_status()
            payload = res.json()
        except Exception: return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

        google_id = payload.get('sub')
        email = payload.get('email')
        if not google_id or not email: return Response({'error': 'Could not extract user info'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(google_id=google_id).first()
        if not user:
            user = User.objects.filter(email=email).first()
            if user:
                user.google_id = google_id
                user.is_email_verified = True
                if not user.is_active: user.is_active = True
                user.save()
            else:
                user = User.objects.create_user(email=email, google_id=google_id, first_name=payload.get('given_name', ''), last_name=payload.get('family_name', ''), is_email_verified=True)
        else:
            if not user.is_active: user.is_active = True
            user.save()
            
        return issue_cookies(user)

class VerifyPhoneView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        id_token = request.data.get('idToken')
        if not id_token: return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)

        decoded = verify_firebase_token(id_token)
        if not decoded: return Response({'error': 'Invalid Firebase token'}, status=status.HTTP_400_BAD_REQUEST)

        phone = decoded.get('phone_number', '').replace('+91', '').replace(' ', '').replace('-', '')
        user = request.user
        user.phone = phone
        user.is_phone_verified = True
        user.save()
        return Response({'status': 'success', 'phone': user.phone, 'is_phone_verified': True})