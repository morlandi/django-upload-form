import os
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from django import forms
from . import app_settings


class UploadForm(forms.Form):
    """
    This class behaves much like a Django form.

    See upload_form.views.test() for a usage example.
    """

    class Media:
        css = {
            'all': ('upload_form/upload_form.css',)
        }
        js = (
            'upload_form/upload_form.js',
            'upload_form/filelist.js',
            'upload_form/utils.js',
        )

    def __init__(self, data=None, files=None):
        super().__init__(data, files)
        self.data = data
        self.files = files
        self.file_errors = []
        self.accept = None
        self.max_image_size = 0

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

    def get_action(self, request=None):
        """
        Example:
            return reverse('upload_form:test')
        """
        assert False, 'To be overridden'

    def get_accept(self, request=None):
        """
        Might be overridden
        Example:
            return 'image/*'
        Defaults to: list of allowed file types
        """
        return self.accept

    def get_max_image_size(self, request=None):
        """
        Might be overridden
        """
        return self.max_image_size

    def as_html(self, request):

        accept = self.get_accept()
        if accept is None:
            accept = ','.join(app_settings.get_allowed_file_types())

        html = render_to_string(
            'upload_form/upload_form.html', {
                'form': self,
                'file_errors': self.file_errors,
                'action': self.get_action(request),
                'accept': accept,
                'max_image_size': self.get_max_image_size(request),
                'UPLOAD_FORM_PARALLEL_UPLOAD': app_settings.get_parallel_upload(),
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

        allowed_file_types = app_settings.get_allowed_file_types()
        max_file_size_MB = app_settings.get_max_file_size_MB()

        self.file_errors = []
        files = self.files.getlist('files')
        for file in files:
            name, extension = os.path.splitext(file.name)
            extension = extension.lower()
            size_MB = file.size / (1024 * 1024)
            if extension not in allowed_file_types:
                self.file_errors.append("%s: %s" % (file.name, _('File type not allowed')))
            if size_MB > max_file_size_MB:
                self.file_errors.append("%s: %s" % (file.name, _('File size exceeds %s MB limit') % str(max_file_size_MB)))

        #return len(self.file_errors) <= 0
        valid = super().is_valid() and len(self.file_errors) <= 0
        return valid
