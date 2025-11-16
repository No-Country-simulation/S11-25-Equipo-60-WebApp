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
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.id,  # 👈 Agregar el ID del usuario
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
            user = self.request.user
            
            # 1. Si el usuario está autenticado Y es staff (Admin)
            if user.is_authenticated and user.is_staff:
                # El administrador visualiza TODOS los usuarios.
                return User.objects.all()
            
            # 2. Si el usuario NO es staff (incluye usuarios anónimos o no-admin autenticados)
            else:
                # Visualiza todos los usuarios EXCEPTO los que son staff (admin).
                # Es decir, solo visualiza usuarios donde is_staff es False.
                return User.objects.filter(is_staff=False)
                
        # Para otras acciones (retrieve, partial_update, destroy), usamos el queryset por defecto
        # (aunque los permisos restringirán quién puede acceder a qué ID).
        return super().get_queryset()


    def get_permissions(self):
        # Mantenemos la configuración para que 'list' y 'create' sean libres (AllowAny).
        if self.action in ['create', 'list']: 
            return [AllowAny()]  
        
        elif self.action in ['retrieve', 'partial_update', 'destroy']:  
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
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs) 
    
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
        # Filtrar usuarios que pertenecen al grupo "editor"
        if self.action == 'list':
            user = self.request.user
            
            # Obtener todos los usuarios que tienen el grupo "editor"
            usuarios_editores = User.objects.filter(groups__name='editor')
            
            # 1. Si el usuario está autenticado Y es staff (Admin)
            if user.is_authenticated and user.is_staff:
                # El administrador visualiza TODAS las Compañias (editores)
                return usuarios_editores
            
            # 2. Si el usuario NO es staff
            else:
                # Visualiza solo las Compañias que NO son staff
                return usuarios_editores.filter(is_staff=False)
                
        return User.objects.filter(groups__name='editor')

    def get_permissions(self):
        # Permitir crear Compañias sin autenticación
        if self.action in ['create', 'list']: 
            return [AllowAny()]  
        
        # Para otras acciones requiere autenticación
        elif self.action in ['retrieve', 'partial_update', 'destroy']:  
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
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    

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
        
        # Para list y retrieve, todos pueden ver las organizaciones
        if self.action in ['list', 'retrieve']:
            return Organizacion.objects.all()
        
        # Usuario normal (visitante) no ve organizaciones (o podría ver algunas según tu lógica)
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

@extend_schema_view(
    list=extend_schema(tags=['Categorias']),
    retrieve=extend_schema(tags=['Categorias']),
    create=extend_schema(tags=['Categorias']),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Categorias']),
    destroy=extend_schema(tags=['Categorias']),
)
class CategoriaViewSet(viewsets.ModelViewSet):
    serializer_class = CategoriaSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Si es admin, puede ver todas las categorías
        if user.is_authenticated and user.is_staff:
            return Categoria.objects.all()
        
        # Si es editor, solo puede ver sus propias categorías
        if user.is_authenticated and user.groups.filter(name='editor').exists():
            return Categoria.objects.filter(editor_categoria=user)
        
        # Usuarios no autenticados o sin permisos no ven nada
        return Categoria.objects.none()

    def get_permissions(self):
        # Solo usuarios autenticados pueden realizar cualquier acción
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        # Verificar que el usuario pertenezca al grupo "editor"
        if not request.user.groups.filter(name='editor').exists():
            return Response(
                {"detail": "No tienes permisos para crear categorías. Debes ser del grupo 'editor'."},
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

@extend_schema_view(
    list=extend_schema(tags=['Testimonios']),
    retrieve=extend_schema(tags=['Testimonios']),
    create=extend_schema(tags=['Testimonios']),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(tags=['Testimonios']),
    destroy=extend_schema(tags=['Testimonios']),
)
class TestimonioViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonioSerializer
    permission_classes = [IsAuthenticated]  # Requiere autenticación

    def get_queryset(self):
        user = self.request.user
        
        # Admin ve todos los testimonios
        if user.is_staff:
            return Testimonios.objects.all()
        
        # Editor ve solo testimonios de sus organizaciones/categorías
        if user.groups.filter(name='editor').exists():
            return Testimonios.objects.filter(
                models.Q(organizacion__usuario_organizacion=user) |
                models.Q(categoria__editor_categoria=user)
            ).distinct()
        
        # Usuario normal ve solo sus propios testimonios
        return Testimonios.objects.filter(usuario_registrado=user)

    def create(self, request, *args, **kwargs):
        # Verificar que el usuario NO sea editor
        if request.user.groups.filter(name='editor').exists():
            return Response(
                {
                    "detail": "Los usuarios del grupo 'editor' no pueden crear testimonios. Solo los visitantes pueden crear testimonios."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el usuario sea visitante
        if not request.user.groups.filter(name='visitante').exists():
            return Response(
                {
                    "detail": "Solo los usuarios del grupo 'visitante' pueden crear testimonios."
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