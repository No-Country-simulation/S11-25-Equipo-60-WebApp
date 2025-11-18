from rest_framework import serializers
from django.contrib.auth import get_user_model
from app.models import *
from django.contrib.auth.models import Group
# Agrega estos imports al inicio del archivo
from django.utils import timezone

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        User = get_user_model()  # Obtiene el modelo de usuario actual
        try:
            user = User.objects.get(email=email)  # Busca el usuario por email
        except User.DoesNotExist:
            raise serializers.ValidationError(('Invalid email or password.'))
        if not user.check_password(password):  # Verifica la contraseña
            raise serializers.ValidationError(('Invalid email or password.'))
        
        attrs['user'] = user
        return attrs
    
# Nuevo serializador para el refresh token
class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User

        fields = [
            'id', 'username', 'email', 'password', 'date_joined'
        ]
        read_only_fields = ['date_joined']

    
    #Validacion para no colocar campos adicionales en peticion POST/PATCH en herramientas como Postman
    def validate(self, data):
        model_fields = {field.name for field in User._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        return data
    
    def create(self, validated_data):
        # Crear usuario con grupo "visitante"
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        # Asignar grupo "visitante"
        grupo_visitante = Group.objects.get(name='visitante')
        user.groups.add(grupo_visitante)
        
        return user
    
class CompaniaSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password','date_joined'
        ]
        read_only_fields = ['date_joined']
    
    def validate(self, data):
        model_fields = {field.name for field in User._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        return data
    
    def create(self, validated_data):
        # Crear compañía con grupo "editor"
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        # Asignar grupo "editor"
        grupo_editor = Group.objects.get(name='editor')
        user.groups.add(grupo_editor)
        
        return user
    
class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'date_joined'
        ]
        read_only_fields = ['date_joined', 'is_staff', 'is_active', 'is_superuser']
    
    def validate(self, data):
        model_fields = {field.name for field in User._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        return data
    
    def create(self, validated_data):
        # Crear usuario con todos los permisos de administrador
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_staff=True,        # 👈 Staff activado
            is_active=True,       # 👈 Usuario activo
            is_superuser=True     # 👈 Superusuario
        )
        
        # Los administradores NO tienen grupos específicos
        # user.groups.clear()  # Opcional: limpiar grupos si es necesario
        
        return user
       
class OrganizacionSerializer(serializers.ModelSerializer):
    usuario_organizacion = serializers.CharField(source='usuario_organizacion.email', read_only=True)

    class Meta:
        model = Organizacion
        fields = ['id', 'usuario_organizacion', 'organizacion_nombre', 'fecha_registro']
        read_only_fields = ['fecha_registro', 'usuario_organizacion']

    def validate(self, data):
        model_fields = {field.name for field in Organizacion._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        
        # Validar que el nombre de organización sea único
        organizacion_nombre = data.get('organizacion_nombre')
        if organizacion_nombre and Organizacion.objects.filter(organizacion_nombre=organizacion_nombre).exists():
            raise serializers.ValidationError({
                "organizacion_nombre": "Ya existe una organización con este nombre."
            })
        
        return data

    def create(self, validated_data):
        # Asigna automáticamente el usuario actual al crear
        validated_data['usuario_organizacion'] = self.context['request'].user
        validated_data['fecha_registro'] = timezone.now()
        return super().create(validated_data)

##Este es la respuesta que se va a mostrar de los endpoints aprobados cuando una persona quiere visualizar los testimonios de 
##una organizacion en especifico
class TestimonioAprobadoSerializer(serializers.ModelSerializer):
    usuario_registrado = serializers.StringRelatedField(read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.categoria_texto', read_only=True)

    class Meta:
        model = Testimonios
        fields = [
            'id', 'usuario_registrado', 'usuario_anonimo_email', 
            'usuario_anonimo_username', 'api_key', 'categoria', 
            'categoria_nombre', 'comentario_texto', 'fecha_comentario', 
            'ranking'
        ]
        # 👆 Excluimos: 'organizacion', 'organizacion_nombre', 'estado'

class CategoriaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categoria
        fields = ['id', 'categoria_texto', 'fecha_registro']
        read_only_fields = ['fecha_registro']

    def validate(self, data):
        model_fields = {field.name for field in Categoria._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        
        return data

    def create(self, validated_data):
        # Asigna automáticamente el usuario actual al crear
        validated_data['fecha_registro'] = timezone.now()
        return super().create(validated_data)


class TestimonioSerializer(serializers.ModelSerializer):
    usuario_registrado = serializers.StringRelatedField(read_only=True)
    organizacion_nombre = serializers.CharField(source='organizacion.organizacion_nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.categoria_texto', read_only=True)

    # Definir el ranking con validación de rango
    ranking = serializers.DecimalField(
        max_digits=3, 
        decimal_places=1,
        min_value=1,  # Valor mínimo
        max_value=5,  # Valor máximo
        error_messages={
            'min_value': 'El ranking debe ser como mínimo 1.',
            'max_value': 'El ranking no puede ser mayor a 5.'
        }
    )
    # Hacer el estado como campo oculto con valor por defecto
    estado = serializers.CharField(default='E', read_only=True)

    # Hacer estos campos opcionales para entrada
    usuario_anonimo_username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    usuario_anonimo_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True) 
    api_key = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Testimonios
        fields = [
            'id', 'organizacion', 'organizacion_nombre',  'usuario_registrado',  'usuario_anonimo_email', 
            'usuario_anonimo_username', 
            'api_key', 'categoria',  'categoria_nombre', 'comentario_texto', 'fecha_comentario', 
            'ranking', 'estado'
        ]
        read_only_fields = ['usuario_registrado', 'fecha_comentario', 'organizacion_nombre', 'categoria_nombre', 'estado']

    def validate(self, data):
        model_fields = {field.name for field in Testimonios._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        
        # Validación adicional para ranking
        ranking = data.get('ranking')
        if ranking is not None:
            if ranking < 1 or ranking > 5:
                raise serializers.ValidationError({
                    "ranking": "El ranking debe estar entre 1 y 5."
                })
        
        request = self.context.get('request')
        organizacion = data.get('organizacion')
        usuario_anonimo_username = data.get('usuario_anonimo_username')
        usuario_anonimo_email = data.get('usuario_anonimo_email')

        # Validaciones para usuarios autenticados
        if request and request.user.is_authenticated:
            if organizacion:
                # Verificar si ya existe un testimonio de este usuario para esta organización
                if Testimonios.objects.filter(
                    organizacion=organizacion, 
                    usuario_registrado=request.user
                ).exists():
                    raise serializers.ValidationError({
                        "organizacion": "Ya has creado un testimonio para esta organización. Solo puedes crear uno por organización."
                    })
        
        # Validaciones para usuarios NO autenticados
        else:
            # Para usuarios no autenticados, validar que proporcionen ambos campos anónimos
            if not usuario_anonimo_username:
                raise serializers.ValidationError({
                    "usuario_anonimo_username": "Este campo es requerido para usuarios no autenticados."
                })
            
            if not usuario_anonimo_email:
                raise serializers.ValidationError({
                    "usuario_anonimo_email": "Este campo es requerido para usuarios no autenticados."
                })
            
            # Validar que no exista un testimonio anónimo con la misma combinación
            if organizacion and usuario_anonimo_username and usuario_anonimo_email:
                if Testimonios.objects.filter(
                    organizacion=organizacion,
                    usuario_anonimo_username=usuario_anonimo_username,
                    usuario_anonimo_email=usuario_anonimo_email,
                    usuario_registrado__isnull=True  # Solo testimonios anónimos
                ).exists():
                    raise serializers.ValidationError({
                        "detail": "Ya existe un testimonio anónimo para esta organización con el mismo nombre de usuario y email."
                    })
        
        return data

    def create(self, validated_data):
        # Obtener el usuario del contexto (JWT)
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            # Usuario autenticado: asignar usuario y limpiar campos anónimos automáticamente
            validated_data['usuario_registrado'] = request.user
            validated_data['usuario_anonimo_username'] = None
            validated_data['usuario_anonimo_email'] = None  # 👈 Agrega esta línea
            validated_data['api_key'] = None
        else:
            # Usuario no autenticado: asegurar que usuario_registrado sea None
            validated_data['usuario_registrado'] = None
            # Si no se proporcionó api_key, establecerlo como None
            if 'api_key' not in validated_data or not validated_data['api_key']:
                validated_data['api_key'] = None
        
        # La fecha se establece automáticamente por auto_now_add=True
        return super().create(validated_data)
    
class CambiarEstadoTestimonioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonios
        fields = ['estado']
    
    def validate_estado(self, value):
        """Validar que el estado sea uno de los permitidos"""
        estados_permitidos = ['A', 'E', 'R']  # Aprobado, Espera, Rechazado
        if value not in estados_permitidos:
            raise serializers.ValidationError(
                f"Estado no válido. Los estados permitidos son: {', '.join(estados_permitidos)}"
            )
        return value
    
class OrganizacionConTestimoniosSerializer(serializers.ModelSerializer):
    usuario_organizacion = serializers.CharField(source='usuario_organizacion.email', read_only=True)
    testimonios_aprobados = serializers.SerializerMethodField()
    total_testimonios_aprobados = serializers.ReadOnlyField()
    promedio_ranking = serializers.ReadOnlyField()

    class Meta:
        model = Organizacion
        fields = [
            'id', 'usuario_organizacion', 'organizacion_nombre', 'fecha_registro',
            'testimonios_aprobados', 'total_testimonios_aprobados', 'promedio_ranking'
        ]
        read_only_fields = ['fecha_registro', 'usuario_organizacion']

    def get_testimonios_aprobados(self, obj):
        """Obtener solo testimonios aprobados de esta organización"""
        testimonios_aprobados = obj.organizacion.filter(estado='A')
        return TestimonioSerializer(testimonios_aprobados, many=True, context=self.context).data
