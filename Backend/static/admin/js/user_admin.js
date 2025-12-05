// static/admin/js/user_admin.js
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar preview de la foto cuando se selecciona una nueva
    const profilePictureInput = document.querySelector('input[name="profile_picture"]');
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Crear o actualizar el preview
                    let preview = document.querySelector('.profile-picture-preview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'profile-picture-preview';
                        profilePictureInput.parentNode.appendChild(preview);
                    }
                    preview.innerHTML = `
                        <div style="margin: 10px 0;">
                            <strong>Nueva foto:</strong><br>
                            <img src="${e.target.result}" width="100" height="100" style="border-radius: 50%; margin-top: 5px;" />
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Manejar el checkbox de eliminar foto
    const clearPhotoCheckbox = document.querySelector('input[name="clear_profile_picture"]');
    if (clearPhotoCheckbox) {
        clearPhotoCheckbox.addEventListener('change', function() {
            const profilePictureInput = document.querySelector('input[name="profile_picture"]');
            if (this.checked && profilePictureInput) {
                profilePictureInput.disabled = true;
                profilePictureInput.value = '';
                
                // Ocultar preview si existe
                const preview = document.querySelector('.profile-picture-preview');
                if (preview) {
                    preview.style.display = 'none';
                }
            } else if (profilePictureInput) {
                profilePictureInput.disabled = false;
                
                // Mostrar preview si existe
                const preview = document.querySelector('.profile-picture-preview');
                if (preview) {
                    preview.style.display = 'block';
                }
            }
        });
    }
});