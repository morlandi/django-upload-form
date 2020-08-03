from django.conf.urls import url
from upload_form import views


app_name = 'upload_form'

urlpatterns = [
    url('test/', views.test, name="test"),
]
