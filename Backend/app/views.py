from rest_framework import viewsets, status, generics
from app.serializers import *

from app.models import *
# JWT
from rest_framework.permissions import IsAuthenticated, AllowAny
#DRF SPECTACULAR
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response

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
        
        return Response({
            'user_id': user.id,  # 👈 Agregar el ID del usuario
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    

@extend_schema_view(
    list=extend_schema(tags=['User']),
    retrieve=extend_schema(tags=['User']),
    create=extend_schema(tags=['User']),  # Excluye el create genérico
    methods=['POST'], tags=['User'], # 👈 Asegura que el método POST también tenga la etiqueta 'User'
    update=extend_schema(exclude=True),  # Oculta el método PUT (update)
    partial_update=extend_schema(tags=['User']),
    destroy=extend_schema(tags=['User']),
)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    

    def get_queryset(self):
        if self.action == 'list':
            # 🔓 TODOS los usuarios (autenticados y no autenticados) ven SOLO usuarios del grupo "visitante"
            return User.objects.filter(groups__name='visitante', is_staff=False)
                
        # Para otras acciones (retrieve, partial_update, destroy), usamos el queryset por defecto
        return User.objects.filter(groups__name='visitante')


    def get_permissions(self):
        # Mantenemos la configuración para que 'list' y 'create' sean libres (AllowAny).
        if self.action in ['create', 'list', 'retrieve']: 
            return [AllowAny()]  
        
        elif self.action in ['partial_update', 'destroy']:  
            # Aquí se requiere autenticación para ver/modificar un recurso individual.
            return [IsAuthenticated()]  
            
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Crear usuario con contraseña hasheada
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        # Asignar automáticamente al grupo "visitante"
        try:
            grupo_visitante = Group.objects.get(name='visitante')
            user.groups.add(grupo_visitante)
        except Group.DoesNotExist:
            # Si el grupo no existe, lo creamos (fallback)
            grupo_visitante = Group.objects.create(name='visitante')
            user.groups.add(grupo_visitante)

        return Response(
            {
                "message": "Usuario creado exitosamente y asignado al grupo 'visitante'",
                "user_id": user.id
            },
            status=status.HTTP_201_CREATED
        )
    
   
    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        # Verificar que el usuario solo pueda modificar su propia información
        usuario = self.get_object()
        if usuario != request.user:
            return Response(
                {"detail": "No tienes permisos para modificar este usuario. Solo puedes modificar tu propia información."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el usuario pertenezca al grupo "visitante"
        if not request.user.groups.filter(name='visitante').exists():
            return Response(
                {"detail": "Solo los usuarios del grupo 'visitante' pueden modificar su información."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Verificar que el usuario solo pueda eliminar su propia cuenta
        usuario = self.get_object()
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
    list=extend_schema(tags=['Compañias']),
    retrieve=extend_schema(tags=['Compañias']),
    create=extend_schema(tags=['Compañias']),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Compañias']),
    destroy=extend_schema(tags=['Compañias']),
)
class CompaniaViewSet(viewsets.ModelViewSet):
    serializer_class = CompaniaSerializer
    
    def get_queryset(self):
        if self.action == 'list':
            # 🔓 TODOS los usuarios (autenticados y no autenticados) ven SOLO usuarios del grupo "editor"
            return User.objects.filter(groups__name='editor', is_staff=False)
                
        # Para otras acciones (retrieve, partial_update, destroy), filtramos por grupo "editor"
        return User.objects.filter(groups__name='editor')

    def get_permissions(self):
        # Permitir crear Compañias sin autenticación
        if self.action in ['create', 'list', 'retrieve']: 
            return [AllowAny()]  
        
        # Para otras acciones requiere autenticación
        elif self.action in ['partial_update', 'destroy']:  
            return [IsAuthenticated()]  
            
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Crear usuario (compañía) con contraseña hasheada
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        
        # Asignar automáticamente al grupo "editor"
        try:
            grupo_editor = Group.objects.get(name='editor')
            user.groups.add(grupo_editor)
        except Group.DoesNotExist:
            # Si el grupo no existe, lo creamos (fallback)
            grupo_editor = Group.objects.create(name='editor')
            user.groups.add(grupo_editor)

        return Response(
            {
                "message": "Compañía creada exitosamente y asignada al grupo 'editor'",
                "user_id": user.id
            },
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(
                {"detail": "Método PUT no permitido. Use PATCH en su lugar."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        # Verificar que la compañía solo pueda modificar su propia información
        compania = self.get_object()
        if compania != request.user:
            return Response(
                {"detail": "No tienes permisos para modificar esta compañía. Solo puedes modificar tu propia información."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el usuario pertenezca al grupo "editor"
        if not request.user.groups.filter(name='editor').exists():
            return Response(
                {"detail": "Solo las compañías del grupo 'editor' pueden modificar su información."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Verificar que la compañía solo pueda eliminar su propia cuenta
        compania = self.get_object()
        if compania != request.user:
            return Response(
                {"detail": "No tienes permisos para eliminar esta compañía. Solo puedes eliminar tu propia cuenta."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el usuario pertenezca al grupo "editor"
        if not request.user.groups.filter(name='editor').exists():
            return Response(
                {"detail": "Solo las compañías del grupo 'editor' pueden eliminar su cuenta."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
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
    ViewSet para crear y gestionar usuarios administradores.
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

@extend_schema_view(
    list=extend_schema(tags=['Organizaciones']),
    retrieve=extend_schema(tags=['Organizaciones']),
    create=extend_schema(tags=['Organizaciones']),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Organizaciones']),
    destroy=extend_schema(tags=['Organizaciones']),
)
class OrganizacionViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizacionSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Para list, retrieve y acciones personalizadas, todos pueden ver las organizaciones
        if self.action in ['list', 'retrieve', 'testimonios_aprobados']:
            return Organizacion.objects.all()
        
        elif self.action in ['partial_update', 'destroy']:
            if user.is_authenticated:
                if user.is_staff:
                    return Organizacion.objects.all()
                elif user.groups.filter(name='editor').exists():
                    return Organizacion.objects.filter(usuario_organizacion=user)
        
        # Para create y otras acciones, requerir autenticación
        return Organizacion.objects.none()
    
    def get_permissions(self):
        # Permitir list y retrieve sin autenticación (público)
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        
        # Para create, update, delete requiere autenticación y ser editor/admin
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        # Verificar que el usuario pertenezca al grupo "editor"
        if not request.user.groups.filter(name='editor').exists():
            return Response(
                {"detail": "No tienes permisos para crear organizaciones. Debes ser del grupo 'editor'."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar que no exista una organización con el mismo nombre para este usuario
        organizacion_nombre = request.data.get('organizacion_nombre')
        if Organizacion.objects.filter(
            usuario_organizacion=request.user, 
            organizacion_nombre=organizacion_nombre
        ).exists():
            return Response(
                {"detail": "Ya existe una organización con este nombre para tu cuenta."},
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
        # Verificar que el usuario sea el dueño de la organización o admin
        organizacion = self.get_object()
        if not (request.user.is_staff or organizacion.usuario_organizacion == request.user):
            return Response(
                {"detail": "No tienes permisos para modificar esta organización."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Verificar que el usuario sea el dueño de la organización o admin
        organizacion = self.get_object()
        if not (request.user.is_staff or organizacion.usuario_organizacion == request.user):
            return Response(
                {"detail": "No tienes permisos para eliminar esta organización."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    # Testimonios aprobados de una organización específica
    @extend_schema(
        tags=['Organizaciones'],
        description="Obtener todos los testimonios APROBADOS de una organización específica(Obviamente todos los que la organizacion aprobo que son los que quiere mostrar al publico). Este endpoint es público.",
        responses={200: TestimonioAprobadoSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='testimonios', permission_classes=[AllowAny])
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
                'id': organizacion.id,
                'nombre': organizacion.organizacion_nombre,
                'usuario_organizacion': organizacion.usuario_organizacion.email
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
        description="Este metodo POST permite crear Testimonios, todos son creados por defecto con el estado E(en espera de aprobacion), todos los usuarios logeados y no logeados pueden usarlo. Los unicos que tienen prohibido realizar testimonios son los usuarios con rol de editor, porque esos usuarios son considerados una cuenta de una organizacion y no es considerado como un cliente"),
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
            (request.user.groups.filter(name='editor').exists() and 
             testimonio.organizacion.usuario_organizacion == request.user)
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
        - Para EDITORES: Muestra todos los testimonios de SUS organizaciones (sin importar estado)
        - Para VISITANTES: Muestra todos los testimonios que HAN CREADO (sin importar estado)"""),
    retrieve=extend_schema(tags=['Testimonios'],
        description="""Este endpoint tiene doble funcionalidad:
        - Para EDITORES: Muestra testimonios específicos de SUS organizaciones
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
        
        # Admin ve todos los testimonios
        if user.is_staff:
            return Testimonios.objects.all()
        
        # Editor ve SOLO los testimonios de SUS organizaciones (en cualquier estado)
        if user.groups.filter(name='editor').exists():
            return Testimonios.objects.filter(
                organizacion__usuario_organizacion=user
            )
        
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
        
        if user.groups.filter(name='editor').exists() and testimonio.organizacion.usuario_organizacion != user:
            return Response(
                {"detail": "No tienes permisos para ver este testimonio. Solo puedes ver testimonios de tus organizaciones."},
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
        else:
            # Editor ve solo sus organizaciones
            organizaciones_stats = Organizacion.objects.filter(usuario_organizacion=user).annotate(
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
        description="Este endpoint permite que el dueño de la organización cambie el estado de los testimonios de SU organización (A: Aprobado, E: Espera, R: Rechazado)"
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
        
        # Verificar permisos de manera más estricta
        es_admin = user.is_staff
        es_editor_con_permisos = (
            user.groups.filter(name='editor').exists() and 
            testimonio.organizacion.usuario_organizacion == user
        )
        
        if not (es_admin or es_editor_con_permisos):
            return Response(
                {"detail": "Usted no tiene permisos para cambiar el estado de testimonios. Solo el dueño de la organización puede hacerlo."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)