from django.db import models
from django.core.exceptions import ValidationError  # 👈 Agrega esta importación
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django_otp import user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice 
from django.contrib.auth.models import Group
import uuid
from cloudinary.models import CloudinaryField

class Roles(Group):
    class Meta:
        proxy = True
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        app_label = 'app'  # Esto lo hará aparecer en el apartado app del Admin de Django
    
    def __str__(self):
        return f"Grupo: {self.name}"

class User(AbstractUser):

    username = models.CharField(max_length=150, unique=True, blank=False, null=False)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username'] 

    # 👇 NUEVO CAMPO: Foto de perfil con Cloudinary
    profile_picture = CloudinaryField(
        'profile_picture',
        folder='profiles',  # 👈 Esto almacenará las fotos en la carpeta 'profiles' en Cloudinary
        default=None,  # Puedes cambiar esto por una imagen por defecto si quieres
        blank=True,
        null=True,
        help_text='Foto de perfil del usuario'
    )


    # 📌 SOLUCIÓN: Sobrescribir groups y user_permissions con related_name
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='app_user_set', 
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-date_joined']

    def is_verified(self):
        """
        Verifica si el usuario ha completado la autenticación de dos factores.
        En este caso, verificamos si tiene dispositivos OTP configurados.
        """
        return user_has_device(self)
    
    def verify_token(self, token):
        """Verifica un token OTP para el usuario"""
        devices = TOTPDevice.objects.devices_for_user(self)
        return any(device.verify_token(token) for device in devices)

    def clean(self):
        super().clean()
        
        # ✅ validar grupos si el usuario ya tiene ID, es decir ya existentes
        if self.pk and self.groups.count() > 1:
            raise ValidationError({
                'groups': 'El usuario solo puede pertenecer a un grupo.'
            })

    def save(self, *args, **kwargs):
        # Asegurar validación al guardar
        self.clean()
        super().save(*args, **kwargs)

    # 👇 Método para obtener la URL de la foto de perfil
    def get_profile_picture_url(self):
        """Devuelve la URL de la foto de perfil o None si no existe"""
        if self.profile_picture:
            return self.profile_picture.url
        return None
    
    def delete_profile_picture_from_cloudinary(self):
        """Elimina la foto de perfil de Cloudinary"""
        if self.profile_picture:
            try:
                # CloudinaryField ya tiene public_id
                if self.profile_picture.public_id:
                    import cloudinary.uploader
                    result = cloudinary.uploader.destroy(
                        self.profile_picture.public_id,
                        resource_type='image'
                    )
                    print(f"✅ Foto eliminada de Cloudinary: {self.profile_picture.public_id}")
                    return result.get('result') == 'ok'
            except Exception as e:
                print(f"⚠️ Error eliminando foto de Cloudinary: {e}")
            return False
        return True
    
    def clear_profile_picture(self):
        """Limpia la foto de perfil tanto de la BD como de Cloudinary"""
        if self.profile_picture:
            self.delete_profile_picture_from_cloudinary()
            self.profile_picture = None
            self.save()
            return True
        return False
    
    # 👇 Método para mostrar representación string con foto
    def __str__(self):
        if self.profile_picture:
            return f"{self.username} (con foto)"
        return self.username

#Para dividir los usuarios en el admin de Django en dos secciones (visitantes y editores), 
#necesito crear modelos proxy y configurar el admin apropiadamente

class Visitante(User):
    class Meta:
        proxy = True
        verbose_name = 'Visitante'
        verbose_name_plural = 'Visitantes'
        app_label = 'app'

class Editor(User):
    class Meta:
        proxy = True
        verbose_name = 'Editor'
        verbose_name_plural = 'Editores'
        app_label = 'app'

class AdminUser(User):
    class Meta:
        proxy = True
        verbose_name = "Administrador"
        verbose_name_plural = "Administradores"
        app_label = "app"


class Organizacion(models.Model):
    organizacion_nombre = models.CharField(max_length=50, blank=False, unique=True)
    dominio = models.CharField(max_length=50, blank=False, unique=True)
    editores = models.ManyToManyField(User, related_name='organizaciones_editables', blank=True)
    visitantes = models.ManyToManyField(User, related_name='organizaciones_visitantes', blank=True)
    api_key = models.CharField(max_length=50, blank=True, null=True, unique=True) ##SE DEBE CREAR AUTOMATICAMENTE
    fecha_registro = models.DateTimeField(auto_now_add=True)  # ✅ Fecha automática

    class Meta:
        verbose_name = 'Organizacion'
        verbose_name_plural = 'Organizaciones'
        ordering = ['-id']  # Ordenar por ID descendente


    def __str__(self):
        return self.organizacion_nombre
    
    def save(self, *args, **kwargs):
        # Generar API key automáticamente si no existe
        if not self.api_key:
            self.api_key = str(uuid.uuid4())[:50]  # UUID truncado a 50 caracteres
        super().save(*args, **kwargs)


class Categoria(models.Model):
    nombre_categoria = models.CharField(max_length=50, blank=False, unique=True)  ######Descripcion
    icono = models.CharField(max_length=50, blank=False, null=False)  
    color = models.CharField(max_length=50, blank=False, null=False)  
    fecha_registro = models.DateTimeField(auto_now_add=True) 

    class Meta:
        # Restriccion para que un usuario no pueda registrar varios productos con el mismo nombre
        #Si el producto pertenece a el, el producto puede tener varias veces el mismo nombre si pertenece
        #a usuarios diferentes 
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['-id']  # Ordenar por ID descendente

    def __str__(self):
        return (f"Categoria {self.nombre_categoria}")

class Testimonios(models.Model):

    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='organizacion', blank=False)
    usuario_registrado = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usuario_visitante', blank=True, null=True)
    usuario_anonimo_username = models.CharField(max_length=50, blank=True, null=True)
    usuario_anonimo_email = models.EmailField(blank=True, null=True) 
    api_key = models.CharField(max_length=50, blank=False, null=False)
    comentario = models.CharField(max_length=100, blank=True, null=True)
    enlace = models.CharField(max_length=100, blank=True, null=True)
    archivos = models.JSONField(default=list, blank=True, null=True)  # Array de URLs de archivos
    fecha_comentario = models.DateTimeField(auto_now_add=True) 
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='categoria_testimonios', blank=False)
    ranking = models.DecimalField(default=0, max_digits=3, decimal_places=1)

    OPCIONES_ESTADOS = (
        ('E', 'ESPERA'),
        ('A', 'APROBADO'),
        ('R', 'RECHAZADO'),
        ('P', 'PUBLICADO'),
        ('B', 'BORRADOR'),
        ('O', 'OCULTO'), ###DESPUES DE X TIEMPO SE OCULTAN
    )

    estado = models.CharField(max_length=1, choices=OPCIONES_ESTADOS, default='E', verbose_name='Estado')

    class Meta:
        # Restricción para usuarios registrados
        unique_together = ('organizacion', 'usuario_registrado')
        
        # 👈 Nueva restricción para usuarios anónimos
        constraints = [
            models.UniqueConstraint(
                fields=['organizacion', 'usuario_anonimo_username', 'usuario_anonimo_email'],
                name='unique_anonimo_por_organizacion',
                condition=models.Q(usuario_registrado__isnull=True)  # Solo aplica para usuarios anónimos
            )
        ]
        verbose_name = 'Testimonio'
        verbose_name_plural = 'Testimonios'
        ordering = ['-fecha_comentario']

    def __str__(self):
        usuario = self.usuario_registrado.username if self.usuario_registrado else self.usuario_anonimo_username
        return f"Testimonio del Usuario: {usuario} para la empresa: {self.organizacion.organizacion_nombre}"

    def clean(self):
        # Validación adicional a nivel de modelo
        if not self.usuario_registrado and (not self.usuario_anonimo_username or not self.usuario_anonimo_email):
            raise ValidationError(
                "Para testimonios anónimos, tanto usuario_anonimo_username como usuario_anonimo_email son requeridos."
            )

        

    def save(self, *args, **kwargs):
        # Si hay usuario registrado, limpiar campos anónimos automáticamente
        if self.usuario_registrado:
            self.usuario_anonimo_username = None
            self.usuario_anonimo_email = None
        
        self.clean()
        super().save(*args, **kwargs)