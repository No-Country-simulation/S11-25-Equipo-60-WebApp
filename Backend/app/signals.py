from django.db.models.signals import post_migrate, pre_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from django.contrib.auth.management import create_permissions
from .models import *
from cloudinary import uploader
import re
import os

#########   Crea los grupos editor y visitante por defecto
@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    """
    Crea grupos por defecto después de las migraciones
    """
    groups = ['editor', 'visitante']
    
    for group_name in groups:
        Group.objects.get_or_create(name=group_name)

# 👇 ACTUALIZADO: Borra múltiples archivos de Cloudinary cuando se elimina el testimonio
@receiver(pre_delete, sender=Testimonios)
def delete_cloudinary_files(sender, instance, **kwargs):
    """
    Elimina TODOS los archivos asociados en Cloudinary antes de borrar la instancia del modelo.
    """
    if instance.archivos and isinstance(instance.archivos, list):
        for url in instance.archivos:
            try:
                # Extraer public_id y determinar resource_type
                public_id, resource_type = extract_public_id_and_type_from_url(url)
                if public_id and resource_type:
                    uploader.destroy(public_id, resource_type=resource_type)
                    print(f"✅ Archivo Cloudinary eliminado: {public_id} (tipo: {resource_type})")
                else:
                    print(f"⚠️ No se pudo extraer public_id o determinar tipo de: {url}")
            except Exception as e:
                print(f"⚠️ Error al eliminar archivo de Cloudinary {url}: {e}")

# 👇 ACTUALIZADO: Borra archivos antiguos cuando se actualiza
@receiver(pre_save, sender=Testimonios)
def delete_old_cloudinary_files(sender, instance, **kwargs):
    """
    Elimina los archivos antiguos de Cloudinary SOLO si el campo 'archivos' ha sido modificado.
    """
    if not instance.pk:
        return

    try:
        old_instance = Testimonios.objects.get(pk=instance.pk)
    except Testimonios.DoesNotExist:
        return

    old_files = old_instance.archivos or []
    new_files = instance.archivos or []

    # Verificar si los archivos cambiaron (comparando listas)
    if old_files != new_files:
        # Encontrar archivos que estaban en los antiguos pero no en los nuevos
        files_to_delete = [url for url in old_files if url not in new_files]
        
        # Eliminar archivos antiguos que ya no están en los nuevos
        for url in files_to_delete:
            try:
                public_id, resource_type = extract_public_id_and_type_from_url(url)
                if public_id and resource_type:
                    uploader.destroy(public_id, resource_type=resource_type)
                    print(f"✅ Archivo Cloudinary antiguo eliminado al actualizar: {public_id} (tipo: {resource_type})")
                else:
                    print(f"⚠️ No se pudo extraer public_id de archivo antiguo: {url}")
            except Exception as e:
                print(f"⚠️ Error al eliminar archivo Cloudinary antiguo {url}: {e}")

def extract_public_id_and_type_from_url(url):
    """
    Extrae el public_id y determina el resource_type de una URL de Cloudinary.
    
    Retorna: (public_id, resource_type)
    """
    try:
        # Extraer public_id
        pattern = r'/upload/(?:v\d+/)?(.+?)(?:\.[^/.]+)?$'
        match = re.search(pattern, url)
        
        if match:
            public_id = match.group(1)
            
            # Determinar resource_type basado en la extensión del archivo
            resource_type = determine_resource_type(url)
            
            return public_id, resource_type
        
        # Alternativa: buscar directamente la carpeta testimonios/archivos/
        pattern2 = r'testimonios/archivos/[^/.]+'
        match2 = re.search(pattern2, url)
        if match2:
            public_id = match2.group(0)
            resource_type = determine_resource_type(url)
            return public_id, resource_type
            
    except Exception as e:
        print(f"Error extrayendo public_id de {url}: {e}")
    
    return None, None

def determine_resource_type(url):
    """
    Determina el resource_type basado en la extensión del archivo.
    """
    # Extraer la extensión del archivo
    extension = os.path.splitext(url.lower())[1]
    
    # Mapeo de extensiones a resource_types de Cloudinary
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico']
    video_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    raw_extensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.7z', 
                     '.xls', '.xlsx', '.ppt', '.pptx', '.psd', '.ai', '.eps']
    
    if extension in image_extensions:
        return 'image'
    elif extension in video_extensions:
        return 'video'
    elif extension in raw_extensions:
        return 'raw'
    else:
        # Por defecto, usar 'raw' para tipos desconocidos
        return 'raw'

def block_default_permissions(sender, **kwargs):
    pass

# Desconectar la señal global
post_migrate.disconnect(receiver=create_permissions, dispatch_uid="django.contrib.auth.management.create_permissions")