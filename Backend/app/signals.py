from django.db.models.signals import post_migrate, pre_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from .models import *
from cloudinary import uploader

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

# El decorador @receiver conecta la función 'delete_cloudinary_file'
# a la señal 'pre_delete' del modelo 'Testimonios'.
@receiver(pre_delete, sender=Testimonios)
def delete_cloudinary_file(sender, instance, **kwargs):
    """
    Elimina el archivo asociado a Cloudinary antes de borrar la instancia del modelo.
    """
    if instance.archivo:
        # La propiedad 'public_id' de CloudinaryField es lo que necesitamos.
        # Solo se elimina si el campo 'archivo' no es nulo/vacío.
        
        # Cloudinary necesita el ID público. El objeto FieldFile lo expone como public_id.
        public_id = instance.archivo.public_id
        
        # Elimina el recurso de Cloudinary.
        # 'resource_type' debe coincidir con el tipo de archivo que estás subiendo.
        # En el modelo usaste 'resource_type='auto''. 
        # Si no se especifica, Cloudinary por defecto asume 'image', 
        # lo mejor es forzar a 'auto' o intentar determinarlo.
        # Para evitar problemas, vamos a usar 'destroy' con un tipo (que por defecto es 'image').
        # Para archivos no imagen, es más seguro extraer el tipo del campo.
        
        try:
            # Obtiene el tipo de recurso del CloudinaryField (si lo tienes) o usa 'raw' como fallback.
            # Como estás usando 'resource_type='auto'', esto debería funcionar correctamente.
            # El método destroy detecta el tipo de recurso automáticamente si el public_id lo indica,
            # o puedes usar resource_type='raw' para archivos no imagen.
            resource_type = instance.archivo.resource_type if hasattr(instance.archivo, 'resource_type') else 'auto'
            
            # uploader.destroy elimina el archivo de Cloudinary.
            uploader.destroy(public_id, resource_type=resource_type)
            
            print(f"✅ Archivo Cloudinary eliminado: {public_id}")
            
        except Exception as e:
            # Si la eliminación falla (ej. el archivo ya no existe en Cloudinary),
            # simplemente registra el error y permite que la eliminación del modelo continúe.
            print(f"⚠️ Error al eliminar archivo de Cloudinary: {e}")


@receiver(pre_save, sender=Testimonios)
def delete_old_cloudinary_file(sender, instance, **kwargs):
    """
    Elimina el archivo antiguo de Cloudinary SOLO si el campo 'archivo' ha sido modificado.
    """
    # 1. Verificar si la instancia ya tiene un ID (es decir, ya existe en la DB)
    if not instance.pk:
        return

    try:
        # 2. Obtener la versión existente del objeto desde la base de datos
        old_instance = Testimonios.objects.get(pk=instance.pk)
    except Testimonios.DoesNotExist:
        return

    # 3. Obtener los archivos antiguo y nuevo
    old_file = old_instance.archivo
    new_file = instance.archivo

    # 4. Verificar si el archivo realmente cambió
    # Si no hay archivo antiguo, no hay nada que eliminar
    if not old_file:
        return
        
    # 5. Detectar si el archivo cambió de diferentes maneras:
    # - Si new_file es None/False: se está eliminando el archivo
    # - Si new_file es un objeto diferente (InMemoryUploadedFile): se está subiendo un nuevo archivo
    # - Si new_file es el mismo objeto CloudinaryField: no hay cambio
    
    file_changed = False
    
    # Caso 1: Se eliminó el archivo (campo establecido como vacío/nulo)
    if not new_file:
        file_changed = True
    
    # Caso 2: Se subió un nuevo archivo (InMemoryUploadedFile)
    elif hasattr(new_file, 'file') and hasattr(new_file, 'name'):
        # Esto indica que es un archivo nuevo subido a través del formulario
        file_changed = True
    
    # Caso 3: Es el mismo objeto CloudinaryField (no hay cambio)
    else:
        # Comparar public_id solo si ambos son objetos CloudinaryField
        if hasattr(old_file, 'public_id') and hasattr(new_file, 'public_id'):
            if old_file.public_id != new_file.public_id:
                file_changed = True
    
    # 6. Si el archivo cambió, eliminar el archivo antiguo de Cloudinary
    if file_changed and old_file:
        try:
            public_id = old_file.public_id
            resource_type = old_file.resource_type if hasattr(old_file, 'resource_type') else 'auto'
            uploader.destroy(public_id, resource_type=resource_type)
            print(f"✅ Archivo Cloudinary antiguo eliminado al actualizar: {public_id}")
        except Exception as e:
            print(f"⚠️ Error al eliminar archivo Cloudinary antiguo en pre_save: {e}")