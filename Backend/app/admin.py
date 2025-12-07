from django.contrib import admin
from .models import *
from django.contrib.auth.models import Group as DefaultGroup
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import UserCreationForm
from unfold.admin import ModelAdmin as UnfoldModelAdmin

from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.plugins.otp_totp.admin import TOTPDeviceAdmin
from django.contrib import messages

from django.utils.html import format_html
# Desregistrar el admin por defecto de TOTPDevice
admin.site.unregister(TOTPDevice)

from cloudinary import uploader
# Registrar TOTPDevice con nombre personalizado
@admin.register(TOTPDevice)
class CustomTOTPDeviceAdmin(TOTPDeviceAdmin, UnfoldModelAdmin):
    # Cambiar el verbose_name del modelo
    class Meta:
        verbose_name = 'Usuario 2FA'
        verbose_name_plural = 'Usuarios 2FA'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Cambiar el nombre en la lista de modelos
        self.model._meta.verbose_name = 'Usuario 2FA'
        self.model._meta.verbose_name_plural = 'Usuarios 2FA'
    
    # Definir list_display como atributo de clase para evitar el error
    list_display = ('user', 'name', 'confirmed', 'user_is_staff')
    
    def get_queryset(self, request):
        """
        Mostrar solo TOTPDevices de usuarios staff
        """
        qs = super().get_queryset(request)
        return qs.filter(user__is_staff=True)
    
    def user_is_staff(self, obj):
        """
        Mostrar si el usuario es staff
        """
        return obj.user.is_staff if obj.user else False
    user_is_staff.short_description = 'Es Staff'
    user_is_staff.boolean = True
    user_is_staff.admin_order_field = 'user__is_staff'
    
    def get_readonly_fields(self, request, obj=None):
        """
        Hacer el campo user de solo lectura si ya existe el dispositivo
        """
        readonly_fields = list(super().get_readonly_fields(request, obj))
        if obj and obj.pk:
            readonly_fields.append('user')
        return readonly_fields
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filtrar usuarios para mostrar solo los que son staff
        """
        if db_field.name == "user":
            from django.contrib.auth import get_user_model
            User = get_user_model()
            kwargs["queryset"] = User.objects.filter(is_staff=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def has_add_permission(self, request):
        """
        Permitir agregar solo si hay usuarios staff disponibles
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        staff_users = User.objects.filter(is_staff=True)
        return staff_users.exists() and super().has_add_permission(request)
    
    def save_model(self, request, obj, form, change):
        """
        Validar que el usuario sea staff antes de guardar
        """
        # Verificar si el usuario es staff
        if not obj.user.is_staff:
            messages.error(
                request, 
                'Solo los usuarios con permisos de staff pueden tener autenticación en 2 pasos.'
            )
            return
        
        # Verificar si ya existe un dispositivo para este usuario
        existing_device = TOTPDevice.objects.filter(user=obj.user).exclude(pk=obj.pk).first()
        if existing_device:
            messages.warning(
                request,
                f'El usuario {obj.user.username} ya tiene un dispositivo 2FA configurado.'
            )
        
        super().save_model(request, obj, form, change)
    
    def get_actions(self, request):
        """
        Limitar acciones para dispositivos de usuarios no staff
        """
        actions = super().get_actions(request)
        
        # Obtener dispositivos de usuarios no staff
        non_staff_devices = TOTPDevice.objects.filter(user__is_staff=False)
        
        # Si hay dispositivos de usuarios no staff, mostrar advertencia
        if non_staff_devices.exists():
            messages.warning(
                request,
                f'Existen {non_staff_devices.count()} dispositivos 2FA de usuarios no staff. '
                'Estos serán eliminados automáticamente.'
            )
            
            # Eliminar automáticamente dispositivos de usuarios no staff
            deleted_count = non_staff_devices.delete()[0]
            if deleted_count > 0:
                messages.info(
                    request,
                    f'Se eliminaron {deleted_count} dispositivos 2FA de usuarios no staff.'
                )
        
        return actions
    
class CustomUserCreationForm(UserCreationForm):
    profile_picture = forms.ImageField(
        required=False,
        help_text='Selecciona una foto de perfil (opcional)'
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Aplicar clases de Unfold a los campos de contraseña
        unfold_classes = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        
        self.fields['password1'].widget.attrs.update({
            'class': unfold_classes,
            'placeholder': 'Contraseña'
        })
        self.fields['password2'].widget.attrs.update({
            'class': unfold_classes,
            'placeholder': 'Confirmar contraseña'
        })
        self.fields['profile_picture'].widget.attrs.update({
            'class': unfold_classes,
            'accept': 'image/*'
        })
    
    def save(self, commit=True):
        user = super().save(commit=commit)
        
        # Guardar la foto de perfil si se proporcionó
        if 'profile_picture' in self.cleaned_data and self.cleaned_data['profile_picture']:
            user.profile_picture = self.cleaned_data['profile_picture']
            if commit:
                user.save()
        
        return user

class UserAdminForm(forms.ModelForm):
    """
    Formulario personalizado para manejar la selección única de grupos
    Y el manejo adecuado de fotos de perfil
    """
    group_choice = forms.ModelChoiceField(
        queryset=Group.objects.all(),
        widget=forms.RadioSelect,
        required=False,
        label="Grupo",
        help_text="Selecciona un solo grupo. El usuario debe pertenecer a un grupo."
    )
    
    # Campo para eliminar la foto existente
    clear_profile_picture = forms.BooleanField(
        required=False,
        label="Eliminar foto actual",
        help_text="Marca esta opción para eliminar la foto de perfil actual"
    )
    
    # Campo para indicar si se está subiendo una nueva foto
    _is_new_picture = False
    
    class Meta:
        model = User
        fields = '__all__'
        widgets = {
            'profile_picture': forms.ClearableFileInput(attrs={'accept': 'image/*'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        instance = kwargs.get('instance')

        # Si es un admin (staff y superuser), no mostrar grupos
        if instance and instance.is_staff and instance.is_superuser:
            self.fields['group_choice'].widget = forms.HiddenInput()
            self.fields['group_choice'].required = False
            self.fields['group_choice'].help_text = "Los administradores no pertenecen a grupos"
        else:
            # Establecer el valor inicial si existe para no-admins
            if instance and instance.groups.exists():
                self.fields['group_choice'].initial = instance.groups.first()
        
        
        # Mostrar preview de la foto actual si existe
        if instance and instance.profile_picture:
            self.fields['profile_picture'].help_text = format_html(
                '<div style="margin: 10px 0;">'
                '<strong>Foto actual:</strong><br>'
                '<img src="{}" width="100" height="100" style="border-radius: 50%; margin-top: 5px;" />'
                '</div>',
                instance.profile_picture.url
            )
        
        # OCULTAR el campo groups original
        if 'groups' in self.fields:
            self.fields['groups'].widget = forms.HiddenInput()
            self.fields['groups'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Validar que NO se asigne grupo a admins
        instance_user = self.instance
        group_choice = cleaned_data.get('group_choice')
        
        # Si el usuario es o será admin, no debe tener grupo
        if (instance_user and instance_user.is_staff and instance_user.is_superuser) or \
           (cleaned_data.get('is_staff') and cleaned_data.get('is_superuser')):
            if group_choice:
                raise ValidationError({
                    'group_choice': 'Los administradores no deben pertenecer a ningún grupo.'
                })
        # Si no es admin, debe tener un grupo
        elif not group_choice:
            raise ValidationError({
                'group_choice': 'Los usuarios no administradores deben seleccionar un grupo.'
            })
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        
        # Marcar si se está subiendo una nueva foto
        profile_picture = self.cleaned_data.get('profile_picture')
        if profile_picture and hasattr(profile_picture, 'file'):
            self._is_new_picture = True
        
        # Verificar si se solicitó eliminar la foto
        if self.cleaned_data.get('clear_profile_picture'):
            # Solo marcar para eliminación, las señales se encargarán
            pass
        
        # Guardar el usuario
        if commit:
            user.save()
        
        # Manejar grupos según el tipo de usuario
        selected_group = self.cleaned_data.get('group_choice')
        
        # Si es admin: eliminar todos los grupos
        if user.is_staff and user.is_superuser:
            user.groups.clear()  # 👈 Limpiar todos los grupos
        # Si no es admin y hay grupo seleccionado: asignarlo
        elif selected_group:
            user.groups.set([selected_group])
        # Si no es admin y no hay grupo: asignar grupo por defecto
        else:
            default_group, created = Group.objects.get_or_create(name='visitante')
            user.groups.set([default_group])
        
        return user

class UserAdmin(BaseUserAdmin, UnfoldModelAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'get_user_groups', 'display_profile_picture')
    search_fields = ('username', 'email')
    
    # Usar formularios personalizados
    add_form = CustomUserCreationForm
    form = UserAdminForm
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'profile_picture')
        }),
    )
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Grupos', {'fields': ('group_choice',)}),
        ('Foto de perfil', {
            'fields': ('profile_picture', 'clear_profile_picture'),
            'description': 'Sube una nueva foto o marca la opción para eliminar la actual'
        }),
    )
    
    def display_profile_picture(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 50%;" />',
                obj.profile_picture.url
            )
        return "Sin foto"
    display_profile_picture.short_description = 'Foto'
    
    # Método para mostrar los grupos del usuario
    def get_user_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])
    get_user_groups.short_description = 'Grupos'
    
    def save_model(self, request, obj, form, change):
        """
        Sobrescribir save_model para manejar fotos correctamente
        """
        # Antes de guardar, obtener la instancia original si existe
        old_instance = None
        if change and obj.pk:
            try:
                old_instance = User.objects.get(pk=obj.pk)
            except User.DoesNotExist:
                old_instance = None
        
        # Llamar al método original
        super().save_model(request, obj, form, change)
        
        # Asegurar que el usuario tenga exactamente un grupo después de guardar
        if obj.groups.count() == 0:
            default_group, created = Group.objects.get_or_create(name='visitante')
            obj.groups.add(default_group)
        
        # Si tiene más de un grupo, dejar solo el primero
        elif obj.groups.count() > 1:
            first_group = obj.groups.first()
            obj.groups.set([first_group])
    
    def delete_model(self, request, obj):
        """
        Eliminar la foto de Cloudinary antes de borrar el usuario
        """
        # Eliminar foto de Cloudinary si existe
        if obj.profile_picture:
            try:
                public_id = obj.profile_picture.public_id
                if public_id:
                    uploader.destroy(public_id, resource_type='image')
                    print(f"✅ Foto eliminada de Cloudinary al borrar usuario: {public_id}")
            except Exception as e:
                print(f"⚠️ Error eliminando foto al borrar usuario: {e}")
        
        # Llamar al método original de eliminación
        super().delete_model(request, obj)

    
    # Validar que el usuario tenga exactamente un grupo
    def clean_groups(self):
        groups = self.cleaned_data.get('groups')
        if groups.count() != 1:
            raise ValidationError("El usuario debe pertenecer a exactamente UN grupo.")
        return groups
    
    def delete_queryset(self, request, queryset):
        """
        Eliminar fotos de Cloudinary cuando se borran múltiples usuarios
        """
        # Eliminar fotos de cada usuario
        for user in queryset:
            if user.profile_picture:
                try:
                    public_id = user.profile_picture.public_id
                    if public_id:
                        uploader.destroy(public_id, resource_type='image')
                        print(f"✅ Foto eliminada de Cloudinary al borrar usuario {user.username}: {public_id}")
                except Exception as e:
                    print(f"⚠️ Error eliminando foto al borrar usuario {user.username}: {e}")
        
        # Llamar al método original
        super().delete_queryset(request, queryset)
    class Media:
        js = ('admin/js/user_admin.js',)


# SEGUNDO: Se Define ClienteAdmin
class ClienteAdmin(UserAdmin, UnfoldModelAdmin):


    def display_profile_picture(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%;" />', obj.profile_picture.url)
        return "Sin foto"
    
    display_profile_picture.short_description = 'Foto de perfil'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.verbose_name = 'Usuario'
        self.model._meta.verbose_name_plural = 'Usuarios Totales'
    
    def get_queryset(self, request):
        # Mostrar todos los usuarios
        return super().get_queryset(request)

    list_display = ('id', 'username', 'email', 'get_date_joined',  'display_profile_picture', 
    #'get_user_groups'
    )
    ordering = ('-date_joined',)
    list_filter = ('date_joined',)

    # Método personalizado para mostrar date_joined con nombre personalizado
    def get_date_joined(self, obj):
        return obj.date_joined
    get_date_joined.short_description = 'Fecha de registro'  # 👈 Cambiado aquí
    get_date_joined.admin_order_field = 'date_joined'  # 👈 Para mantener el ordenamiento

# Formulario para Visitantes
@admin.register(Visitante)
class VisitanteAdmin(ClienteAdmin, UnfoldModelAdmin):
    
    group_name = "visitante"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.verbose_name = 'Usuario Visitante'
        self.model._meta.verbose_name_plural = 'Usuarios Visitantes'

    def get_queryset(self, request):
        return super().get_queryset(request).filter(groups__name=self.group_name)


# Formulario para Editores
@admin.register(Editor)
class EditorAdmin(ClienteAdmin, UnfoldModelAdmin):

    group_name = "editor"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.verbose_name = 'Usuario Editor'
        self.model._meta.verbose_name_plural = 'Usuarios Editores'

    def get_queryset(self, request):
        return super().get_queryset(request).filter(groups__name=self.group_name)
    

    def save_model(self, request, obj, form, change):
        # Solo asignar grupo automáticamente al CREAR
        if not change:  # Si es nuevo usuario
            super().save_model(request, obj, form, change)
            from django.contrib.auth.models import Group
            grupo, created = Group.objects.get_or_create(name=self.group_name)
            
            # Asignar grupo automáticamente solo al crear
            if not obj.groups.filter(name=self.group_name).exists():
                obj.groups.clear()
                obj.groups.add(grupo)
        else:
            # Al editar, guardar normalmente (permite cambiar grupos)
            super().save_model(request, obj, form, change)




#Formulario para admins

@admin.register(AdminUser)
class AdminUserAdmin(ClienteAdmin, UnfoldModelAdmin):

    add_form = CustomUserCreationForm  # 👈 CAMBIAR AQUÍ
    form = UserAdminForm  # 👈 CAMBIAR A UserAdminForm para la edición

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.verbose_name = 'Usuario Admin'
        self.model._meta.verbose_name_plural = 'Usuarios Admins'

    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            is_staff=True,
            is_superuser=True
        )

    # Campos que aparecen en la edición
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Foto de perfil', {
            'fields': ('profile_picture', 'clear_profile_picture'),
            'description': 'Sube una nueva foto o marca la opción para eliminar la actual'
        }),
    )

    # Campos que aparecen al crear un admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email',  'password1', 'password2', 'profile_picture')
        }),
    )

    exclude = ('groups',)

    def save_model(self, request, obj, form, change):
        """
        Sobrescribir para forzar que los admins:
        1. Sean staff y superuser
        2. NO tengan grupos asignados
        """
        # FORZAR SIEMPRE A SER ADMIN
        obj.is_superuser = True
        obj.is_staff = True
        
        # Guardar primero
        super(ClienteAdmin, self).save_model(request, obj, form, change)
        
        # GARANTIZAR QUE NO TENGA GRUPOS
        obj.groups.clear()  # 👈 Esto es CRÍTICO
        
        # Mensaje informativo
        from django.contrib import messages
        messages.info(
            request,
            'Usuario admin creado/actualizado. Los administradores no pertenecen a grupos.'
        )


# CUARTO: Desregistrar y registrar modelos

# Desregistrar el Group por defecto
admin.site.unregister(DefaultGroup)

# Registrar tu modelo personalizado de Roles
@admin.register(Roles)
class RolesAdmin(UnfoldModelAdmin):
    list_display = ["id", 'name']
    search_fields = ['name']
    
    # 👇 ESTAS SON LAS LÍNEAS CLAVE QUE NECESITAS AGREGAR/MODIFICAR
    fields = ['name']  # Solo mostrar el campo 'name' en el formulario
    exclude = ['permissions']  # Excluir completamente el campo permissions
    
    # Opcional: Si quieres usar filter_horizontal pero vacío
    # filter_horizontal = []  # Esto mostrará interfaces vacías
    
    def get_form(self, request, obj=None, **kwargs):
        """
        Personalizar el formulario para ocultar completamente los permisos
        """
        form = super().get_form(request, obj, **kwargs)
        
        # Remover el campo permissions si existe en el formulario
        if 'permissions' in form.base_fields:
            del form.base_fields['permissions']
            
        return form
    
    def save_model(self, request, obj, form, change):
        """
        Guardar el modelo sin permisos
        """
        # Limpiar cualquier permiso que pudiera asignarse
        obj.save()
        obj.permissions.clear()  # Asegurar que no tenga permisos


# ===============================
#   ADMIN ORGANIZACION
# ===============================
@admin.register(Organizacion)
class OrganizacionAdmin(UnfoldModelAdmin):

    list_display = ("id", "organizacion_nombre", "dominio", "get_editores_list", "get_visitantes_count")
    search_fields = ("organizacion_nombre",)
    list_filter = ("fecha_registro",)
    ordering = ("-id",)
    readonly_fields = ("fecha_registro", "api_key")
    
    # 👇 AGREGAR filter_horizontal PARA AMBOS CAMPOS
    filter_horizontal = ("editores", "visitantes")

    def get_editores_count(self, obj):
        return obj.editores.count()
    get_editores_count.short_description = "N° Editores"

    def get_visitantes_count(self, obj):
        return obj.visitantes.count()
    get_visitantes_count.short_description = "N° Visitantes"

    def get_editores_list(self, obj):
        editores = obj.editores.all()[:3]
        return ", ".join([editor.username for editor in editores])
    get_editores_list.short_description = "Editores"

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "editores":
            kwargs["queryset"] = User.objects.filter(groups__name="editor")
            # 👇 PERSONALIZAR LAS ETIQUETAS PARA EDITORES
            kwargs["label"] = "Editores"
            kwargs["help_text"] = ""
        elif db_field.name == "visitantes":
            kwargs["queryset"] = User.objects.filter(groups__name="visitante")
            # 👇 PERSONALIZAR LAS ETIQUETAS PARA VISITANTES
            kwargs["label"] = "Visitantes"
            kwargs["help_text"] = ""
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    # 👇 SOBREESCRIBER EL MÉTODO PARA PERSONALIZAR LOS TÍTULOS
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Personalizar las etiquetas de los campos ManyToMany
        if 'editores' in form.base_fields:
            form.base_fields['editores'].label = "Editores"
            form.base_fields['editores'].help_text = "Selecciona los editores para esta organización"
            
        if 'visitantes' in form.base_fields:
            form.base_fields['visitantes'].label = "Visitantes"
            form.base_fields['visitantes'].help_text = "Selecciona los visitantes para esta organización"
            
        return form

    # 👇 AGREGAR ESTE MÉTODO PARA MEJORES MENSAJES DE ERROR
    def save_model(self, request, obj, form, change):
        try:
            super().save_model(request, obj, form, change)
        except Exception as e:
            from django.contrib import messages
            if "duplicate key" in str(e) and "dominio" in str(e):
                messages.error(request, f"Error: Ya existe una organización con el dominio '{obj.dominio}'. Por favor usa un dominio diferente.")
            else:
                messages.error(request, f"Error al guardar: {str(e)}")
            raise

    # 👇 OPCIONAL: PERSONALIZAR LOS FIELDSETS PARA MEJOR ORGANIZACIÓN
    fieldsets = (
        ('Información Básica', {
            'fields': ('organizacion_nombre', 'dominio', 'api_key')
        }),
        ('Editores', {
            'fields': ('editores',),
            'description': 'Selecciona los editores que pueden gestionar esta organización'
        }),
        ('Visitantes', {
            'fields': ('visitantes',),
            'description': 'Selecciona los visitantes que pueden acceder a esta organización'
        }),
        ('Fechas', {
            'fields': ('fecha_registro',),
            'classes': ('collapse',)
        }),
    )
# ===============================
#   ADMIN CATEGORIA
# ===============================
@admin.register(Categoria)
class CategoriaAdmin(UnfoldModelAdmin):

    list_display = ("id", "nombre_categoria", 'icono', 'color', "fecha_registro")
    search_fields = ("nombre_categoria",)
    list_filter = ("fecha_registro",)
    ordering = ("-id",)

    readonly_fields = ("fecha_registro",)


# ===============================
#   ADMIN TESTIMONIOS
# ===============================
@admin.register(Testimonios)
class TestimoniosAdmin(UnfoldModelAdmin):

    list_display = (
        "id",
        "get_usuario",
        "organizacion",
        "categoria",
        "comentario",
        "ranking",
        "estado",
        "fecha_comentario",
    )

    list_filter = ("estado", "categoria", "organizacion")
    search_fields = (
        "comentario",
        "usuario_registrado__username",
        "usuario_anonimo_username",
        "organizacion__organizacion_nombre",
        "categoria__nombre_categoria",
    )

    ordering = ("-fecha_comentario",)
    list_select_related = ("organizacion", "usuario_registrado", "categoria")

    readonly_fields = ("fecha_comentario",)

    # Mostrar usuario (registrado o anónimo)
    def get_usuario(self, obj):
        return obj.usuario_registrado.username if obj.usuario_registrado else obj.usuario_anonimo_username
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "usuario_registrado":
            try:
                grupo_editores = Group.objects.get(name="visitante")
                kwargs["queryset"] = User.objects.filter(groups=grupo_editores)
            except Group.DoesNotExist:
                kwargs["queryset"] = User.objects.none()

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    get_usuario.short_description = "Usuario"


#admin.site.register(User)