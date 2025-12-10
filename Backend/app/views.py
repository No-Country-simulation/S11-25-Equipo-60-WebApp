from rest_framework import viewsets, status, generics
from app.serializers import *
from django.shortcuts import render, redirect
from app.models import *
# JWT
from rest_framework.permissions import IsAuthenticated, AllowAny
#DRF SPECTACULAR
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from urllib.parse import urlparse 
#OTP
from django.contrib.auth import logout as auth_logout
from django.views import View
from django.contrib import messages
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin

from djoser.views import UserViewSet
def custom_logout(request):
    """Logout personalizado que limpia la sesión OTP"""
    if request.session.get('otp_verified'):
        del request.session['otp_verified']
    auth_logout(request)
    return redirect('/admin/login/?next=/admin/')

class OTPVerificationView(LoginRequiredMixin, View):
    """Vista para verificar el token OTP"""
    
    def get(self, request):
        # Si ya está verificado, redirigir al admin
        if request.session.get('otp_verified'):
            return redirect('admin:index')
        
        # Verificar si el usuario tiene dispositivo OTP
        if not user_has_device(request.user):
            device = TOTPDevice.objects.create(user=request.user, name='default')
            messages.info(request, 'Se ha creado un dispositivo de autenticación. Usa tu app de autenticación para generar el código.')
        
        return render(request, 'otp_verification.html')
    
    def post(self, request):
        # Verificar si es el botón "Saltar verificación" (solo para desarrollo)
        if 'skip_verification' in request.POST and settings.DEBUG:
            request.session['otp_verified'] = True
            messages.warning(request, 'Verificación OTP saltada (solo en modo desarrollo).')
            return redirect('admin:index')
        
        token = request.POST.get('token', '').strip()
        
        if not token:
            messages.error(request, 'Por favor ingresa el token.')
            return render(request, 'otp_verification.html')
        
        # Verificar el token usando django-otp
        devices = TOTPDevice.objects.devices_for_user(request.user)
        verified = any(device.verify_token(token) for device in devices)
        
        if verified:
            request.session['otp_verified'] = True
            messages.success(request, 'Verificación exitosa. Bienvenido al panel de administración.')
            return redirect('admin:index')
        else:
            messages.error(request, 'Token inválido. Intenta nuevamente.')
            return render(request, 'otp_verification.html')
        
@extend_schema(tags=['Token'], request=RefreshTokenSerializer)
class TokenRefreshView(generics.GenericAPIView):
    serializer_class = RefreshTokenSerializer  # 👈 Serializador creado manualmente


    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = serializer.validated_data.get('refresh')

        if refresh:
            try:
                token = RefreshToken(refresh)
                access_token = token.access_token
                return Response({'access': str(access_token)}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': 'Token inválido'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Se requiere el token de refresco'}, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(tags=['Login'])
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generar tokens
        refresh = RefreshToken.for_user(user)
        
        # Determinar el rol/grupo del usuario
        user_role = None
        
        # Verificar si es administrador (is_staff=True)
        if user.is_staff:
            user_role = "administrador"
        else:
            # Verificar grupos del usuario
            groups = user.groups.all()
            if groups.exists():
                # Tomar el primer grupo (asumiendo que un usuario solo pertenece a un grupo)
                user_role = groups.first().name
            else:
                user_role = "sin_grupo"
        
        return Response({
            'user_id': user.id,  # 👈 Agregar el ID del usuario
            'rol': user_role, 
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    
@extend_schema_view(
    list=extend_schema(tags=['Visitantes'],   
        description="""Los administradores y los editores que pertenezcan a una organizacion obtienen todas la lista de usuarios visitantes(los editores pueden ver esta vista para poder agregar los visitantes a las organizaciones), editores que no pertenezcan a ninguna organizacion les devuelve un JSON vacio. Los usuarios visitantes no pueden ver la lista de todos los usuarios y este endpoint necesita autenticacion"""
    ),
    retrieve=extend_schema(tags=['Visitantes'],
        description="""Este endpoint es libre y se usa para crear usuarios"""
    ),
    create=extend_schema(tags=['Visitantes']),
    methods=['POST'], tags=['Visitantes'],
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Visitantes']),
    destroy=extend_schema(tags=['Visitantes']),
)
class UsuarioVisitanteViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioVisitanteSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Para acciones de listado (GET)
        if self.action == 'list':
            # 👇 STAFF ve TODOS los usuarios visitantes
            if user.is_staff:
                return User.objects.filter(groups__name='visitante', is_staff=False)
            
            # 👇 EDITORES pueden ver TODOS los visitantes SOLO si pertenecen a alguna organización
            elif user.is_authenticated and user.groups.filter(name='editor').exists():
                # Verificar si el editor pertenece a AL MENOS una organización
                if Organizacion.objects.filter(editores=user).exists():
                    return User.objects.filter(groups__name='visitante', is_staff=False)
                else:
                    # Si el editor no pertenece a ninguna organización, no puede ver la lista
                    return User.objects.none()
            
            # 👇 USUARIOS VISITANTES pueden ver SOLO sus propios datos
            elif user.is_authenticated and user.groups.filter(name='visitante').exists():
                return User.objects.filter(id=user.id)
            
            # 👇 USUARIOS NO AUTENTICADOS o sin permisos no pueden ver nada
            else:
                return User.objects.none()

        # Para retrieve (GET individual) mantener la lógica actual
        return super().get_queryset()

    def get_permissions(self):
        # Mantenemos la configuración para que 'create' sea libre (AllowAny)
        if self.action in ['create']: 
            return [AllowAny()]  
        
        # Para 'list' y 'retrieve' ahora requerimos autenticación
        elif self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        
        elif self.action in ['partial_update', 'destroy']:  
            return [IsAuthenticated()]  
            
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        user = request.user

        # Verificar específicamente para editores sin organizaciones
        if (user.is_authenticated and user.groups.filter(name='editor').exists() and 
            not Organizacion.objects.filter(editores=user).exists()):
            return Response(
                {
                    "detail": "No tienes permisos para ver la lista de visitantes. Debes pertenecer al menos a una organización como editor."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar permisos específicos para list
        if not (user.is_staff or user.groups.filter(name='editor').exists() or 
                (user.is_authenticated and user.groups.filter(name='visitante').exists())):
            return Response(
                {"detail": "No tienes permisos para acceder a este apartado"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        
        # Verificar permisos específicos para retrieve
        if not (user.is_staff or user.groups.filter(name='editor').exists() or 
                (user.is_authenticated and user.id == instance.id and user.groups.filter(name='visitante').exists())):
            return Response(
                {"detail": "No tienes permisos para acceder a este apartado"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # --- Nueva Lógica ---
        origin = request.META.get('HTTP_ORIGIN', None)
        organizacion_asociar = None

        if origin:
            try:
                # Parsea la URL para obtener solo el dominio neto
                parsed_origin = urlparse(origin)
                origin_domain = f"{parsed_origin.scheme}://{parsed_origin.netloc}".lower()

                # Busca la organización por el dominio exacto
                organizacion_asociar = Organizacion.objects.get(dominio__iexact=origin_domain)
                # logger.debug(f"Coincidencia de dominio encontrada: {origin_domain} -> {organizacion_asociar.organizacion_nombre}")
            except Organizacion.DoesNotExist:
                # 🔴 DOMINIO NO COINCIDE: NO CREAR USUARIO
                return Response(
                    {
                        "detail": f"No se puede crear la cuenta. El dominio '{origin_domain}' no está autorizado para registrar usuarios."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            except Exception as e:
                # 🔴 ERROR EN LA VALIDACIÓN: NO CREAR USUARIO
                return Response(
                    {
                        "detail": "Error al validar el dominio de origen. No se puede crear la cuenta."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # 🔴 NO HAY ORIGIN: NO CREAR USUARIO
            return Response(
                {
                    "detail": "No se puede crear la cuenta. Se requiere un encabezado Origin válido."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # --- Fin Nueva Lógica ---


        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Crear usuario con contraseña hasheada
        user = serializer.save()
        # Asignar automáticamente al grupo "visitante"
        try:
            grupo_visitante = Group.objects.get(name='visitante')
            user.groups.add(grupo_visitante)
        except Group.DoesNotExist:
            # Si el grupo no existe, lo creamos (fallback)
            grupo_visitante = Group.objects.create(name='visitante')
            user.groups.add(grupo_visitante)

        # --- Nueva Lógica (continuación) ---
        if organizacion_asociar:
            try:
                # Agrega el usuario recién creado a la lista de visitantes de la organización
                organizacion_asociar.visitantes.add(user)
                # logger.info(f"Usuario {user.email} agregado como visitante a la organización {organizacion_asociar.organizacion_nombre} basado en Origin: {origin}")
            except Exception as e:
                # logger.error(f"Error agregando usuario {user.email} a la organización {organizacion_asociar.organizacion_nombre}: {e}")
                # Puedes optar por continuar o devolver un error
                # Si decides continuar, el usuario se crea pero no se asocia a la organización
                pass # Opcional: manejar error al agregar a la organización

        # --- Fin Nueva Lógica (continuación) ---

        # Opcional: Devolver información adicional sobre la asociación
        response_data = {
            "message": "Usuario creado exitosamente y asignado al grupo 'visitante'",
            "user_id": user.id,
            "profile_picture_url": user.get_profile_picture_url(),  # 👈 Agregar URL de la foto
        }
        if organizacion_asociar:
            response_data["asociado_a_organizacion"] = {
                "id": organizacion_asociar.id,
                "nombre": organizacion_asociar.organizacion_nombre,
                "dominio": organizacion_asociar.dominio
            }

        return Response(response_data, status=status.HTTP_201_CREATED)
   
    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        usuario = self.get_object()
        
        # 👇 STAFF puede modificar cualquier usuario visitante
        if not request.user.is_staff:
            # 👇 USUARIOS NO STAFF solo pueden modificar su propia información
            if usuario != request.user:
                return Response(
                    {"detail": "No tienes permisos para modificar este usuario. Solo puedes modificar tu propia información."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 👇 USUARIOS NO STAFF deben pertenecer al grupo "visitante"
            if not request.user.groups.filter(name='visitante').exists():
                return Response(
                    {"detail": "Solo los usuarios del grupo 'visitante' pueden modificar su información."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        usuario = self.get_object()
        user = request.user
        
        # 👇 STAFF puede eliminar CUALQUIER usuario visitante
        if user.is_staff:
            # Verificar que el usuario a eliminar sea del grupo "visitante"
            if not usuario.groups.filter(name='visitante').exists():
                return Response(
                    {"detail": "Solo se pueden eliminar usuarios del grupo 'visitante'."},
                    status=status.HTTP_403_FORBIDDEN
                )
            return super().destroy(request, *args, **kwargs)
        
        # 👇 USUARIOS NO STAFF solo pueden eliminar su propia cuenta
        if usuario != request.user:
            return Response(
                {"detail": "No tienes permisos para eliminar este usuario. Solo puedes eliminar tu propia cuenta."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el usuario pertenezca al grupo "visitante"
        if not request.user.groups.filter(name='visitante').exists():
            return Response(
                {"detail": "Solo los usuarios del grupo 'visitante' pueden eliminar su cuenta."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
@extend_schema_view(
    list=extend_schema(tags=['Editores']),
    retrieve=extend_schema(tags=['Editores']),
    create=extend_schema(exclude=True),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Editores']),
    destroy=extend_schema(tags=['Editores']),
)
class EditorViewSet(viewsets.ModelViewSet):
    serializer_class = EditorSerializer
    http_method_names = ['get', 'head', 'options', 'patch', 'delete']  # 👈 Elimina POST
    
    def get_queryset(self):
        user = self.request.user
        
        # 1. Verificar si el usuario es STAFF (Admin) O si pertenece al grupo 'editor'.
        # Nota: La verificación is_authenticated ya está implícita si el grupo existe.
        if user.is_staff or user.groups.filter(name='editor').exists():
            
            # 👇 Devolver TODOS los usuarios que pertenecen al grupo 'editor'
            # Excluimos a los que son staff (administradores) si solo quieres los editores puros.
            return User.objects.filter(groups__name='editor')
            
            # Si quieres que el admin se vea a sí mismo en esta lista (si también es editor):
            # return User.objects.filter(groups__name='editor') 
            
        # 2. Otros usuarios (visitantes autenticados, usuarios sin grupo o no autenticados)
        else:
            return User.objects.none()

    def get_permissions(self):
        # Para todas las acciones requiere autenticación
        if self.action in ['list', 'retrieve', 'partial_update', 'destroy']:  
            return [IsAuthenticated()]  
            
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        user = request.user
        
        # Verificar permisos específicos para list
        if not (user.is_staff or user.groups.filter(name='editor').exists()):
            return Response(
                {"detail": "No tienes permisos para acceder a este apartado"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        
        # Verificar permisos específicos para retrieve
        if not (user.is_staff or (user.is_authenticated and user.id == instance.id and user.groups.filter(name='editor').exists())):
            return Response(
                {"detail": "No tienes permisos para acceder a este apartado"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        # 👈 Método completamente deshabilitado
        return Response(
            {"detail": "Método POST no permitido. No se pueden crear nuevos editores a través de este endpoint."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    
    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        editor = self.get_object()
        
        # 👇 STAFF puede modificar cualquier editor
        if not request.user.is_staff:
            # 👇 EDITOR solo puede modificar su propia información
            if editor != request.user:
                return Response(
                    {"detail": "No tienes permisos para modificar esta compañía. Solo puedes modificar tu propia información."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 👇 EDITOR debe pertenecer al grupo "editor"
            if not request.user.groups.filter(name='editor').exists():
                return Response(
                    {"detail": "Solo las compañías del grupo 'editor' pueden modificar su información."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        editor = self.get_object()
        
        # 👇 STAFF puede eliminar cualquier editor
        if not request.user.is_staff:
            # 👇 EDITOR solo puede eliminar su propia cuenta
            if editor != request.user:
                return Response(
                    {"detail": "No tienes permisos para eliminar esta compañía. Solo puedes eliminar tu propia cuenta."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 👇 EDITOR debe pertenecer al grupo "editor"
            if not request.user.groups.filter(name='editor').exists():
                return Response(
                    {"detail": "Solo las compañías del grupo 'editor' pueden eliminar su cuenta."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().destroy(request, *args, **kwargs)

###############################Usuarios Admins    
@extend_schema_view(
    list=extend_schema(tags=['Administradores'],
        description="Listar todos los administradores. Solo accesible por administradores."),
    retrieve=extend_schema(tags=['Administradores'],
        description="Obtener un administrador específico. Solo accesible por administradores."),
    create=extend_schema(tags=['Administradores'],
        description="Crear un nuevo administrador. Solo accesible por administradores."),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Administradores'],
        description="Actualizar información de administrador. SOLO un administrador puede editar su propia información."),
    destroy=extend_schema(tags=['Administradores'],
        description="Eliminar administrador. SOLO un administrador puede eliminar su propia cuenta."),
)
class AdminUserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para crear y gestionar Usuarios Admins.
    - Crear: Solo administradores pueden crear otros administradores
    - Listar/Ver: Solo administradores pueden ver otros administradores  
    - Editar: Solo puede editar su propia información
    - Eliminar: Solo puede eliminar su propia cuenta
    """
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo mostrar usuarios con is_staff=True
        return User.objects.filter(is_staff=True)

    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):

        # --- Nueva Lógica ---
        origin = request.META.get('HTTP_ORIGIN', None)
        organizacion_asociar = None

        if origin:
            try:
                # Parsea la URL para obtener solo el dominio neto
                parsed_origin = urlparse(origin)
                origin_domain = f"{parsed_origin.scheme}://{parsed_origin.netloc}".lower()

                # Busca la organización por el dominio exacto
                organizacion_asociar = Organizacion.objects.get(dominio__iexact=origin_domain)
                # logger.debug(f"Coincidencia de dominio encontrada: {origin_domain} -> {organizacion_asociar.organizacion_nombre}")
            except Organizacion.DoesNotExist:
                # 🔴 DOMINIO NO COINCIDE: NO CREAR USUARIO
                return Response(
                    {
                        "detail": f"No se puede crear la cuenta. El dominio '{origin_domain}' no está autorizado para registrar usuarios."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            except Exception as e:
                # 🔴 ERROR EN LA VALIDACIÓN: NO CREAR USUARIO
                return Response(
                    {
                        "detail": "Error al validar el dominio de origen. No se puede crear la cuenta."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # 🔴 NO HAY ORIGIN: NO CREAR USUARIO
            return Response(
                {
                    "detail": "No se puede crear la cuenta. Se requiere un encabezado Origin válido."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Fin Nueva Lógica ---

        # Verificar que el usuario que hace la petición sea administrador
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para crear administradores. Solo un admin puede crear otro admin"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        # Verificar que el usuario que hace la petición sea administrador
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para listar administradores. Solo un admin puede ver otros admins"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        # Verificar que el usuario que hace la petición sea administrador
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para ver administradores. Solo un admin puede ver otros admins"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().retrieve(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Verificar que el usuario que hace la petición sea administrador
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para modificar administradores. Solo los administradores pueden editar su propia información."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 👇 VERIFICACIÓN CLAVE: Solo puede editar SU PROPIA información
        admin_a_editar = self.get_object()
        if admin_a_editar != request.user:
            return Response(
                {"detail": "No puedes modificar la información de otros administradores. Solo puedes editar tu propia información."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Verificar que el usuario que hace la petición sea administrador
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para eliminar administradores. Solo los administradores pueden eliminar su propia cuenta."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 👇 VERIFICACIÓN CLAVE: Solo puede eliminar SU PROPIA cuenta
        admin_a_eliminar = self.get_object()
        if admin_a_eliminar != request.user:
            return Response(
                {"detail": "No puedes eliminar otros administradores. Solo puedes eliminar tu propia cuenta."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)


####################################ORGANIZACIONES
@extend_schema_view(
    list=extend_schema(tags=['Organizaciones'],       
        description="""Los administradores obtienen todas las organizaciones, los editores y visitantes obtienen solamente las organizaciones a las que pertenece, editores y visitantes que no pertenezcan a ninguna organizacion les devuelve un JSON vacio, y este endpoint necesita autenticacion"""
    ),
    retrieve=extend_schema(tags=['Organizaciones'],
        description="""Lista de una organizacion en especifico"""
        ),
    create=extend_schema(
        tags=['Organizaciones'],
        examples=[
            OpenApiExample(
                'Ejemplo crear organización',
                value={
                    "organizacion_nombre": "Mi Empresa",
                    "dominio": "miempresa.com",
                    "editores": [1, 2, 3]
                },
                request_only=True,
                response_only=False
            )
        ]
    ),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Organizaciones']),
    destroy=extend_schema(tags=['Organizaciones']),
)
class OrganizacionViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizacionSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Staff ve todas las organizaciones
        if user.is_staff:
            return Organizacion.objects.all()
        
        # Editores ven SOLO las organizaciones donde son editores
        elif user.groups.filter(name='editor').exists():
            return Organizacion.objects.filter(editores=user)
        
        # Visitantes autenticados ven SOLO las organizaciones donde son visitantes
        elif user.is_authenticated and user.groups.filter(name='visitante').exists():
            return Organizacion.objects.filter(visitantes=user)
        
        # Usuarios no autenticados ven TODAS las organizaciones (solo info pública)
        else:
            return Organizacion.objects.all()

    def get_permissions(self):
        # Permitir list y retrieve sin autenticación (público)
        if self.action in ['testimonios_aprobados']:
            return [AllowAny()]
        
        # Para create, update, delete requiere autenticación
        return [IsAuthenticated()]

    def get_serializer_class(self):
        user = self.request.user
        
        # 👇 STAFF ve toda la información completa
        if user.is_staff:
            return OrganizacionSerializerStaff
        
        # 👇 EDITORES ven editores y visitantes de SUS organizaciones
        elif user.groups.filter(name='editor').exists():
            return OrganizacionSerializerEditor
        
        # 👇 VISITANTES ven solo información básica
        elif user.is_authenticated and user.groups.filter(name='visitante').exists():
            return OrganizacionSerializerPublico
        
        # 👇 USUARIOS NO AUTENTICADOS ven solo información básica
        else:
            return OrganizacionSerializerPublico



    def create(self, request, *args, **kwargs):
        # Verificar que el usuario sea staff
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para crear organizaciones. Solo el personal autorizado puede crear organizaciones."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar que no exista una organización con el mismo nombre
        organizacion_nombre = request.data.get('organizacion_nombre')
        if Organizacion.objects.filter(organizacion_nombre=organizacion_nombre).exists():
            return Response(
                {"detail": "Ya existe una organización con este nombre."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        organizacion = self.get_object()
        user = request.user
        
        # Verificar permisos: staff o editor de la organización
        if not (user.is_staff or organizacion.editores.filter(id=user.id).exists()):
            return Response(
                {"detail": "No tienes permisos para modificar esta organización."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Verificar que el usuario sea staff
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para eliminar organizaciones."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Organizaciones'],
        description="Este endpoint es para que un editor pueda agregar otros editores a su organización(Ejemplo, el editor de microsoft solo puede agregar otros editores a microsoft)",
        request=AgregarEditoresSerializer,
        responses={
            200: OpenApiResponse(description="Editores agregados exitosamente"),
            403: OpenApiResponse(description="No tienes permisos para modificar esta organización"),
            404: OpenApiResponse(description="Organización no encontrada")
        }
    )
    @action(detail=True, methods=['post'], url_path='agregar-editores', permission_classes=[IsAuthenticated])
    def agregar_editores(self, request, pk=None):
        """
        Endpoint para que un editor agregue otros editores a una organización
        """
        organizacion = self.get_object()
        user = request.user
        
        # Verificar permisos: el usuario debe ser editor de esta organización
        if not (user.is_staff or organizacion.editores.filter(id=user.id).exists()):
            return Response(
                {"detail": "No tienes permisos para modificar esta organización. Solo los editores de la organización pueden agregar otros editores."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar que el usuario sea editor (no staff intentando usar este endpoint)
        if not user.groups.filter(name='editor').exists() and not user.is_staff:
            return Response(
                {"detail": "Solo los editores pueden usar este endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AgregarEditoresSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        editores_ids = serializer.validated_data['editores']
        
        # Obtener los usuarios editores
        nuevos_editores = User.objects.filter(
            id__in=editores_ids, 
            groups__name='editor'
        )
        
        # Agregar los editores a la organización (sin eliminar los existentes)
        organizacion.editores.add(*nuevos_editores)
        
        # Obtener la lista actualizada de editores para la respuesta
        editores_actuales = organizacion.editores.all()
        editores_info = [
            {
                'id': editor.id,
                'email': editor.email,
                'username': editor.username
            } for editor in editores_actuales
        ]
        
        return Response({
            "detail": "Editores agregados exitosamente",
            "organizacion": {
                "id": organizacion.id,
                "nombre": organizacion.organizacion_nombre
            },
            "editores_actuales": editores_info,
            "editores_agregados": editores_ids
        }, status=status.HTTP_200_OK)
    
    @extend_schema(
    tags=['Organizaciones'],
    description="Este endpoint es para que un editor pueda agregar visitantes a su organización (Ejemplo, el editor de microsoft solo puede agregar otros visitantes a microsoft)",
    request=AgregarVisitantesSerializer,  # ✅ Usar el serializer correcto
    responses={
        200: OpenApiResponse(description="Visitantes agregados exitosamente"),
        403: OpenApiResponse(description="No tienes permisos para modificar esta organización"),
        404: OpenApiResponse(description="Organización no encontrada")
    }
    )
    @action(detail=True, methods=['post'], url_path='agregar-visitantes', permission_classes=[IsAuthenticated])
    def agregar_visitantes(self, request, pk=None):
        """
        Endpoint para que un editor agregue visitantes a una organización
        """
        organizacion = self.get_object()
        user = request.user
        
        # Verificar permisos: el usuario debe ser editor de esta organización
        if not (user.is_staff or organizacion.editores.filter(id=user.id).exists()):
            return Response(
                {"detail": "No tienes permisos para modificar esta organización. Solo los editores de la organización pueden agregar visitantes."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar que el usuario sea editor (no staff intentando usar este endpoint)
        if not user.groups.filter(name='editor').exists() and not user.is_staff:
            return Response(
                {"detail": "Solo los editores pueden usar este endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AgregarVisitantesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ CORREGIDO: Acceder al campo 'visitantes' en lugar de ''
        visitantes_ids = serializer.validated_data['visitantes']
        
        # Obtener los usuarios visitantes
        nuevos_visitantes = User.objects.filter(
            id__in=visitantes_ids, 
            groups__name='visitante'
        )
        
        # Agregar los visitantes a la organización (sin eliminar los existentes)
        organizacion.visitantes.add(*nuevos_visitantes)
        
        # Obtener la lista actualizada de visitantes para la respuesta
        visitantes_actuales = organizacion.visitantes.all()
        visitantes_info = [
            {
                'id': visitante.id,
                'email': visitante.email,
                'username': visitante.username
            } for visitante in visitantes_actuales
        ]
        
        return Response({
            "detail": "Visitantes agregados exitosamente",
            "organizacion": {
                "id": organizacion.id,
                "nombre": organizacion.organizacion_nombre
            },
            "visitantes_actuales": visitantes_info,
            "visitantes_agregados": list(nuevos_visitantes.values_list('id', flat=True))
        }, status=status.HTTP_200_OK)
    
    # Testimonios aprobados de una organización específica
    @extend_schema(
        tags=['Organizaciones'],
        description="Obtener todos los testimonios APROBADOS de una organización específica(Obviamente todos los que la organizacion aprobo que son los que quiere mostrar al publico). Este endpoint es público.",
        responses={200: TestimonioAprobadoSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='testimonios-aprobados', permission_classes=[AllowAny])
    def testimonios_aprobados(self, request, pk=None):
        """
        Endpoint público para obtener todos los testimonios APROBADOS de una organización específica
        """
        organizacion = self.get_object()
        
        # Obtener solo testimonios aprobados de esta organización
        testimonios_aprobados = Testimonios.objects.filter(
            organizacion=organizacion,
            estado='A'  # Solo testimonios aprobados
        ).order_by('-fecha_comentario')  # Ordenar por fecha descendente
        
        # Serializar los testimonios
        serializer = TestimonioAprobadoSerializer(testimonios_aprobados, many=True, context={'request': request})
        
        # Retornar respuesta con información adicional de la organización
        return Response({
            'organizacion': {
                'nombre': organizacion.organizacion_nombre,
            },
            'testimonios_aprobados': serializer.data,
            'total_testimonios': testimonios_aprobados.count(),
            'promedio_ranking': self._calcular_promedio_ranking(testimonios_aprobados)
        })

    def _calcular_promedio_ranking(self, testimonios):
        """Calcular el promedio de ranking de los testimonios"""
        if not testimonios:
            return 0.0
        
        from django.db.models import Avg
        promedio = testimonios.aggregate(Avg('ranking'))['ranking__avg']
        return round(promedio, 1) if promedio else 0.0

@extend_schema_view(
    list=extend_schema(tags=['Categorias']),
    retrieve=extend_schema(tags=['Categorias']),
    create=extend_schema(tags=['Categorias'], 
        description="Solo el admin crea categorias, para que los usuarios no se vuelvan locos creando categorias"),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Categorias']),
    destroy=extend_schema(tags=['Categorias']),
)
class CategoriaViewSet(viewsets.ModelViewSet):
    serializer_class = CategoriaSerializer
    
    def get_queryset(self):
        # Todos pueden ver las categorías (autenticados y no autenticados)
        return Categoria.objects.all()

    def get_permissions(self):
        # Permitir list y retrieve sin autenticación (público)
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        
        # Para create, update, delete requiere autenticación Y ser admin
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        # Verificar que el usuario sea admin (is_staff=True)
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para crear categorías. Debes ser administrador."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        # Verificar que el usuario sea admin
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para modificar categorías. Debes ser administrador."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Verificar que el usuario sea admin
        if not request.user.is_staff:
            return Response(
                {"detail": "No tienes permisos para eliminar categorías. Debes ser administrador."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    


@extend_schema_view(
    list=extend_schema(tags=['Testimonios'],
        description="Este metodo GET permite listar todas los Testimonios APROBADOS de TODAS las EMPRESAS y es LIBRE, todos los usuarios logeados y no logeados pueden visualizarlo"),
    retrieve=extend_schema(tags=['Testimonios'],
        description="Este metodo GET permite listar Testimonios especificos que han sido APROBADOS de CUALQUIER EMPRESA y es LIBRE, todos los usuarios logeados y no logeados pueden visualizarlo"),
    create=extend_schema(tags=['Testimonios'],
        description="Este metodo POST permite crear Testimonios, todos son creados por defecto con el estado E(en espera de aprobacion), todos los usuarios logeados y no logeados pueden usarlo. Los unicos que tienen prohibido realizar testimonios son los usuarios con rol de editor, porque esos usuarios son considerados una cuenta de una organizacion y no es considerado como un cliente. Los usuarios logeados como visitantes se les va a limitar que solamente realicen testimonios a las organizaciones que pertenecen, ahora los no logeados se les va a permitir que comenten todas las organizaciones que quieran. Esto es para cumplir con el requisito de integracion en de API en Sitio Externo"),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Testimonios'],
        description="Este metodo PATCH permite editar Testimonios, sin importar el estado que tenga, solamente lo puede editar El usuario que creó el testimonio (usuario_registrado)"),
    destroy=extend_schema(tags=['Testimonios'],
        description="Este metodo DELETE permite eliminar Testimonios, sin importar el estado que tenga, solamente lo puede borrar El usuario es el dueño del testimonio (usuario_registrado) O El usuario que esta asociado a la organización"))

class TestimonioViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonioSerializer

    def get_permissions(self):
        # Permitir crear testimonios sin autenticación
        if self.action in ['create', 'list', 'retrieve']:
            return [AllowAny()]
        
        # Para update y delete requiere autenticación
        return [IsAuthenticated()]

    def get_queryset(self):
        # Para list y retrieve (GET públicos), mostrar solo testimonios APROBADOS
        if self.action in ['list', 'retrieve']:
            return Testimonios.objects.filter(estado='A')
        
        # Para acciones que modifican (create, update, delete), permitir acceso a testimonios en cualquier estado
        # pero con las verificaciones de permisos en los métodos correspondientes
        return Testimonios.objects.all()

    def create(self, request, *args, **kwargs):
        # Verificar que si el usuario está autenticado, NO sea editor
        if request.user.is_authenticated:
            if request.user.groups.filter(name='editor').exists():
                return Response(
                    {
                        "detail": "Los usuarios del grupo 'editor' no pueden crear testimonios."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Solo usuarios autenticados pueden modificar testimonios
        testimonio = self.get_object()
        
        # Verificar permisos: 
        # 1. El usuario es admin O
        # 2. El usuario es el dueño del testimonio (usuario_registrado) O
        # NOTA: Los editores NO pueden editar testimonios, solo eliminarlos
        puede_editar = (
            request.user.is_staff or 
            (testimonio.usuario_registrado and testimonio.usuario_registrado == request.user)
        )
        
        if not puede_editar:
            return Response(
                {"detail": "No tienes permisos para modificar este testimonio. Solo el autor del testimonio puede modificarlo."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que no sea un testimonio anónimo
        if testimonio.usuario_registrado is None:
            return Response(
                {"detail": "Los testimonios anónimos no pueden ser modificados."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Solo usuarios autenticados pueden eliminar testimonios
        testimonio = self.get_object()
        
        # Verificar permisos:
        # 1. El usuario es admin O
        # 2. El usuario es el dueño del testimonio (usuario_registrado) O  
        # 3. El usuario es editor dueño de la organización
        puede_eliminar = (
            request.user.is_staff or 
            (testimonio.usuario_registrado and testimonio.usuario_registrado == request.user) or
            (request.user.groups.filter(name='editor').exists())
        )
        
        if not puede_eliminar:
            return Response(
                {"detail": "No tienes permisos para eliminar este testimonio. Solo el autor del testimonio o la organización dueña pueden eliminarlo."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
@extend_schema_view(
    list=extend_schema(tags=['Testimonios'],
        description="""Este endpoint tiene doble funcionalidad:
        - Para EDITORES: Muestra todos los testimonios de SUS organizaciones (menos los que tienen el estado en borrador)
        - Para VISITANTES: Muestra todos los testimonios que HAN CREADO (sin importar estado)"""),
    retrieve=extend_schema(tags=['Testimonios'],
        description="""Este endpoint tiene doble funcionalidad:
        - Para EDITORES: Muestra testimonios específicos de SUS organizaciones(menos los que tienen el estado en borrador)
        - Para VISITANTES: Muestra testimonios específicos que HAN CREADO"""),
)
class TestimonioOrganizacionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint con doble funcionalidad:
    - Editores: ven testimonios de sus organizaciones
    - Visitantes: ven sus propios testimonios
    """
    serializer_class = TestimonioSerializer
    permission_classes = [IsAuthenticated]  # 👈 Solo usuarios autenticados

    def get_queryset(self):
        user = self.request.user
        
        # Admin ve todos los testimonios, PERO EXCLUYENDO el estado 'B' (Borrador)
        if user.is_staff:
            return Testimonios.objects.all().exclude(estado='B')
        
        # Editor ve SOLO los testimonios de SUS organizaciones, 
        # PERO EXCLUYENDO el estado 'B' (Borrador).
        if user.groups.filter(name='editor').exists():
            return Testimonios.objects.filter(
                organizacion__editores=user
            ).exclude(estado='B')
        
        # Visitante ve SOLO SUS testimonios (en cualquier estado)
        if user.groups.filter(name='visitante').exists():
            return Testimonios.objects.filter(
                usuario_registrado=user
            )
        
        # Usuarios sin grupo no pueden usar este endpoint
        return Testimonios.objects.none()

    def list(self, request, *args, **kwargs):
        # Verificar permisos antes de listar
        user = request.user
        if not (user.is_staff or 
                user.groups.filter(name='editor').exists() or 
                user.groups.filter(name='visitante').exists()):
            return Response(
                {"detail": "Los usuarios anonimos no tienen permisos para usar este endpoint. Por favor creese una cuenta e inicie sesion para usar este endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        # Verificar permisos antes de recuperar un testimonio específico
        user = request.user
        if not (user.is_staff or 
                user.groups.filter(name='editor').exists() or 
                user.groups.filter(name='visitante').exists()):
            return Response(
                {"detail": "Usted no tiene permisos para usar este endpoint. Debe ser editor o visitante."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el usuario tenga acceso al testimonio específico
        testimonio = self.get_object()
        if user.groups.filter(name='visitante').exists() and testimonio.usuario_registrado != user:
            return Response(
                {"detail": "No tienes permisos para ver este testimonio. Solo puedes ver tus propios testimonios."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Testimonios'],
        description="Estadisticas de testimonios. Solamente puede ser usado por las mismas organizaciones."
    )
    @action(detail=False, methods=['get'], url_path='estadisticas')
    def estadisticas(self, request):
        user = request.user
        
        if not user.groups.filter(name='editor').exists() and not user.is_staff:
            return Response(
                {"detail": "Usted no es un editor, no puede visualizar las estadísticas."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Estadísticas por organización
        if user.is_staff:
            # Admin ve estadísticas de todas las organizaciones
            organizaciones_stats = Organizacion.objects.annotate(
                total_testimonios=models.Count('organizacion'),
                aprobados=models.Count('organizacion', filter=models.Q(organizacion__estado='A')),
                en_espera=models.Count('organizacion', filter=models.Q(organizacion__estado='E')),
                rechazados=models.Count('organizacion', filter=models.Q(organizacion__estado='R'))
            )
        
        data = []
        for org in organizaciones_stats:
            data.append({
                'organizacion_id': org.id,
                'organizacion_nombre': org.organizacion_nombre,
                'estadisticas': {
                    'total_testimonios': org.total_testimonios,
                    'aprobados': org.aprobados,
                    'en_espera': org.en_espera,
                    'rechazados': org.rechazados
                }
            })
        
        return Response(data)
    
@extend_schema_view(
    partial_update=extend_schema(
        tags=['Testimonios'],
        description="Este endpoint permite que el dueño de la organización cambie el estado de los testimonios de SU organización (A: Aprobado, E: Espera, R: Rechazado). Los editores o administradores no pueden cambiar estados de testimonios a borrador, solamente el usuario visitante que creo el testimonio puede cambiar testimonios a Borrador. El autor del testimonio no puede cambiar un estado Aprobado a otro estado... Solamente se puede agregar feedback a los estados rechazados, si cambio a cualquier otro estado no puedo agregar el feedback... y ningun estado rechazado puede cambiar su feedback, si tengo un estado rechazado y le cambio el estado automaticamente se borra el campo feedback y queda null"
    )
)
class CambiarEstadoTestimonioViewSet(viewsets.ModelViewSet):
    """
    Endpoint para que los dueños de organizaciones cambien el estado de los testimonios de SUS organizaciones
    """
    serializer_class = CambiarEstadoTestimonioSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']  # Solo permitir PATCH

    def get_queryset(self):
        user = self.request.user
        
        # 👇 CAMBIO IMPORTANTE: Admin y Editores pueden VER todos los testimonios
        # La verificación real de permisos se hace en partial_update
        if user.is_staff or user.groups.filter(name='editor').exists():
            return Testimonios.objects.all()
        
        # 👇 Para usuarios visitantes, también devolver todos los testimonios
        # pero luego bloquear en partial_update
        return Testimonios.objects.all()

    def partial_update(self, request, *args, **kwargs):
        testimonio = self.get_object()
        user = request.user
        nuevo_estado = request.data.get('estado')
        
        # 1. Crear una copia mutable de los datos de la petición (request.data)
        mutable_data = request.data.copy() 
        
        # 1. Verificar permisos (Se mantiene tu lógica de permisos)
        es_admin = user.is_staff
        es_editor = user.groups.filter(name='editor').exists()
        es_autor = (testimonio.usuario_registrado and testimonio.usuario_registrado == user)
        es_editor_con_permisos = False
        
        # Lógica de permisos de Autor (actualizada en la respuesta anterior para B <-> E)
        if es_autor:
            # Revalidación de movimientos de autor (B <-> E, E/R -> B)
            if nuevo_estado and nuevo_estado != testimonio.estado:
                es_valido_b_a_e = (testimonio.estado == 'B' and nuevo_estado == 'E')
                es_valido_e_r_a_b = (nuevo_estado == 'B' and testimonio.estado in ['E', 'R'])
                
                if not (es_valido_b_a_e or es_valido_e_r_a_b):
                     return Response(
                        {"detail": f"Usted, como autor, solo puede cambiar el estado de su testimonio de 'B' a 'E', o de 'E' o 'R' a 'B'."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
        # Lógica de permisos de Editor/Admin
        elif es_editor:
            organizacion_del_testimonio = testimonio.organizacion
            if organizacion_del_testimonio.editores.filter(id=user.id).exists():
                es_editor_con_permisos = True
        
        if not (es_autor or es_admin or es_editor_con_permisos):
            return Response(
                {"detail": "Usted no tiene permisos para cambiar el estado de testimonios. Solo el autor, el administrador o un editor de la organización asociada puede hacerlo."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 2. Manejo de Limpieza de Feedback (¡SOLUCIÓN AL ERROR!)
        # Si se está cambiando de RECHAZADO a otro estado (que no sea R ni None), limpiar feedback
        if testimonio.estado == 'R' and nuevo_estado != 'R' and nuevo_estado is not None:
             # Aquí modificamos la copia mutable, NO request.data
            mutable_data['feedback'] = None 
        
        # 3. Validación de Feedback (Mantienes tu lógica: R requiere feedback)
        if nuevo_estado == 'R':
            feedback = mutable_data.get('feedback', '').strip()
            # Si no se proporciona feedback en la petición, verificar si ya tiene uno en el modelo
            if not feedback and not testimonio.feedback:
                return Response(
                    {
                        "detail": "No se puede cambiar el estado a RECHAZADO sin proporcionar feedback."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 4. Llamar al serializador con los datos modificados (mutable_data)
        serializer = self.get_serializer(
            testimonio, 
            data=mutable_data, # <--- ¡USAMOS LOS DATOS MUTABLES/CORREGIDOS!
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)
    

@extend_schema_view(
    partial_update=extend_schema(
        tags=['Testimonios'],
        description="""Este endpoint permite que editores/administradores agreguen feedback 
        a testimonios en estado ESPERA. Automáticamente cambia el estado a RECHAZADO.
        
        Reglas:
        1. Solo testimonios en estado ESPERA
        2. Feedback no puede estar vacío
        3. Automáticamente cambia estado a RECHAZADO
        4. Solo editores de la organización o administradores""",
        request=FeedbackSerializer,
        responses={
            200: OpenApiResponse(description="Feedback agregado exitosamente. Testimonio ahora está RECHAZADO"),
            400: OpenApiResponse(description="Testimonio no está en estado ESPERA o feedback vacío"),
            403: OpenApiResponse(description="No tienes permisos")
        }
    )
)
class FeedbackTestimonioViewSet(viewsets.GenericViewSet):
    """
    Endpoint para agregar feedback a testimonios en ESPERA
    """
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]
    queryset = Testimonios.objects.all()
    http_method_names = ['patch']  # Solo permitir PATCH

    def partial_update(self, request, *args, **kwargs):
        testimonio = self.get_object()
        user = request.user
        
        # Verificar permisos:
        # 1. Es administrador (is_staff=True) O
        # 2. Es editor de la organización del testimonio
        puede_modificar = (
            user.is_staff or 
            (user.groups.filter(name='editor').exists() and 
             testimonio.organizacion.editores.filter(id=user.id).exists())
        )
        
        if not puede_modificar:
            return Response(
                {
                    "detail": "No tienes permisos para agregar feedback a este testimonio. "
                    "Solo el administrador o un editor de la organización asociada puede hacerlo."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el testimonio esté en ESPERA
        if testimonio.estado != 'E':
            return Response(
                {
                    "detail": f"No se puede agregar feedback. "
                    f"El testimonio está en estado {testimonio.get_estado_display()}. "
                    f"Solo se puede agregar feedback a testimonios en estado ESPERA."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que solo se envíe el campo feedback
        campos_permitidos = ['feedback']
        campos_recibidos = set(request.data.keys())
        campos_no_permitidos = campos_recibidos - set(campos_permitidos)
        
        if campos_no_permitidos:
            return Response(
                {
                    "detail": f"No puedes modificar los siguientes campos: {', '.join(campos_no_permitidos)}. "
                    f"Solo puedes agregar feedback."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Serializar y actualizar
        serializer = self.get_serializer(testimonio, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Guardar el feedback (automáticamente cambiará estado a RECHAZADO)
        self.perform_update(serializer)
        
        # Obtener información actualizada
        testimonio.refresh_from_db()
        
        return Response({
            "detail": "Feedback agregado exitosamente. El testimonio ha sido RECHAZADO.",
            "testimonio": {
                "id": testimonio.id,
                "usuario": testimonio.usuario_registrado.username if testimonio.usuario_registrado else testimonio.usuario_anonimo_username,
                "organizacion": testimonio.organizacion.organizacion_nombre,
                "comentario": testimonio.comentario,
                "feedback": testimonio.feedback,
                "estado": testimonio.get_estado_display(),
                "estado_codigo": testimonio.estado,
                "fecha_comentario": testimonio.fecha_comentario,
                "fecha_rechazo": testimonio.fecha_comentario  # Podrías agregar un campo específico
            },
            "actualizado_por": {
                "id": user.id,
                "username": user.username,
                "rol": "administrador" if user.is_staff else "editor",
                "organizacion": testimonio.organizacion.organizacion_nombre if not user.is_staff else None
            },
            "nota": "El feedback fue enviado al usuario automáticamente."
        }, status=status.HTTP_200_OK)
    
    def perform_update(self, serializer):
        serializer.save()