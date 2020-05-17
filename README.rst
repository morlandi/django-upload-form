
upload_form
===========

A Django-like form to upload multiple files

Installation
------------

Install the package by running:

.. code:: bash

    pip install git+https://github.com/morlandi/django-upload-form

then add 'upload_form' to your INSTALLED_APPS:

.. code:: bash

    INSTALLED_APPS = [
        ...
        'upload_form',
    ]


Sample usage
------------

The `upoad_form` app provides a sample test view which uploads multiple files
for illustration purposes.

You can run, study, and possibly duplicate it for further customizations.

To use it, add this to your main urls mapping:

`file urls.py':

.. code:: bash

    urlpatterns = [
        ...
        path('upload_form/', include('upload_form.urls', namespace='upload_form')),
        ...
    ]

then visit this url::

    http://127.0.0.1:8000/upload_form/test/

Below is the source code of the whole test; the real work is done inside the app
by the UploadForm class, which TestUploadForm is derived from.

In the derived form class, you should always override:

    - def form_valid(self, request)
    - def get_success_url(self)
    - def get_action(self)


`file upload_form/views.py`

.. code:: python

    from django.shortcuts import render
    from django.urls import reverse
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

`file templates/upload_form/test.html`

.. code:: html

    {% extends "base.html" %}
    {% load static %}


    {% block extrajs %}
        {{form.media}}
    {% endblock %}


    {% block content %}

        <div class="container">
            <div class="row">
                <div id="upload-box" class="text-center col-md-6 col-md-offset-3" style="">

                    {{ form_as_html }}

                </div>
            </div>
        </div>

    {% endblock content %}


Settings
--------

.. code:: python

    UPLOAD_FORM_MAX_FILE_SIZE_MB = 12
    UPLOAD_FROM_ALLOWED_FILE_TYPES = "png jpg jpeg gif"

or:

.. code:: python

    CONSTANCE_CONFIG = {
        ...
        'UPLOAD_FORM_MAX_FILE_SIZE_MB': (12, 'Dimensione massima files in upload (MB)'),
        'UPLOAD_FROM_ALLOWED_FILE_TYPES': ("png jpg jpeg gif", "Tipi di files abilitati all'upload"),
    }


Screenshots
-----------

.. image:: screenshots/001.png

.. image:: screenshots/002.png

.. image:: screenshots/003.png

.. image:: screenshots/004.png


References
----------

- `How To Make A Drag-and-Drop File Uploader With Vanilla JavaScript <https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/>`_
- `Multiple File Upload Input <https://davidwalsh.name/multiple-file-upload>`_
- `Styling & Customizing File Inputs the Smart Way <https://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/>`_
- `How to set file input value when dropping file on page? <https://stackoverflow.com/questions/47515232/how-to-set-file-input-value-when-dropping-file-on-page>`_
- `A strategy for handling multiple file uploads using JavaScript <https://medium.com/typecode/a-strategy-for-handling-multiple-file-uploads-using-javascript-eb00a77e15f>`_
- `Use HTML5 to resize an image before upload <https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload#24015367>`_

