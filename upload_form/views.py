from django.shortcuts import render
try:
    from django.urls import reverse
except ModuleNotFoundError as e:
    # for Django < v1.10
    from django.core.urlresolvers import reverse
from django.http import JsonResponse
from .forms import UploadForm


# TODO: Check this:
# "When and how to use Django FormView"
# https://www.agiliq.com/blog/2019/01/django-formview/

# See also:
# https://stackoverflow.com/questions/8059160/django-apps-using-class-based-views-and-ajax#44441796

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

    def get_action(self, request=None):
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
