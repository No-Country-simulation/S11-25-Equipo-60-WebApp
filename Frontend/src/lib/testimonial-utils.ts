import type { Testimonio } from "@/interfaces"

/**
 * Obtiene el nombre de usuario de un testimonio, manejando
 * tanto el caso donde usuario_registrado es un string como un objeto
 */
export function getTestimonialUsername(testimonio: Testimonio): string {
    if (testimonio.usuario_registrado) {
        // Si es un objeto, extraer el username
        if (typeof testimonio.usuario_registrado === 'object' && 'username' in testimonio.usuario_registrado) {
            return testimonio.usuario_registrado.username
        }
        // Si es string, devolverlo directamente
        return testimonio.usuario_registrado
    }
    return testimonio.usuario_anonimo_username || 'Anónimo'
}

/**
 * Obtiene el email de un testimonio (solo para usuarios registrados tipo objeto)
 */
export function getTestimonialEmail(testimonio: Testimonio): string | undefined {
    if (testimonio.usuario_registrado && typeof testimonio.usuario_registrado === 'object' && 'email' in testimonio.usuario_registrado) {
        return testimonio.usuario_registrado.email
    }
    return testimonio.usuario_anonimo_email
}
