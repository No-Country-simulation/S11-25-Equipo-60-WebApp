#Eliminar registros en la tabla admin_log_entry que es relativamente el historial de acciones realizadas del admin
class DisableAdminLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.original_save = None  # Inicializa la variable aquí
    def __call__(self, request):
        response = self.get_response(request)
        return response
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Si es una acción del admin, deshabilitar logging
        if hasattr(view_func, 'admin_site'):
            # Deshabilitar temporalmente el logging
            from django.contrib.admin.models import LogEntry
            self.original_save = LogEntry.save  # Guarda el método original
            def noop_save(self, *args, **kwargs):
                return
            LogEntry.save = noop_save
            request._admin_log_disabled = True
        return None
    def process_response(self, request, response):
        # Restaurar el comportamiento original si fue deshabilitado
        if hasattr(request, '_admin_log_disabled'):
            from django.contrib.admin.models import LogEntry
            LogEntry.save = self.original_save  # Usa el método guardado
        return response