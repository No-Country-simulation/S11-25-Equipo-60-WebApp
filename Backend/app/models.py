from django.db import models
# from django.contrib.auth.models import User # Modelo original
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db.models import Q, F

class User(AbstractUser):

    TIPO_USUARIO_CHOICES = [
        ('editor', 'editor'),
        ('visitante', 'visitante'),
    ]

    username = models.CharField(max_length=150, unique=True, blank=False, null=False)
    email = models.EmailField(unique=True)
    tipo_usuario = models.CharField(
        max_length=10, 
        choices=TIPO_USUARIO_CHOICES, 
        default='visitante'
    )
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
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='app_user_permissions_set', 
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-date_joined']

    def __str__(self):
        if self.tipo_usuario == 'compania' and self.nombre_empresa:
            return f"{self.nombre_empresa} ({self.email})"
        return f"{self.username} ({self.email})"