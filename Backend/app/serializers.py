from rest_framework import serializers
from django.contrib.auth import get_user_model
from app.models import *
from django.contrib.auth.models import Group
# Agrega estos imports al inicio del archivo
from django.utils import timezone

######################################33LOGIN

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
    
#################################3 TOKEN
class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()

################################# USUARIOS VISITANTES
class UsuarioVisitanteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,  # 👈 Validación adicional
        error_messages={
            'min_length': 'La contraseña debe tener al menos 8 caracteres.'
        }
    )

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

################################ USUARIOS EDITORES    
class EditorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,  # 👈 Validación adicional
        error_messages={
            'min_length': 'La contraseña debe tener al menos 8 caracteres.'
        }
    )
    
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

########################### USUARIOS ADMINS    
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


class CategoriaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categoria
        fields = ['id', 'nombre_categoria', 'icono', 'color', 'fecha_registro']
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



################################## ORGANIZACION       
class OrganizacionSerializer(serializers.ModelSerializer):
    editores = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.filter(groups__name='editor'), 
        required=False,
        write_only=True
    )

    class Meta:
        model = Organizacion
        fields = [
            'id', 'organizacion_nombre', 
            'dominio', 'api_key', 'editores',
        ]
        read_only_fields = ['fecha_registro']

    def get_editores_emails(self, obj):
        return [editor.email for editor in obj.editores.all()]

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
        
        # Validar que el dominio sea único
        dominio = data.get('dominio')
        if dominio and Organizacion.objects.filter(dominio=dominio).exists():
            raise serializers.ValidationError({
                "dominio": "Ya existe una organización con este dominio."
            })
        
        return data

    def create(self, validated_data):
        editores_data = validated_data.pop('editores', [])
        organizacion = Organizacion.objects.create(**validated_data)
        
        # Agregar editores si se proporcionaron
        if editores_data:
            organizacion.editores.set(editores_data)
        
        return organizacion

    def update(self, instance, validated_data):
        editores_data = validated_data.pop('editores', None)
        
        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar editores si se proporcionaron
        if editores_data is not None:
            instance.editores.set(editores_data)
        
        return instance

# Serializador para usuarios staff (muestra toda la información)
class OrganizacionSerializerStaff(OrganizacionSerializer):
    editores = serializers.SerializerMethodField(read_only=True)
    
    class Meta(OrganizacionSerializer.Meta):
        fields = OrganizacionSerializer.Meta.fields + ['editores', 'api_key']

    def get_editores(self, obj):
        return [
            {
                'id': editor.id,
                'email': editor.email,
                'username': editor.username
            } for editor in obj.editores.all()
        ]

# Serializador para usuarios públicos (oculta información sensible, solo muestra)
class OrganizacionSerializerPublico(serializers.ModelSerializer):
    class Meta:
        model = Organizacion
        fields = ['id', 'organizacion_nombre', 'dominio', 'api_key']  # 👈 Solo estos campos
        read_only_fields = ['api_key']

    def to_representation(self, instance):
        """
        Asegurar que solo se muestren los campos públicos
        """
        data = super().to_representation(instance)
        # No necesitas personalizar más porque el Meta.fields ya limita los campos
        return data

    def validate(self, data):
        model_fields = {field.name for field in Organizacion._meta.get_fields()}
        extra_fields = set(self.initial_data.keys()) - model_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                f"Campos no permitidos: {', '.join(extra_fields)}. "
                f"Campos válidos: {', '.join(model_fields)}"
            )
        
        return data
    
##########EDITORES A ORGANIZACIONES
class AgregarEditoresSerializer(serializers.Serializer):
    editores = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        help_text="Lista de IDs de usuarios editores a agregar. Ejemplo: [8, 9]"
    )
    
    def validate_editores(self, value):
        """Validar que los IDs correspondan a usuarios editores existentes"""
        if not value:
            raise serializers.ValidationError("La lista de editores no puede estar vacía.")
        
        # Verificar que todos los usuarios existan y sean editores
        usuarios_existentes = User.objects.filter(
            id__in=value, 
            groups__name='editor'
        ).values_list('id', flat=True)
        
        usuarios_inexistentes = set(value) - set(usuarios_existentes)
        
        if usuarios_inexistentes:
            raise serializers.ValidationError(
                f"Los siguientes IDs no corresponden a usuarios editores válidos: {list(usuarios_inexistentes)}"
            )
        
        return value

##Este es la respuesta que se va a mostrar de los endpoints aprobados cuando una persona quiere visualizar los testimonios de 
##una organizacion en especifico
#####MUESTRA LOS TESTIMONIOS APROBADOS DE UNA ORGANIZACION ESPECIFICA
class TestimonioAprobadoSerializer(serializers.ModelSerializer):
    usuario_registrado = serializers.StringRelatedField(read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)

    class Meta:
        model = Testimonios
        fields = [
            'id', 'usuario_registrado', 'usuario_anonimo_email', 
            'usuario_anonimo_username', 'api_key', 'categoria', 
            'categoria_nombre', 'comentario', 'fecha_comentario', 
            'ranking'
        ]
        # 👆 Excluimos: 'organizacion', 'organizacion_nombre', 'estado'



#######################ACA EMPIEZA LOS TESTIMONIOS COMO TAL



class TestimonioSerializer(serializers.ModelSerializer):
    usuario_registrado = serializers.StringRelatedField(read_only=True)
    organizacion_nombre = serializers.CharField(source='organizacion.organizacion_nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)
    archivo = serializers.FileField(required=False, allow_null=True)

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

    def validate_archivo(self, file):
        """
        Valida que el archivo no exceda los 5MB y que no se suba más de 1 archivo.
        """
        # 1. Validación de tamaño (Límite: 5 MB = 5 * 1024 * 1024 bytes)
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 Megabytes
        
        if file:
            # Dado que DRF solo envía un archivo por campo de tipo FileField,
            # el límite de "más de 1 archivo" ya está cubierto por el diseño
            # del modelo y serializador, pero validamos que no sea excesivo.

            if file.size > MAX_FILE_SIZE:
                # El archivo.size está en bytes
                raise serializers.ValidationError(
                    f"El tamaño del archivo no puede exceder los {MAX_FILE_SIZE / (1024*1024):.0f}MB."
                )
        
        # Si todo es correcto, devuelve el archivo.
        return file

    class Meta:
        model = Testimonios
        fields = [
            'id', 'organizacion', 'organizacion_nombre',  'usuario_registrado',  'usuario_anonimo_email', 
            'usuario_anonimo_username', 
            'api_key', 'categoria',  'categoria_nombre', 'comentario', 'archivo', 'fecha_comentario', 
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
        api_key = data.get('api_key')

        # 👇 DIFERENCIAR ENTRE CREACIÓN Y ACTUALIZACIÓN
        # Si es una actualización (PATCH/PUT) y la instancia ya existe
        if self.instance is not None:
            # ES UNA ACTUALIZACIÓN - La API key no es requerida
            # Pero si se proporciona una API key, validar que sea correcta
            if api_key and organizacion:
                if api_key != organizacion.api_key:
                    raise serializers.ValidationError({
                        "api_key": "La API key proporcionada no es válida para esta organización."
                    })
        else:
            # ES UNA CREACIÓN - La API key es requerida
            if not api_key:
                raise serializers.ValidationError({
                    "api_key": "La API key es requerida para crear un testimonio."
                })

            # Validar que la API key coincida con la organización SOLO para creación
            if api_key != organizacion.api_key:
                raise serializers.ValidationError({
                    "api_key": "La API key proporcionada no es válida para esta organización."
                })

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
        else:
            # Usuario no autenticado: asegurar que usuario_registrado sea None
            validated_data['usuario_registrado'] = None
        
        # La fecha se establece automáticamente por auto_now_add=True
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Para actualizaciones, manejamos los campos específicos que pueden cambiar
        # No modificamos usuario_registrado, usuario_anonimo_username, usuario_anonimo_email
        # ya que estos están establecidos en la creación
        
        # Actualizar solo los campos permitidos
        allowed_fields = ['organizacion', 'categoria', 'comentario', 'archivo', 'ranking']
        
        for field in allowed_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        
        instance.save()
        return instance
    
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