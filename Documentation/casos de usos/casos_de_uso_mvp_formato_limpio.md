
# Casos de Uso – Testimonial CMS (SaaS) – MVP Enfocado

Este documento describe los **casos de uso funcionales del MVP**, con formato claro, simple y priorizado.

---

# 🎭 Roles del MVP
- **Super Admin (SaaS):** Administra clientes y configuración global.
- **Admin del Cliente:** Gestiona editores, branding básico y dominios.
- **Editor:** Revisa testimonios (aprobar/rechazar).
- **Visitante (Usuario logueado del cliente):** Crea testimonios y los reenvía con feedback.
- **Usuario Anónimo:** Envía testimonios desde un formulario público.
- **Público:** Ve testimonios publicados.

---

# 📦 Entidades del MVP

### **Testimonio**
- texto, opcional multimedia (imagen/video)
- categoría (1)
- tags (N)
- autor (visitante o anónimo)
- estados del flujo editorial

### **Categorías**
- Lista fija o editable: producto, servicio, evento, industria, comentario.

### **Tags**
- Ejemplos: bueno, pésimo, increíble.
- Many-to-many.

### **Dominios**
- Tabla simple: dominio asignado a una organización del SaaS.  
- No hay validación DNS en MVP (solo string guardado).

### **Branding (configuración)**
- color primario
- tipografía (nombre)
- tamaño base del texto
- layout (list/grid/carousel)
- logo (URL)

---

# 🟦 1. Usuario Anónimo

## CU1 – Enviar Testimonio (Anónimo)
**Actor:** Usuario Anónimo  
**Descripción:** Envía un testimonio desde un formulario público.  
**Flujo:**
1. Accede al formulario público.
2. Completa contenido + categoría + tags.
3. Envía el formulario.
4. El sistema registra el testimonio → estado `pending_review`.

---

# 🟪 2. Visitante (Usuario Logueado)

## CU2 – Crear Testimonio desde Dashboard del Cliente
**Actor:** Visitante  
**Flujo:**
1. En su app (del cliente), abre sección “Testimonios”.
2. Completa y envía un testimonio.
3. Pasa a estado `pending_review`.

## CU3 – Ver mis Testimonios
**Actor:** Visitante  
**Flujo:**  
Lista todos los testimonios creados por el visitante con su estado actual.

## CU4 – Ver Feedback de Rechazo
**Actor:** Visitante  
**Flujo:**  
1. Al entrar al detalle, ve estado `rejected_with_feedback`.  
2. Muestra mensaje del Editor.

## CU5 – Editar y Reenviar Testimonio
**Actor:** Visitante  
**Flujo:**  
1. Edita el testimonio rechazado.  
2. Lo reenvía.  
3. El estado vuelve a `pending_review` con `is_resubmission = true`.

---

# 🟧 3. Editor

## CU6 – Ver Lista de Testimonios Pendientes
**Actor:** Editor  
**Flujo:**  
Muestra todos los testimonios del cliente con estado `pending_review`.

## CU7 – Aprobar Testimonio
**Actor:** Editor  
**Resultado:**  
El testimonio pasa a `published`.

## CU8 – Rechazar Testimonio con Feedback
**Actor:** Editor  
**Flujo:**
1. Abre un testimonio pendiente.
2. Selecciona “Rechazar”.
3. Agrega mensaje opcional de feedback.
4. El testimonio pasa a `rejected_with_feedback`.

## CU9 – Revisar Testimonios Reenviados
**Actor:** Editor  
**Flujo:**  
Ve testimonios reenviados marcados como “Reenvío”.

---

# 🟥 4. Admin del Cliente (Tenant)

## CU10 – Gestionar Editores
**Actor:** Admin del Cliente  
**Acción:** Crear/Eliminar usuarios con rol **Editor**.

## CU11 – Gestionar Categorías y Tags
**Actor:** Admin del Cliente  
**Acciones:** Crear/editar/eliminar categorías y tags.  
*(MVP: CRUD simple.)*

## CU12 – Configurar Branding del Widget / Landing
**Actor:** Admin del Cliente  
**Acciones:**
- Cambiar color primario
- Cambiar fuente
- Cambiar tamaño base
- Elegir layout
- Cargar logo
- Guardar

## CU13 – Registrar Dominios
**Actor:** Admin del Cliente  
**Flujo:**
1. Abre sección “Dominios”.
2. Agrega un dominio (string).
3. El dominio queda asociado al cliente.  
*(Sin verificación en MVP)*

---

# 🟥 5. Super Admin del SaaS

## CU14 – Crear Cliente
**Actor:** Super Admin  
**Flujo:**  
1. Crea una nueva cuenta de cliente.  
2. Asigna Admin del Cliente.  
3. Crea estructura inicial (categorías default, branding default).

## CU15 – Ver Lista de Clientes
**Actor:** Super Admin  
**Flujo:**  
Ve todos los clientes, su cuota, su estado y dominios.

---

# 🟩 6. Público / Lector

## CU16 – Ver Testimonios Publicados
**Actor:** Público  
**Flujo:**  
Accede a la landing/widget y visualiza testimonios aprobados filtrados por dominio.

---

# 🎛 Estados del Testimonio (MVP)

- `pending_review`
- `published`
- `rejected`
- `rejected_with_feedback`
- `resubmitted` (alias de pending_review, pero marcado)
- `draft` (solo para editores, opcional MVP)

---

# 📌 Notas MVP
- No hay pagos ni planes automáticos (solo DB).
- No hay validación DNS.
- No hay analytics avanzados.
- Branding afecta únicamente el widget/landing.
- Roles fijos: SuperAdmin / AdminCliente / Editor / Visitante / Anónimo.

