class DisableAdminLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Verificar si es una solicitud al admin
        if request.path.startswith('/admin/'):
            # Deshabilitar el logging del admin
            from django.contrib.admin.models import LogEntry
            self.original_save = LogEntry.save
            
            # Reemplazar el método save para que no haga nada
            def disabled_save(self, *args, **kwargs):
                return None
                
            LogEntry.save = disabled_save
        
        response = self.get_response(request)
        
        # Restaurar el método original después de procesar la respuesta
        if request.path.startswith('/admin/'):
            LogEntry.save = self.original_save
            
        return response