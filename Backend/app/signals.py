from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    """
    Crea grupos por defecto después de las migraciones
    """
    # Grupos a crear
    groups = ['editor', 'visitante']
    
    for group_name in groups:
        Group.objects.get_or_create(name=group_name)
    
    #print("✅ Grupos por defecto creados: admin, editor, visitante")