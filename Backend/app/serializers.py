import re
import cloudinary
from rest_framework import serializers
from django.contrib.auth import get_user_model
from app.models import *
from django.contrib.auth.models import Group
# Agrega estos imports al inicio del archivo
from django.utils import timezone
import os
from .utils import get_domain_from_url

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
        required=False,  # 👈 IMPORTANTE: Hacerlo opcional para updates
        error_messages={
            'min_length': 'La contraseña debe tener al menos 8 caracteres.'
        }
    )

    # 👇 NUEVO: Campo para la foto de perfil
    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True,
        write_only=True
    )
    
    # 👇 Campo de solo lectura para obtener la URL
    profile_picture_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User

        fields = [
            'id', 'username', 'email', 'password', 'date_joined',
            'profile_picture', 'profile_picture_url'  # 👈 Agregados
        ]
        read_only_fields = ['date_joined']

    def get_profile_picture_url(self, obj):
        """Devuelve la URL de la foto de perfil"""
        return obj.get_profile_picture_url()

    
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
        # Extraer la foto de perfil si existe
        profile_picture = validated_data.pop('profile_picture', None)

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

        # Si se proporcionó una foto de perfil, guardarla
        if profile_picture:
            user.profile_picture = profile_picture
            user.save()
        
        return user
    
    def update(self, instance, validated_data):
        # 👇 Extraer la contraseña si está presente
        password = validated_data.pop('password', None)
        # Extraer la foto de perfil si existe
        profile_picture = validated_data.pop('profile_picture', None)
        
        # Actualizar otros campos
        instance = super().update(instance, validated_data)
        
        # Si se proporcionó una nueva contraseña, hashearla
        if password:
            instance.set_password(password)

        # Si se proporcionó una nueva foto de perfil, actualizarla
        if profile_picture is not None:  # Nota: puede ser None para eliminar la foto
            instance.profile_picture = profile_picture

        instance.save()
        return instance

################################ USUARIOS EDITORES    
class EditorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,  # 👈 Validación adicional
        required=False,  # 👈 IMPORTANTE: Hacerlo opcional para updates
        error_messages={
            'min_length': 'La contraseña debe tener al menos 8 caracteres.'
        }
    )
    # 👇 Agregar campos de foto de perfil
    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True,
        write_only=True
    )
    profile_picture_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password','date_joined',
            'profile_picture', 'profile_picture_url'  # 👈 Agregados
        ]
        read_only_fields = ['date_joined']

    
    def get_profile_picture_url(self, obj):
        return obj.get_profile_picture_url()
    
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
    
    def update(self, instance, validated_data):
        # 👇 Extraer la contraseña si está presente
        password = validated_data.pop('password', None)
        profile_picture = validated_data.pop('profile_picture', None)
        
        # Actualizar otros campos
        instance = super().update(instance, validated_data)
        
        # Si se proporcionó una nueva contraseña, hashearla
        if password:
            instance.set_password(password)

        if profile_picture is not None:
            instance.profile_picture = profile_picture

        instance.save()
        return instance

########################### USUARIOS ADMINS    
class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=False,  # 👈 IMPORTANTE: Hacerlo opcional para updates
        error_messages={
            'min_length': 'La contraseña debe tener al menos 8 caracteres.'
        }
    )
    # 👇 Agregar campos de foto de perfil
    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True,
        write_only=True
    )
    profile_picture_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'date_joined',
            'profile_picture', 'profile_picture_url'  # 👈 Agregados
        ]
        read_only_fields = ['date_joined', 'is_staff', 'is_active', 'is_superuser']

    def get_profile_picture_url(self, obj):
        return obj.get_profile_picture_url()
    
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
        profile_picture = validated_data.pop('profile_picture', None)
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
        
        if profile_picture:
            user.profile_picture = profile_picture
            user.save()
        
        return user
    
    def update(self, instance, validated_data):
        # 👇 Extraer la contraseña si está presente
        password = validated_data.pop('password', None)
        profile_picture = validated_data.pop('profile_picture', None)
        
        # Actualizar otros campos
        instance = super().update(instance, validated_data)
        
        # Si se proporcionó una nueva contraseña, hashearla
        if password:
            instance.set_password(password)
            
        if profile_picture is not None:
            instance.profile_picture = profile_picture
        
        instance.save()
        
        return instance


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

# Serializador para EDITORES (muestra editores y visitantes de SU organización)
class OrganizacionSerializerEditor(serializers.ModelSerializer):
    editores = serializers.SerializerMethodField(read_only=True)
    visitantes = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Organizacion
        fields = ['id', 'organizacion_nombre', 'dominio', 'api_key', 'editores', 'visitantes']
        read_only_fields = ['api_key']

    def get_editores(self, obj):
        return [
            {
                'id': editor.id,
                'email': editor.email,
                'username': editor.username
            } for editor in obj.editores.all()
        ]

    def get_visitantes(self, obj):
        return [
            {
                'id': visitante.id,
                'email': visitante.email,
                'username': visitante.username
            } for visitante in obj.visitantes.all()
        ]


# Serializador para usuarios staff (muestra toda la información)
class OrganizacionSerializerStaff(OrganizacionSerializer):
    editores = serializers.SerializerMethodField(read_only=True)
    
    class Meta(OrganizacionSerializer.Meta):
        fields = OrganizacionSerializer.Meta.fields + ['editores', 'visitantes', 'api_key']

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
    
    
##########VISITANTES A ORGANIZACIONES
class AgregarVisitantesSerializer(serializers.Serializer):
    visitantes = serializers.ListField(  
        child=serializers.IntegerField(),
        required=True,
        help_text="Lista de IDs de usuarios visitantes a agregar. Ejemplo: [8, 9]"
    )
    
    def validate_visitantes(self, value): 
        """Validar que los IDs correspondan a usuarios visitantes existentes"""
        if not value:
            raise serializers.ValidationError("La lista de visitantes no puede estar vacía.")
        
        # Verificar que todos los usuarios existan y sean visitantes
        usuarios_existentes = User.objects.filter(
            id__in=value, 
            groups__name='visitante'
        ).values_list('id', flat=True)
        
        usuarios_inexistentes = set(value) - set(usuarios_existentes)
        
        if usuarios_inexistentes:
            raise serializers.ValidationError(
                f"Los siguientes IDs no corresponden a usuarios visitantes válidos: {list(usuarios_inexistentes)}"
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


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonios
        fields = ['feedback']
        read_only_fields = ['organizacion', 'usuario_registrado', 'usuario_anonimo_username', 
                           'usuario_anonimo_email', 'api_key', 'comentario', 'enlace', 
                           'archivos', 'fecha_comentario', 'categoria', 'ranking', 'estado']
    
    def validate_feedback(self, value):
        """Validar que el feedback no esté vacío"""
        if value and len(value.strip()) == 0:
            raise serializers.ValidationError("El feedback no puede estar vacío.")
        return value
    
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonios
        fields = ['feedback', 'estado']  # 👈 Incluimos estado para poder cambiarlo
        read_only_fields = ['estado']  # 👈 El estado será controlado automáticamente
    
    def validate(self, data):
        """
        Validar que solo se pueda agregar feedback a testimonios en estado ESPERA
        y que automáticamente cambie el estado a RECHAZADO
        """
        instance = self.instance
        
        # Verificar que el testimonio esté en estado ESPERA
        if instance.estado != 'E':
            raise serializers.ValidationError(
                f"Solo se puede agregar feedback a testimonios en estado ESPERA. "
                f"Este testimonio está en estado {instance.get_estado_display()}."
            )
        
        # Validar que el feedback no esté vacío
        feedback = data.get('feedback', '').strip()
        if not feedback:
            raise serializers.ValidationError({
                "feedback": "El feedback no puede estar vacío."
            })
        
        # Cambiar automáticamente el estado a RECHAZADO
        data['estado'] = 'R'
        
        return data
    
    def update(self, instance, validated_data):
        # Actualizar el feedback
        instance.feedback = validated_data.get('feedback', instance.feedback)
        instance.estado = 'R'  # 👈 Cambiar automáticamente a RECHAZADO
        
        # Guardar el testimonio (activará las validaciones del modelo)
        instance.save()
        
        return instance

# Función auxiliar para extraer public_id y resource_type
def extract_public_id_and_type_from_url(url):
    """
    Extrae el public_id y determina el resource_type de una URL de Cloudinary.
    """
    try:
        # Extraer public_id
        pattern = r'/upload/(?:v\d+/)?(.+?)(?:\.[^/.]+)?$'
        match = re.search(pattern, url)
        
        if match:
            public_id = match.group(1)
            
            # Determinar resource_type basado en la extensión
            extension = os.path.splitext(url.lower())[1]
            
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico']
            video_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
            raw_extensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.7z', 
                             '.xls', '.xlsx', '.ppt', '.pptx', '.psd', '.ai', '.eps']
            
            if extension in image_extensions:
                resource_type = 'image'
            elif extension in video_extensions:
                resource_type = 'video'
            elif extension in raw_extensions:
                resource_type = 'raw'
            else:
                resource_type = 'raw'
            
            return public_id, resource_type
            
    except:
        pass
    
    return None, None

class TestimonioSerializer(serializers.ModelSerializer):
    usuario_registrado = serializers.StringRelatedField(read_only=True)
    organizacion_nombre = serializers.CharField(source='organizacion.organizacion_nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)
    archivos = serializers.ListField(
        child=serializers.FileField(
            max_length=100,
            allow_empty_file=False,
            use_url=False
        ),
        required=False,
        allow_empty=True,
        max_length=4,
        write_only=True
    )


    # 👇 NUEVO: Campo solo para lectura que muestra las URLs
    archivos_urls = serializers.ListField(
        child=serializers.URLField(read_only=True),
        source='archivos',  # 👈 Mapea al campo 'archivos' del modelo
        read_only=True
    )

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
    feedback = serializers.SerializerMethodField()  # 👈 Cambiar a SerializerMethodField

    def validate_archivos(self, archivos):
        """
        Valida el array de archivos
        """
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB por archivo
        MAX_TOTAL_SIZE = 20 * 1024 * 1024  # 20MB total
        MAX_FILE_COUNT = 4
        
        if archivos:
            # Validar cantidad de archivos
            if len(archivos) > MAX_FILE_COUNT:
                raise serializers.ValidationError(
                    f"No se pueden subir más de {MAX_FILE_COUNT} archivos."
                )
            
            total_size = 0
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.txt']
            
            for archivo in archivos:
                # Validar tamaño individual
                if archivo.size > MAX_FILE_SIZE:
                    raise serializers.ValidationError(
                        f"El archivo {archivo.name} excede el tamaño máximo de {MAX_FILE_SIZE / (1024*1024):.0f}MB."
                    )
                
                # Validar extensión
                ext = os.path.splitext(archivo.name)[1].lower()
                if ext not in allowed_extensions:
                    raise serializers.ValidationError(
                        f"Tipo de archivo no permitido: {archivo.name}. Extensiones permitidas: {', '.join(allowed_extensions)}"
                    )
                
                total_size += archivo.size
            
            # Validar tamaño total
            if total_size > MAX_TOTAL_SIZE:
                raise serializers.ValidationError(
                    f"El tamaño total de los archivos ({total_size / (1024*1024):.1f}MB) excede el límite de {MAX_TOTAL_SIZE / (1024*1024):.0f}MB."
                )
        
        return archivos

    class Meta:
        model = Testimonios
        fields = [
            'id', 'organizacion', 'organizacion_nombre',  'usuario_registrado',  'usuario_anonimo_email', 
            'usuario_anonimo_username', 
            'api_key', 'categoria',  'categoria_nombre', 'comentario', 'enlace', 'archivos',  'archivos_urls', 'fecha_comentario', 
            'ranking', 'estado', 'feedback'  
        ]
        read_only_fields = ['usuario_registrado', 'fecha_comentario', 'organizacion_nombre', 'categoria_nombre', 'estado']

    def get_feedback(self, obj):
        """
        Mostrar feedback SOLO si el estado es RECHAZADO (R)
        """
        if obj.estado == 'R':
            return obj.feedback
        return None  # 👈 Devuelve None para otros estados

    def validate_feedback(self, value):
        """Validar que el feedback no se pueda establecer desde la creación"""
        # Cuando se crea un testimonio, el feedback debe ser None
        if self.instance is None and value is not None:
            raise serializers.ValidationError(
                "El feedback no puede ser establecido al crear un testimonio. "
                "Solo puede ser agregado posteriormente por un editor o administrador."
            )
        return value

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
        api_key = data.get('api_key')
        archivos = data.get('archivos', [])
    
        # Validación de archivos (igual que antes)
        if len(archivos) > 4:
            raise serializers.ValidationError({"archivos": "No se pueden subir más de 4 archivos."})
    
        # Validación de API key (igual que antes para creación vs actualización)
        if self.instance is None:  # Creación
            if not api_key:
                raise serializers.ValidationError({"api_key": "La API key es requerida para crear un testimonio."})
            if organizacion and api_key != organizacion.api_key:
                raise serializers.ValidationError({"api_key": "La API key no es válida para esta organización."})
        else:  # Actualización
            if organizacion and api_key and api_key != organizacion.api_key:
                raise serializers.ValidationError({"api_key": "La API key no es válida para esta organización."})
    
        # 👇 NUEVA LÓGICA: ¿El frontend coincide con el dominio de la organización?
        if organizacion and request and self.instance is None:  # Solo en creación
            referer = request.META.get('HTTP_REFERER')
            current_frontend_domain = get_domain_from_url(referer) if referer else None
            organizacion_domain = get_domain_from_url(f"https://{organizacion.dominio}")


            print(f"REFERER recibido: {referer}")
            print(f"Frontend (extraído): {current_frontend_domain}")
            print(f"Dominio organización (configurado): {organizacion.dominio}")
            print(f"Organización (extraído): {organizacion_domain}")
    
            # ✅ Si el dominio del frontend coincide con el dominio de la organización → permitir
            if current_frontend_domain == organizacion_domain:
                # Permitir el testimonio incluso si el usuario no está asignado
                pass
            else:
                # 👇 Aplicar la regla antigua solo si NO hay coincidencia de dominio
                if request.user.is_authenticated:
                    user = request.user
                    if user.groups.filter(name='visitante').exists():
                        if not organizacion.visitantes.filter(id=user.id).exists():
                            raise serializers.ValidationError({
                                "organizacion": f"No perteneces a la organización '{organizacion.organizacion_nombre}'."
                            })
                    # Verificar duplicado por usuario registrado
                    if Testimonios.objects.filter(
                        organizacion=organizacion,
                        usuario_registrado=user
                    ).exists():
                        raise serializers.ValidationError({
                            "organizacion": "Ya has creado un testimonio para esta organización."
                        })
                else:
                    # Usuario anónimo: validar duplicado por email + username
                    usuario_anonimo_username = data.get('usuario_anonimo_username')
                    usuario_anonimo_email = data.get('usuario_anonimo_email')
                    if organizacion and usuario_anonimo_username and usuario_anonimo_email:
                        if Testimonios.objects.filter(
                            organizacion=organizacion,
                            usuario_anonimo_username=usuario_anonimo_username,
                            usuario_anonimo_email=usuario_anonimo_email,
                            usuario_registrado__isnull=True
                        ).exists():
                            raise serializers.ValidationError({
                                "detail": "Ya existe un testimonio anónimo para esta organización con el mismo nombre y email."
                            })
    
        return data

    def create(self, validated_data):
        # Obtener el usuario del contexto (JWT)
        request = self.context.get('request')
        
        # 👇 EXTRAER los archivos ANTES de crear el testimonio
        archivos_data = validated_data.pop('archivos', [])
        
        if request and request.user.is_authenticated:
            # Usuario autenticado: asignar usuario y limpiar campos anónimos automáticamente
            validated_data['usuario_registrado'] = request.user
            validated_data['usuario_anonimo_username'] = None
            validated_data['usuario_anonimo_email'] = None
        else:
            # Usuario no autenticado: asegurar que usuario_registrado sea None
            validated_data['usuario_registrado'] = None
        
        # 👇 SUBIR ARCHIVOS A CLOUDINARY ANTES de crear el testimonio
        archivos_urls = []
        try:
            for archivo in archivos_data:
                # Subir cada archivo a Cloudinary
                uploaded_file = cloudinary.uploader.upload(
                    archivo,
                    folder='testimonios/archivos/',
                    resource_type='auto'
                )
                archivos_urls.append(uploaded_file['secure_url'])
            
            # 👇 AGREGAR las URLs al validated_data
            validated_data['archivos'] = archivos_urls
            
        except Exception as e:
            # 👇 SI HAY ERROR en la subida, NO se crea el testimonio
            raise serializers.ValidationError({
                "archivos": f"Error al subir los archivos: {str(e)}"
            })
        
        # 👇 SOLO SI TODO SALE BIEN, crear el testimonio
        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        """
        Actualiza un testimonio con manejo flexible de archivos.
        Permite:
        - Reemplazar todos los archivos (comportamiento actual)
        - Agregar nuevos archivos sin eliminar los existentes
        - Eliminar archivos específicos
        """
        # 1. Extraer archivos del validated_data
        archivos_data = validated_data.pop('archivos', None)
        
        # 2. Si se envían nuevos archivos, procesarlos
        if archivos_data is not None:
            # Obtener archivos actuales
            archivos_actuales = instance.archivos.copy() if instance.archivos else []
            
            # 👇 ESTRATEGIA: Reemplazar todos los archivos (comportamiento actual)
            # Si quieres mantener archivos existentes y solo agregar nuevos, cambia esta lógica
            archivos_nuevos_urls = []
            
            try:
                for archivo in archivos_data:
                    # Validar tamaño
                    MAX_FILE_SIZE = 5 * 1024 * 1024
                    if archivo.size > MAX_FILE_SIZE:
                        raise serializers.ValidationError({
                            "archivos": f"El archivo '{archivo.name}' excede el tamaño máximo de 5MB."
                        })
                    
                    # Subir a Cloudinary
                    uploaded_file = cloudinary.uploader.upload(
                        archivo,
                        folder='testimonios/archivos/',
                        resource_type='auto'
                    )
                    archivos_nuevos_urls.append(uploaded_file['secure_url'])
                
                # 👇 REEMPLAZAR todos los archivos existentes con los nuevos
                instance.archivos = archivos_nuevos_urls
                
            except Exception as e:
                # Si hay error, limpiar archivos nuevos subidos
                for url in archivos_nuevos_urls:
                    try:
                        public_id, resource_type = extract_public_id_and_type_from_url(url)
                        if public_id and resource_type:
                            cloudinary.uploader.destroy(public_id, resource_type=resource_type)
                    except:
                        pass
                
                raise serializers.ValidationError({
                    "archivos": f"Error al actualizar archivos: {str(e)}"
                })
        
        # 3. Actualizar otros campos
        allowed_fields = ['organizacion', 'categoria', 'comentario', 'enlace', 'ranking']
        for field in allowed_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        
        instance.save()
        return instance

    def to_representation(self, instance):
        """
        Personalizar la representación para mostrar las URLs de los archivos
        y controlar la visibilidad del feedback
        """
        representation = super().to_representation(instance)
        
        # 1. Asegurar que archivos siempre sea una lista
        representation['archivos_urls'] = instance.archivos if instance.archivos else []
        
        ## 2. Eliminar feedback si el estado no es RECHAZADO
        #if instance.estado != 'R':
        #    representation.pop('feedback', None)
        
        return representation
    
class CambiarEstadoTestimonioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonios
        fields = ['estado', 'feedback']
        read_only_fields = []  # Ambos campos son editables en principio
    
    def validate(self, data):
        """
        Validar reglas de negocio para cambio de estado y feedback
        """
        instance = self.instance
        nuevo_estado = data.get('estado', instance.estado)
        nuevo_feedback = data.get('feedback', None)  # Usar None si no se envía
        feedback_actual = instance.feedback if instance else None
        
        # REGLA 1: Solo se puede agregar/modificar feedback cuando estado es RECHAZADO
        if 'feedback' in data and nuevo_feedback is not None:
            # Si se está intentando modificar el feedback
            if nuevo_estado != 'R':
                # No permitir modificar feedback si no es RECHAZADO
                raise serializers.ValidationError({
                    "feedback": "Solo se puede agregar o modificar feedback cuando el estado es RECHAZADO."
                })
            
            # REGLA 2: Si YA es RECHAZADO y YA tiene feedback, no permitir modificarlo
            if instance.estado == 'R' and feedback_actual and feedback_actual.strip():
                # Verificar si el feedback está cambiando (no es lo mismo)
                if nuevo_feedback != feedback_actual:
                    raise serializers.ValidationError({
                        "feedback": "No se puede modificar el feedback de un testimonio RECHAZADO. "
                                  "Una vez asignado, el feedback es inmutable."
                    })
        
        # REGLA 3: Si se cambia a RECHAZADO, DEBE tener feedback
        if nuevo_estado == 'R':
            # Verificar si hay feedback en los datos o si ya existe
            feedback_proporcionado = data.get('feedback')
            feedback_existente = feedback_actual
            
            if not feedback_proporcionado and not feedback_existente:
                raise serializers.ValidationError({
                    "feedback": "Debe proporcionar un feedback cuando cambia el estado a RECHAZADO."
                })
        
        # REGLA 4: Si se cambia de RECHAZADO a otro estado, limpiar feedback automáticamente
        if instance.estado == 'R' and nuevo_estado != 'R':
            # Limpiar feedback automáticamente
            data['feedback'] = None
            
            # Mostrar advertencia
            if self.context.get('request'):
                # Puedes agregar un mensaje al contexto si lo necesitas
                pass
        
        return data
    
    def update(self, instance, validated_data):
        """
        Actualizar la instancia con las reglas aplicadas
        """
        nuevo_estado = validated_data.get('estado', instance.estado)
        nuevo_feedback = validated_data.get('feedback', instance.feedback)
        
        # Aplicar REGLA 4 explícitamente: Si cambia de R a otro estado, feedback = None
        if instance.estado == 'R' and nuevo_estado != 'R':
            instance.feedback = None
        
        # Actualizar otros campos
        instance.estado = nuevo_estado
        
        # Solo actualizar feedback si el nuevo estado es R
        if nuevo_estado == 'R' and 'feedback' in validated_data:
            instance.feedback = nuevo_feedback
        
        # Guardar la instancia (activará las validaciones del modelo)
        instance.save()
        
        return instance
    
# Serializador para testimonios aprobados (públicos) - NUNCA mostrar feedback
class TestimonioAprobadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonios
        fields = ['id', 'usuario_registrado', 'usuario_anonimo_username', 
                 'comentario', 'enlace', 'archivos', 'fecha_comentario', 
                 'categoria', 'ranking']
        read_only_fields = fields
    
    def to_representation(self, instance):
        # Nunca mostrar feedback en testimonios públicos
        data = super().to_representation(instance)
        data.pop('feedback', None)
        return data