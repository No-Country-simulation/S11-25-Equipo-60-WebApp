from django.apps import AppConfig


class AppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app'
    verbose_name = 'Testimonial Data'
    
    def ready(self):
        # Importa y registra las señales
        import app.signals
        
        # Personalizar nombres de apps relacionadas
        from django.apps import apps
        try:
            totp_app = apps.get_app_config('otp_totp')
            totp_app.verbose_name = 'Autenticacion en 2 pasos'
        except LookupError:
            pass
