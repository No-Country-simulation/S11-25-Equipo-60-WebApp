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

class CuentaViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = CuentaSerializer
    

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
        

        return Response(
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