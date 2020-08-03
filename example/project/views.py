from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from .forms import MyUploadForm
from .models import File


def index(request):

    assert request.method == 'GET'
    form = MyUploadForm()

    return render(
        request,
        'index.html', {
            'form': form,
            'form_as_html': form.as_html(request),
            'files': File.objects.all()
        }
    )


def my_upload_target_view(request):

    assert request.method == 'POST'
    assert request.is_ajax()

    form = MyUploadForm(request.POST, request.FILES)
    if form.is_valid():
        url = form.form_valid(request)
        return JsonResponse({'action': 'redirect', 'url': url, })
    else:
        return JsonResponse({'action': 'replace', 'html': form.as_html(request), })
