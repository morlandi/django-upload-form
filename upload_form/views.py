from django.shortcuts import render
try:
    from django.urls import reverse
except ModuleNotFoundError as e:
    # for Django < v1.10
    from django.core.urlresolvers import reverse
from django.http import JsonResponse
from .forms import UploadForm


class TestUploadForm(UploadForm):

    def form_valid(self, request):
        print("*")
        print("* TestUploadForm.form_valid() ...")
        print("* Here, we just log the list of received files;")
        print("* What you do with these files in a real project is entirely up to you.")
        print("*")
        self.dump()
        return self.get_success_url(request)

    def get_success_url(self, request=None):
        return '/'

    def get_action(self):
        return reverse('upload_form:test_view')


def test_view(request):

    if request.method == 'GET':
        form = TestUploadForm()
    else:
        form = TestUploadForm(request.POST, request.FILES)
        if form.is_valid():
            url = form.form_valid(request)
            return JsonResponse({'action': 'redirect', 'url': url, })
        else:
            return JsonResponse({'action': 'replace', 'html': form.as_html(request), })

    return render(
        request,
        'upload_form/test_view.html', {
            'form': form,
            'form_as_html': form.as_html(request),
        }
    )
