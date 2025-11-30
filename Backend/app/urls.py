from django.urls import path,include, re_path
from rest_framework import routers
from app import views
from .views import *

from django.conf import settings
from django.conf.urls.static import static

router=routers.DefaultRouter()
#Modelos
router.register(r'visitantes', views.UsuarioVisitanteViewSet, basename='visitantes')   # endpoint para usuarios visitantes
router.register(r'editores', views.EditorViewSet, basename='editores')  # endpoint para Editores
router.register(r'administradores', AdminUserViewSet, basename='administrador')  # endpoint para Usuarios Admins
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'organizacion', OrganizacionViewSet, basename='organizacion')
router.register(r'testimonios', TestimonioViewSet, basename='testimonios')
router.register(r'testimonios-totales', TestimonioOrganizacionViewSet, basename='testimonios-totales')
#La ruta de cambiar-estado-testimonio solamente puede ser usado por los editores de la organizacion a la que se le realizo el testimonio
router.register(r'testimonios-cambiar-estado', CambiarEstadoTestimonioViewSet, basename='cambiar-estado-testimonio')

urlpatterns=[
    path('', include(router.urls)),
    path('auth/reset/password/', UserViewSet.as_view({'post': 'reset_password'}), name='password-reset'),
    path('auth/reset/password/confirm/', UserViewSet.as_view({'post': 'reset_password_confirm'}), name='password-reset-confirm'),
]




if settings.DEBUG:
    #urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)