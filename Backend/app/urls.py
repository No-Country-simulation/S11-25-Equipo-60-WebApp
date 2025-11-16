from django.urls import path,include
from rest_framework import routers
from app import views
from .views import *

from django.conf import settings
from django.conf.urls.static import static

router=routers.DefaultRouter()
#Modelos
router.register(r'user', views.UsuarioViewSet, basename='users')   # endpoint para usuarios visitantes
router.register(r'companias', views.CompaniaViewSet, basename='companias')  # endpoint para Compañias
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'organizacion', OrganizacionViewSet, basename='organizacion')
router.register(r'testimonios', TestimonioViewSet, basename='testimonios')
urlpatterns=[
    path('', include(router.urls)),
]




if settings.DEBUG:
    #urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)