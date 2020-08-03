from django.conf import settings


def get_allowed_file_types(request=None):
    try:
        from constance import config
        str_types = config.UPLOAD_FORM_ALLOWED_FILE_TYPES
    except:
        str_types = getattr(
            settings,
            'UPLOAD_FORM_ALLOWED_FILE_TYPES',
            ".jpg .jpeg .png .gif .bmp .tif .tiff .pic .doc .docx .odt .dot .xls .xlsx .pdf .dwg .dxf .txt")
    values = str_types.lower().split()
    return [item if item.startswith('.') else '.'+item for item in values]


def get_max_file_size_MB(request=None):
    try:
        from constance import config
        value = config.UPLOAD_FORM_MAX_FILE_SIZE_MB
    except:
        value = getattr(settings, 'UPLOAD_FORM_MAX_FILE_SIZE_MB', 10)
    return value


def get_parallel_upload(request=None):
    try:
        from constance import config
        value = config.UPLOAD_FORM_PARALLEL_UPLOAD
    except:
        value = getattr(settings, 'UPLOAD_FORM_PARALLEL_UPLOAD', False)
    return value


