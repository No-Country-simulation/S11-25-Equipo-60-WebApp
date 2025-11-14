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
    # Campo para mostrar los nombres de los grupos
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = User

        fields = [
            'id', 'username', 'email', 'password', 'groups', 'date_joined'
        ]
        read_only_fields = ['groups', 'date_joined']

    
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
    # Campo para mostrar los nombres de los grupos
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'groups','date_joined'
        ]
        read_only_fields = ['groups', 'date_joined']
    
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
    
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'editor_categoria', 'categoria_texto', 'fecha_registro']
        read_only_fields = ['editor_categoria', 'fecha_registro']

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
        validated_data['editor_categoria'] = self.context['request'].user
        validated_data['fecha_registro'] = timezone.now()
        return super().create(validated_data)


class TabsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tabs
        fields = ['id', 'editor_tabs', 'tabs_texto', 'fecha_registro']
        read_only_fields = ['editor_tabs', 'fecha_registro']

    def validate(self, data):
        model_fields = {field.name for field in Tabs._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        
        return data

    def create(self, validated_data):
        # Asigna automáticamente el usuario actual al crear
        validated_data['editor_tabs'] = self.context['request'].user
        validated_data['fecha_registro'] = timezone.now()
        return super().create(validated_data)


class EstadosSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Estados
        fields = ['id', 'editor_estado', 'estado', 'estado_display', 'fecha_registro']
        read_only_fields = ['editor_estado', 'fecha_registro']

    def validate(self, data):
        model_fields = {field.name for field in Estados._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        
        return data

    def create(self, validated_data):
        # Asigna automáticamente el usuario actual al crear
        validated_data['editor_estado'] = self.context['request'].user
        validated_data['fecha_registro'] = timezone.now()
        return super().create(validated_data)