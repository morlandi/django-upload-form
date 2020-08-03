try:
    from django.urls import reverse
except ModuleNotFoundError as e:
    # for Django < v1.10
    from django.core.urlresolvers import reverse
from django import forms
from django.contrib import messages
from upload_form.forms import UploadForm
from.models import File


class MyUploadForm(UploadForm):

    description = forms.CharField()

    def form_valid(self, request):
        print("*")
        print("* TestUploadForm.form_valid() ...")
        print("* Here, we just log the list of received files;")
        print("* What you do with these files in a real project is entirely up to you.")
        print("*")

        self.dump()
        files = self.files.getlist('files')
        for i, file in enumerate(files):
            messages.info(request, '[%d]: "%s" received' % (i, file))
            # image = form.cleaned_data.get('img')
            # foo.imagefield.save(image.name, image)
            obj = File.objects.create(description=file.name)
            obj.file.save(file.name, file)

        return self.get_success_url(request)

    def get_success_url(self, request=None):
        return '/'

    def get_action(self):
        #return reverse('upload_form:test_view')
        return reverse('my_upload_target_view')
