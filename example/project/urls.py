"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.shortcuts import redirect
from django.conf.urls.static import static
from django.conf import settings
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('upload_form/', include('upload_form.urls', namespace='upload_form')),
    #path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('', views.index, name='index'),
    path('compress_images_test/', views.compress_images_test, name='compress_images_test'),
    path('clear_all_files/', views.clear_all_files, name='clear_all_files'),
    path('my_upload_target_view/', views.my_upload_target_view, name="my_upload_target_view")
    #path('', lambda x: redirect('upload_form/test_view/')),
] \
+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
