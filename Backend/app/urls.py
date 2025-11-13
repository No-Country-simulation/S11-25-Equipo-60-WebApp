from django.urls import path,include
from rest_framework import routers
from app import views
from .views import *

from django.conf import settings
from django.conf.urls.static import static

router=routers.DefaultRouter()
#Modelos
router.register(r'user', views.CuentaViewSet)   #endpoint 

urlpatterns=[
    path('', include(router.urls)),
    #La ruta de auth/o es api/auth/o/login/google-oauth2/
]




if settings.DEBUG:
    #urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)