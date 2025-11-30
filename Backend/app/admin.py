from django.contrib import admin
from .models import *
from django.contrib.auth.models import Group as DefaultGroup
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import UserCreationForm
from unfold.admin import ModelAdmin as UnfoldModelAdmin

from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.plugins.otp_totp.admin import TOTPDeviceAdmin

# Desregistrar el admin por defecto de TOTPDevice
admin.site.unregister(TOTPDevice)

# Registrar TOTPDevice con nombre personalizado
@admin.register(TOTPDevice)
class CustomTOTPDeviceAdmin(TOTPDeviceAdmin):
    # Cambiar el verbose_name del modelo
    class Meta:
        verbose_name = 'Usuario 2FA'
        verbose_name_plural = 'Usuarios 2FA'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Cambiar el nombre en la lista de modelos
        self.model._meta.verbose_name = 'Usuario 2FA'
        self.model._meta.verbose_name_plural = 'Usuarios 2FA'
class CustomUserCreationForm(UserCreationForm):
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

# PRIMERO: Se Define UserAdmin y ClienteAdmin ANTES de usarlos
class UserAdminForm(forms.ModelForm, UnfoldModelAdmin):
    """
    Formulario personalizado para manejar la selección única de grupos
    """
    group_choice = forms.ModelChoiceField(
        queryset=Group.objects.all(),
        widget=forms.RadioSelect,
        required=True,
        label="Grupo",
        help_text="Selecciona un solo grupo. El usuario debe pertenecer a un grupo."
    )
    
    class Meta:
        model = User
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        instance = kwargs.get('instance')
        
        # Establecer el valor inicial si existe
        if instance and instance.groups.exists():
            self.fields['group_choice'].initial = instance.groups.first()
        
        # OCULTAR el campo groups original
        if 'groups' in self.fields:
            self.fields['groups'].widget = forms.HiddenInput()
            self.fields['groups'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        # Validar que se seleccionó un grupo
        if not cleaned_data.get('group_choice'):
            raise ValidationError({
                'group_choice': 'Debe seleccionar un grupo para el usuario.'
            })
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        
        if commit:
            user.save()
        
        # Asignar el grupo seleccionado
        selected_group = self.cleaned_data.get('group_choice')
        if selected_group:
            user.groups.set([selected_group])
        
        return user

# PRIMERO: Se Define UserAdmin y ClienteAdmin ANTES de usarlos
class UserAdmin(BaseUserAdmin, UnfoldModelAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'get_user_groups')
    search_fields = ('username', 'email')

    # Usar formularios personalizados
    add_form = CustomUserCreationForm  # 👈 NUEVO FORMULARIO PARA CREACIÓN
    form = UserAdminForm


    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2')
        }),
        #('Información personal', {
        #    'classes': ('wide',),
        #    'fields': ('first_name', 'last_name', )
        #}),
        #('Permisos', {
        #    'classes': ('wide',),
        #    'fields': ('is_active',)
        #}),
    )

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Grupos', {'fields': ('group_choice',)}),  # 👈 Cambiar 'groups' por 'group_choice'
        #('Información personal', {'fields': ('first_name', 'last_name',)}),
        #('Permisos', {
        #    'fields': ('is_active',),
        #}),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Personalizar el widget de grupos para selección única
        if 'groups' in form.base_fields:
            form.base_fields['groups'].widget = forms.RadioSelect()
            form.base_fields['groups'].help_text = "Selecciona un solo grupo. El usuario debe pertenecer a un grupo."
            form.base_fields['groups'].required = True
            
        return form
    
    # Método para mostrar los grupos del usuario
    def get_user_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])
    get_user_groups.short_description = 'Grupos'

    # Validar que el usuario tenga exactamente un grupo
    def clean_groups(self):
        groups = self.cleaned_data.get('groups')
        if groups.count() != 1:
            raise ValidationError("El usuario debe pertenecer a exactamente UN grupo.")
        return groups

    def save_model(self, request, obj, form, change):
        # Asegurar que el usuario tenga exactamente un grupo después de guardar
        super().save_model(request, obj, form, change)
        
        # Si no tiene grupos, asignar uno por defecto
        if obj.groups.count() == 0:
            default_group, created = Group.objects.get_or_create(name='visitante')
            obj.groups.add(default_group)
        
        # Si tiene más de un grupo, dejar solo el primero
        elif obj.groups.count() > 1:
            first_group = obj.groups.first()
            obj.groups.set([first_group])

    class Media:
        js = ('admin/js/user_admin.js',)

# SEGUNDO: Se Define ClienteAdmin
class ClienteAdmin(UserAdmin, UnfoldModelAdmin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.verbose_name = 'Usuario'
        self.model._meta.verbose_name_plural = 'Usuarios Totales'
    
    def get_queryset(self, request):
        # Mostrar todos los usuarios
        return super().get_queryset(request)

    list_display = ('id', 'username', 'email', 'get_date_joined', 
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
    form = forms.ModelForm

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
    )

    # Campos que aparecen al crear un admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2')
        }),
    )

    exclude = ('groups',)

    def save_model(self, request, obj, form, change):

        # FORZAR SIEMPRE A SER ADMIN
        obj.is_superuser = True
        obj.is_staff = True
        obj.is_active = True

        super().save_model(request, obj, form, change)


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

    list_display = ("id", "organizacion_nombre", "api_key", "get_editores_list", "get_visitantes_count")
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