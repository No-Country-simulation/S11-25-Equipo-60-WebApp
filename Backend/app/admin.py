from django.contrib import admin
from .models import *
from django.contrib.auth.models import Group as DefaultGroup
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import UserCreationForm

# PRIMERO: Se Define UserAdmin y ClienteAdmin ANTES de usarlos
class UserAdminForm(forms.ModelForm):
    """
    Formulario personalizado para manejar la selección única de grupos
    """
    group_choice = forms.ModelChoiceField(
        queryset=Group.objects.all(),
        widget=forms.RadioSelect,
        required=True,
        label="Grupo",
        help_text="Selecciona UN solo grupo. El usuario debe pertenecer a un grupo."
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
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'get_user_groups')
    search_fields = ('username', 'email')

    # Usar nuestro formulario personalizado
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
class ClienteAdmin(UserAdmin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.verbose_name = 'Usuario'
        self.model._meta.verbose_name_plural = 'Usuarios Totales'
    
    def get_queryset(self, request):
        # Mostrar todos los usuarios
        return super().get_queryset(request)

    list_display = ('username', 'email', 'get_date_joined', 
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
class VisitanteAdmin(ClienteAdmin):
    
    group_name = "visitante"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model._meta.verbose_name = 'Usuario Visitante'
        self.model._meta.verbose_name_plural = 'Usuarios Visitantes'

    def get_queryset(self, request):
        return super().get_queryset(request).filter(groups__name=self.group_name)


# Formulario para Editores
@admin.register(Editor)
class EditorAdmin(ClienteAdmin):

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
class AdminUserAdmin(ClienteAdmin):

    add_form = UserCreationForm
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
class RolesAdmin(admin.ModelAdmin):
    list_display = ['name']
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
class OrganizacionAdmin(admin.ModelAdmin):

    list_display = ("organizacion_nombre", "api_key", "get_editores_list")
    search_fields = ("organizacion_nombre",)
    list_filter = ("fecha_registro",)
    ordering = ("-id",)
    readonly_fields = ("fecha_registro", "api_key")
    filter_horizontal = ("editores",)

    def get_editores_count(self, obj):
        return obj.editores.count()
    get_editores_count.short_description = "N° Editores"

    def get_editores_list(self, obj):
        editores = obj.editores.all()[:3]
        return ", ".join([editor.username for editor in editores])
    get_editores_list.short_description = "Editores"

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "editores":
            kwargs["queryset"] = User.objects.filter(groups__name="editor")
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    # 👈 AGREGAR ESTE MÉTODO PARA MEJORES MENSAJES DE ERROR
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

# ===============================
#   ADMIN CATEGORIA
# ===============================
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):

    list_display = ("nombre_categoria", 'icono', 'color', "fecha_registro")
    search_fields = ("nombre_categoria",)
    list_filter = ("fecha_registro",)
    ordering = ("-id",)

    readonly_fields = ("fecha_registro",)


# ===============================
#   ADMIN TESTIMONIOS
# ===============================
@admin.register(Testimonios)
class TestimoniosAdmin(admin.ModelAdmin):

    list_display = (
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