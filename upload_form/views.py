from django.shortcuts import render
from django.core.urlresolvers import reverse
from django.http import JsonResponse
from .forms import UploadForm


class TestUploadForm(UploadForm):

    def form_valid(self, request):
        self.dump()
        return self.get_success_url()

    def get_success_url(self):
        return '/'

    def get_action(self):
        return reverse('upload_form:test')


def test(request):

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
        'upload_form/test.html', {
            'form': form,
            'form_as_html': form.as_html(request),
        }
    )
