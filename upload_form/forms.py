import os
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from django import forms


class UploadForm(forms.Form):
    """
    This class behaves much like a Django form.

    See upload_form.views.test_view() for a usage example.
    """

    class Media:
        css = {
            'all': ('upload_form/upload_form.css',)
        }
        js = ('upload_form/upload_form.js', )

    def __init__(self, data=None, files=None):
        super().__init__(data, files)
        self.data = data
        self.files = files
        self.file_errors = []

    def form_valid(self, request):
        """
        Example:
            self.dump()
            return self.get_success_url()
        """
        assert False, 'To be overridden'

    def get_success_url(self, request=None):
        """
        Example:
            return '/'
        """
        assert False, 'To be overridden'

    def get_action(self):
        """
        Example:
            return reverse('upload_form:test_view')
        """
        assert False, 'To be overridden'

    def as_html(self, request):
        html = render_to_string(
            'upload_form/upload_form.html', {
                'file_errors': self.file_errors,
                'action': self.get_action(),
            },
            request
        )
        return html

    def has_errors(self):
        return len(self.file_errors) > 0

    def dump(self):
        print('=' * 128)
        print(self.data)
        print('-' * 128)
        print(self.files)
        files = self.files.getlist('files')
        for i, file in enumerate(files):
            print('[%d]: "%s"' % (i, file))
        print('=' * 128)

    def list_allowed_file_types(self):
        try:
            from constance import config
            str_types = config.UPLOAD_FROM_ALLOWED_FILE_TYPES
        except:
            str_types = getattr(settings, 'UPLOAD_FROM_ALLOWED_FILE_TYPES', "jpg jpeg png gif bmp tif tiff pic doc docx odt dot xls xlsx pdf dwg dxf txt")
        return str_types.lower().split()

    def get_max_file_size_MB(self):
        try:
            from constance import config
            max_size_MB = config.MAX_FILE_SIZE_MB
        except:
            max_size_MB = getattr(settings, 'UPLOAD_FORM_MAX_FILE_SIZE_MB', 10)
        return max_size_MB

    def is_valid(self):

        allowed_file_types = self.list_allowed_file_types()
        max_file_size_MB = self.get_max_file_size_MB()

        self.file_errors = []
        files = self.files.getlist('files')
        for file in files:
            name, extension = os.path.splitext(file.name)
            extension = extension[1:].lower()
            size_MB = file.size / (1024 * 1024)
            if extension not in allowed_file_types:
                self.file_errors.append("%s: %s" % (file.name, _('File type not allowed')))
            if size_MB > max_file_size_MB:
                self.file_errors.append("%s: %s" % (file.name, _('File size exceeds %s MB limit') % str(MAX_FILE_SIZE_MB)))

        return len(self.file_errors) <= 0
