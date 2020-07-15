"""
Optional Backend for Integrating django_auth_adfs with Healthchecks
"""

from django_auth_adfs.backend import AdfsBaseBackend
from django_auth_adfs.config import settings, provider_config
import logging
from django.contrib.auth import get_user_model
import uuid
logger = logging.getLogger("django_auth_adfs")

"""
Overriding AdfsBaseBackend to support HealthCheck's tokens 
"""
class HealthChecksADFSBackend(AdfsBaseBackend):

    def create_user(self, claims):
        """
        Create the user if it doesn't exist yet

        Args:
            claims (dict): claims from the access token

        Returns:
            django.contrib.auth.models.User: A Django user
        """
        # Create the user
        username_claim = settings.USERNAME_CLAIM
        usermodel = get_user_model()
        print(claims[username_claim].lower())
        user, created = usermodel.objects.get_or_create(**{
            'email': claims[username_claim].lower()
        })
        if created:
            user.username = str(uuid.uuid4())[:30]
        if created or not user.password:
            user.set_unusable_password()
            logger.debug("User '{}' has been created.".format(claims[username_claim]))

        return user
        

class AdfsAuthCodeBackend(HealthChecksADFSBackend):
    """
    Authentication backend to allow authenticating users against a
    Microsoft ADFS server with an authorization code.
    """

    def authenticate(self, request=None, authorization_code=None, **kwargs):
        # If loaded data is too old, reload it again
        provider_config.load_config()

        # If there's no token or code, we pass control to the next authentication backend
        if authorization_code is None or authorization_code == '':
            logger.debug("django_auth_adfs authentication backend was called but no authorization code was received")
            return

        adfs_response = self.exchange_auth_code(authorization_code, request)
        access_token = adfs_response["access_token"]
        user = self.process_access_token(access_token, adfs_response)
        return user