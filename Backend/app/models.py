from django.db import models
# from django.contrib.auth.models import User # Modelo original
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db.models import Q, F

class User(AbstractUser):

    username = models.CharField(max_length=150, unique=True, blank=False, null=False)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username'] 

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


class Organizacion(models.Model):
    usuario_organizacion = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usuario_organizacion')
    organizacion_nombre = models.CharField(max_length=50, blank=False, unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)  # ✅ Fecha automática

    class Meta:
        verbose_name = 'Organizacion'
        verbose_name_plural = 'Organizaciones'
        ordering = ['-id']  # Ordenar por ID descendente


class Categoria(models.Model):
    editor_categoria = models.ForeignKey(User, on_delete=models.CASCADE, related_name='editor_categoria', blank=False)
    categoria_texto = models.CharField(max_length=50, blank=False)
    fecha_registro = models.DateTimeField(auto_now_add=True) 

    class Meta:
        # Restriccion para que un usuario no pueda registrar varios productos con el mismo nombre
        #Si el producto pertenece a el, el producto puede tener varias veces el mismo nombre si pertenece
        #a usuarios diferentes 
        unique_together = ('editor_categoria', 'categoria_texto')
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['-id']  # Ordenar por ID descendente

    def __str__(self):
        return (f"Categoria {self.categoria_texto}, "
                f"de la Cuenta: {self.editor_categoria.username} con el correo ({self.editor_categoria.email}) "
               )

class Testimonios(models.Model):

    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='organizacion', blank=False)
    usuario_registrado = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usuario_visitante', blank=False, null=True)
    usuario_anonimo = models.CharField(max_length=50, blank=True, null=True)
    api_key = models.CharField(max_length=50, blank=True, null=True)
    comentario_texto = models.CharField(max_length=100, blank=False, null=False)
    fecha_comentario = models.DateTimeField(auto_now_add=True) 
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='organizacion', blank=False)
    ranking = models.DecimalField(default=0, max_digits=3, decimal_places=1)

    OPCIONES_ESTADOS = (
        ('A', 'APROBADO'),
        ('E', 'ESPERA'),
        ('R', 'RECHAZADO'),
        ('B', 'BORRADOR'),
    )

    estado = models.CharField(max_length=1, choices=OPCIONES_ESTADOS, default='E', verbose_name='Estado')

    class Meta:
        # Restriccion para que un usuario no pueda registrar varios productos con el mismo nombre
        #Si el producto pertenece a el, el producto puede tener varias veces el mismo nombre si pertenece
        #a usuarios diferentes 
        unique_together = ('organizacion', 'usuario_registrado')
        verbose_name = 'Estado'
        verbose_name_plural = 'Estados'
        ordering = ['-fecha_comentario']  # Ordenar por fecha descendente

    
    def __str__(self):
        usuario = self.usuario_registrado.username if self.usuario_registrado else self.usuario_anonimo
        return f"Testimonio de {usuario} para {self.organizacion.organizacion_nombre}"


