from django.db.models.signals import post_migrate, pre_delete, pre_save, post_save
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

# 👇 NUEVA SEÑAL: Manejar la eliminación de fotos ANTES de guardar
@receiver(pre_save, sender=User)
def handle_profile_picture_update(sender, instance, **kwargs):
    """
    Maneja la actualización de fotos de perfil.
    """
    if not instance.pk:
        return  # Nuevo usuario, no hay foto antigua

    try:
        old_instance = User.objects.get(pk=instance.pk)
        old_picture = old_instance.profile_picture
        new_picture = instance.profile_picture
        
        # Si hay una foto antigua y está siendo reemplazada con una nueva
        if old_picture and new_picture:
            # Verificar si es realmente una nueva imagen (no solo la misma)
            # CloudinaryField almacena el public_id, así que comparamos eso
            old_public_id = get_cloudinary_public_id(old_picture)
            new_public_id = get_cloudinary_public_id(new_picture)
            
            # Si no hay nuevo public_id aún, significa que se subió un archivo nuevo
            # Cloudinary todavía no ha procesado la nueva imagen
            if old_public_id and not new_public_id:
                # Marcar la foto antigua para eliminación después del guardado
                instance._old_profile_picture_to_delete = old_picture
                print(f"📋 Marcada foto antigua para eliminación: {old_public_id}")
        
        # Si se está eliminando la foto (nuevo valor es None)
        elif old_picture and not new_picture:
            old_public_id = get_cloudinary_public_id(old_picture)
            if old_public_id:
                instance._old_profile_picture_to_delete = old_picture
                print(f"📋 Marcada foto para eliminación (campo establecido a None): {old_public_id}")
                
    except User.DoesNotExist:
        return
    except Exception as e:
        print(f"⚠️ Error en handle_profile_picture_update: {e}")

# 👇 NUEVA SEÑAL: Eliminar fotos antiguas DESPUÉS de guardar
@receiver(post_save, sender=User)
def delete_old_profile_picture_after_save(sender, instance, created, **kwargs):
    """
    Elimina la foto de perfil antigua DESPUÉS de guardar exitosamente.
    Esto asegura que la nueva imagen ya esté en Cloudinary.
    """
    if created:
        return  # Usuario nuevo, no hay foto antigua
    
    # Verificar si hay una foto marcada para eliminación
    if hasattr(instance, '_old_profile_picture_to_delete'):
        old_picture = instance._old_profile_picture_to_delete
        
        try:
            old_public_id = get_cloudinary_public_id(old_picture)
            
            if old_public_id:
                # Verificar si esta foto todavía está en uso por algún usuario
                # Solo eliminar si ningún otro usuario la está usando
                other_users_with_same_picture = User.objects.filter(
                    profile_picture=old_picture
                ).exclude(pk=instance.pk).count()
                
                if other_users_with_same_picture == 0:
                    # Eliminar de Cloudinary
                    uploader.destroy(old_public_id, resource_type='image')
                    print(f"✅ Foto de perfil antigua eliminada de Cloudinary: {old_public_id}")
                else:
                    print(f"⚠️ Foto {old_public_id} no eliminada: aún en uso por {other_users_with_same_picture} usuario(s)")
            
            # Limpiar el atributo temporal
            delattr(instance, '_old_profile_picture_to_delete')
            
        except Exception as e:
            print(f"⚠️ Error eliminando foto de perfil antigua después de guardar: {e}")
            # Intentar limpiar el atributo temporal incluso si hay error
            if hasattr(instance, '_old_profile_picture_to_delete'):
                delattr(instance, '_old_profile_picture_to_delete')

# 👇 NUEVA SEÑAL: Borra foto de perfil cuando se elimina un usuario
@receiver(pre_delete, sender=User)
def delete_user_profile_picture(sender, instance, **kwargs):
    """
    Elimina la foto de perfil de Cloudinary cuando se borra un usuario.
    """
    if instance.profile_picture:
        try:
            old_public_id = get_cloudinary_public_id(instance.profile_picture)
            
            if old_public_id:
                # Verificar si otros usuarios están usando la misma foto
                other_users_with_same_picture = User.objects.filter(
                    profile_picture=instance.profile_picture
                ).exclude(pk=instance.pk).count()
                
                if other_users_with_same_picture == 0:
                    uploader.destroy(old_public_id, resource_type='image')
                    print(f"✅ Foto de perfil eliminada de Cloudinary al borrar usuario: {old_public_id}")
                else:
                    print(f"⚠️ Foto {old_public_id} no eliminada: aún en uso por {other_users_with_same_picture} usuario(s)")
            else:
                print(f"⚠️ No se pudo extraer public_id de: {instance.profile_picture}")
                
        except Exception as e:
            print(f"⚠️ Error al eliminar foto de perfil de Cloudinary: {e}")

def get_cloudinary_public_id(cloudinary_field):
    """
    Obtiene el public_id de un campo CloudinaryField.
    """
    try:
        # Si es un objeto CloudinaryField, obtener directamente el public_id
        if hasattr(cloudinary_field, 'public_id'):
            return cloudinary_field.public_id
        
        # Si es una cadena (URL), extraer el public_id
        url_str = str(cloudinary_field)
        
        # Intentar extraer de la URL
        patterns = [
            r'/upload/(?:v\d+/)?([^/.]+)(?:\.[^/.]+)?$',
            r'/image/upload/(?:v\d+/)?(.+?)(?:\.[^/.]+)?$',
            r'/([^/]+)(?:\.[^/.]+)?$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url_str)
            if match:
                public_id = match.group(1)
                # Asegurarse de que tenga la carpeta 'profiles/'
                if public_id and not public_id.startswith('profiles/'):
                    return f'profiles/{public_id}'
                return public_id
        
        # Si es solo un public_id (sin URL completa)
        if '/' not in url_str or 'cloudinary.com' not in url_str:
            if not url_str.startswith('profiles/'):
                return f'profiles/{url_str}'
            return url_str
            
    except Exception as e:
        print(f"Error obteniendo public_id de {cloudinary_field}: {e}")
    
    return None
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