from django.conf import settings
from constance import config

ALLOWED_FILE_TYPES = getattr(settings, 'UPLOAD_FROM_ALLOWED_FILE_TYPES',
    getattr(config, 'UPLOAD_FROM_ALLOWED_FILE_TYPES', "png jpg jpeg gif")
)

MAX_FILE_SIZE_MB = getattr(settings, 'UPLOAD_FORM_MAX_FILE_SIZE_MB',
    getattr(config, 'UPLOAD_FORM_MAX_FILE_SIZE_MB', 10)
)
