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
