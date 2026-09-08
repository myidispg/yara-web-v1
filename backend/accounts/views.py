from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import AnonRateThrottle

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    throttle_classes = [AnonRateThrottle]


class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user