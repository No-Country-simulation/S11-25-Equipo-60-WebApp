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


class Categoria(models.Model):
    editor_categoria = models.ForeignKey(User, on_delete=models.CASCADE, related_name='editor_categoria', blank=False)
    categoria_texto = models.CharField(max_length=50, blank=False)
    fecha_registro = models.DateTimeField() 

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



class Tabs(models.Model):
    editor_tabs = models.ForeignKey(User, on_delete=models.CASCADE, related_name='editor_tabs', blank=False)
    tabs_texto = models.CharField(max_length=50, blank=False)
    fecha_registro = models.DateTimeField() 

    class Meta:
        # Restriccion para que un usuario no pueda registrar varios productos con el mismo nombre
        #Si el producto pertenece a el, el producto puede tener varias veces el mismo nombre si pertenece
        #a usuarios diferentes 
        unique_together = ('editor_tabs', 'tabs_texto')
        verbose_name = 'Tab'
        verbose_name_plural = 'Tabs'
        ordering = ['-id']  # Ordenar por ID descendente

    def __str__(self):
        return (f"Tab {self.tabs_texto}, "
                f"de la Cuenta: {self.editor.username} con el correo ({self.editor.email}) "
               )

class Estados(models.Model):

    OPCIONES_ESTADOS = (
        ('A', 'APROBADO'),
        ('R', 'RECHAZADO'),
        ('B', 'BORRADOR'),
    )
    editor_estado = models.ForeignKey(User, on_delete=models.CASCADE, related_name='editor_estado', blank=False)
    estado = models.CharField(max_length=1, choices=OPCIONES_ESTADOS, default='E', verbose_name='Estado')
    fecha_registro = models.DateTimeField() 

    class Meta:
        # Restriccion para que un usuario no pueda registrar varios productos con el mismo nombre
        #Si el producto pertenece a el, el producto puede tener varias veces el mismo nombre si pertenece
        #a usuarios diferentes 
        unique_together = ('editor_estado', 'estado')
        verbose_name = 'Estado'
        verbose_name_plural = 'Estados'
        ordering = ['-id']  # Ordenar por ID descendente

    def __str__(self):
        return (f"Estado {self.estado}, "
                f"de la Cuenta: {self.editor.username} con el correo ({self.editor.email}) "
               )
