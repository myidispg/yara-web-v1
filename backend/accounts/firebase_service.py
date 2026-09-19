import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
import os

# Initialize Firebase Admin SDK
# Make sure your firebase-adminsdk.json file is in the same directory as manage.py
cred_path = os.path.join(settings.BASE_DIR, 'firebase-adminsdk.json')

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"🔥 Firebase token verification failed: {e}")
        return None