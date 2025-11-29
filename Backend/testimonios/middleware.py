from django.shortcuts import redirect

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
    
class OTPVerificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # URLs que deben excluirse de la verificación OTP
        excluded_paths = [
            '/admin/login/',
            '/admin/logout/',
            '/admin/otp-verification/',
            '/app/',
            '/app/docs/',
            '/app/schema/',
            '/app/login/',
            '/app/token/refresh/',
            '/favicon.ico',
            '/static/',
            '/media/',
        ]
        
        current_path = request.path
        
        # Si es una URL excluida, no aplicar la verificación OTP
        if any(current_path.startswith(path) for path in excluded_paths):
            return self.get_response(request)
        
        # DEBUG: Mostrar información útil
        # print(f"Path: {current_path}, Authenticated: {request.user.is_authenticated}, OTP Verified: {request.session.get('otp_verified')}")
        
        # Verificar si el usuario está autenticado y accediendo al admin
        if (request.user.is_authenticated and 
            request.path.startswith('/admin/') and 
            not request.user.is_anonymous):
            
            # Verificar si el usuario necesita verificación OTP
            if hasattr(request.user, 'is_verified'):
                # Si no está verificado y no está ya en la página OTP, redirigir
                if not request.user.is_verified() and not request.session.get('otp_verified'):
                    # Solo redirigir si no estamos ya en la página OTP
                    if not request.path.startswith('/admin/otp-verification/'):
                        return redirect('otp_verification')
        
        response = self.get_response(request)
        return response