import os
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from django import forms

from .app_settings import ALLOWED_FILE_TYPES
from .app_settings import MAX_FILE_SIZE_MB


class UploadForm(forms.Form):
    """
    This class behaves much like a Django form.

    See upload_form.views.test() for a usage example.
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

    def get_success_url(self):
        """
        Example:
            return '/'
        """
        assert False, 'To be overridden'

    def get_action(self):
        """
        Example:
            return reverse('upload_form:test')
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

    def is_valid(self):

        allowed_file_types = ALLOWED_FILE_TYPES.split()

        self.file_errors = []
        files = self.files.getlist('files')
        for file in files:
            name, extension = os.path.splitext(file.name)
            extension = extension[1:].lower()
            size_MB = file.size / (1024 * 1024)
            if extension not in allowed_file_types:
                self.file_errors.append("%s: %s" % (file.name, _('File type not allowed')))
            if size_MB > MAX_FILE_SIZE_MB:
                self.file_errors.append("%s: %s" % (file.name, _('File size exceeds %s MB limit') % str(MAX_FILE_SIZE_MB)))

        return len(self.file_errors) <= 0
