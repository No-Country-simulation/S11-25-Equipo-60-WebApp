from django.contrib import admin
from .models import *
from django.contrib.auth.models import Group as DefaultGroup
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import UserCreationForm

# PRIMERO: Se Define UserAdmin y ClienteAdmin ANTES de usarlos
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'get_user_groups')
    search_fields = ('username', 'email')

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
        ('Grupos', {'fields': ('groups',)}),  # 👈 Agregado grupos al editar
        #('Información personal', {'fields': ('first_name', 'last_name',)}),
        #('Permisos', {
        #    'fields': ('is_active',),
        #}),
    )

    def get_form(self, request, obj=None, **kwargs):
        defaults = {}
        if obj is None:
            defaults['form'] = self.add_form
        else:
            defaults['form'] = self.form
            
        defaults.update(kwargs)
        form = super().get_form(request, obj, **defaults)

        return form
    
    # Método para mostrar los grupos del usuario
    def get_user_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])
    get_user_groups.short_description = 'Grupos'  # 👈 Nombre de la columna

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

    def get_exclude(self, request, obj=None):
        # 👈 Solo excluir grupos al CREAR, no al EDITAR
        if obj is None:  # Creando nuevo usuario
            return ('groups',)
        return super().get_exclude(request, obj)

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

    def get_exclude(self, request, obj=None):
        # 👈 Solo excluir grupos al CREAR, no al EDITAR
        if obj is None:  # Creando nuevo usuario
            return ('groups',)
        return super().get_exclude(request, obj)

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
        self.model._meta.verbose_name = 'Usuario Administrador'
        self.model._meta.verbose_name_plural = 'Usuarios Administradores'

    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            is_staff=True,
            is_superuser=True
        )

    # Campos que aparecen en la edición
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Estado', {'fields': ('is_active',)}),
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
    filter_horizontal = ['permissions']


# ===============================
#   ADMIN ORGANIZACION
# ===============================
@admin.register(Organizacion)
class OrganizacionAdmin(admin.ModelAdmin):

    list_display = ("organizacion_nombre", "usuario_organizacion", "fecha_registro")
    search_fields = ("organizacion_nombre", "usuario_organizacion__username", "usuario_organizacion__email")
    list_filter = ("fecha_registro",)
    ordering = ("-id",)
    list_select_related = ("usuario_organizacion",)
    readonly_fields = ("fecha_registro",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        # FILTRAR SOLO EDITORES
        if db_field.name == "usuario_organizacion":
            kwargs["queryset"] = User.objects.filter(groups__name="editor")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


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
        "comentario_texto",
        "ranking",
        "estado",
        "fecha_comentario",
    )

    list_filter = ("estado", "categoria", "organizacion")
    search_fields = (
        "comentario_texto",
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