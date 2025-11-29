# Arquitectura de Roles y Permisos - Testimonial App

## Resumen Ejecutivo

Este documento explica cómo funciona el sistema de roles y permisos en Testimonial App, adaptado al comportamiento real del backend.

---

## Roles del Sistema

### 1. **VISITANTE** (Cliente)
Usuario que crea testimonios como cliente de organizaciones.

#### Permisos:
- ✅ **Crear testimonios** para cualquier organización
- ✅ **Ver SUS propios testimonios** (GET `/app/testimonios-totales/`)
- ✅ **Editar SUS testimonios** (PATCH `/app/testimonios/{id}/`)
- ✅ **Eliminar SUS testimonios** (DELETE `/app/testimonios/{id}/`)

#### Limitaciones:
- ❌ **NO puede cambiar el estado** de testimonios (aprobar/rechazar)
- ❌ **NO puede ver testimonios de otros usuarios**
- ❌ **NO puede gestionar organizaciones**

#### Dashboard:
- `/dashboard/visitante/mis-testimonios` - Lista de testimonios propios
- `/dashboard/visitante/crear-testimonio` - Crear nuevo testimonio

---

### 2. **EDITOR** (Staff de Organización)
Usuario que gestiona testimonios de organizaciones específicas asignadas.

#### Permisos (como EDITOR):
- ✅ **Ver testimonios de SUS organizaciones** (GET `/app/testimonios-totales/`)
- ✅ **Cambiar estado** de testimonios (aprobar/rechazar) (PATCH `/app/testimonios-cambiar-estado/{id}/`)
- ✅ **Eliminar testimonios** de sus organizaciones (DELETE `/app/testimonios/{id}/`)
- ✅ **Ver organizaciones** asignadas (GET `/app/organizacion/editores/`)
- ✅ **Agregar otros editores** a sus organizaciones (POST `/app/organizacion/{id}/agregar-editores/`)

#### Permisos (como CLIENTE - Hereda de Visitante):
- ✅ **Crear testimonios personales** como cliente
- ✅ **Ver, editar y eliminar** SUS testimonios personales

#### Limitaciones:
- ❌ **NO puede crear testimonios** cuando actúa como editor (solo como cliente)
- ❌ **NO puede ver testimonios de organizaciones** que no gestiona
- ❌ **NO puede crear/eliminar organizaciones**
- ❌ **NO puede gestionar usuarios**

#### Dashboard:
**Sección Cliente (hereda de visitante):**
- `/dashboard/visitante/mis-testimonios` - Testimonios que creó como cliente
- `/dashboard/visitante/crear-testimonio` - Crear testimonios como cliente

**Sección Editor (staff):**
- `/dashboard/editor` - Dashboard con estadísticas
- `/dashboard/editor/testimonios` - Gestionar testimonios de organizaciones
- `/dashboard/editor/organizaciones` - Ver organizaciones asignadas
- `/dashboard/editor/estadisticas` - Estadísticas de organizaciones

---

### 3. **ADMIN** (Administrador)
Usuario con control total del sistema.

#### Permisos:
- ✅ **Crear, editar, eliminar** usuarios (visitantes, editores, admins)
- ✅ **Crear, editar, eliminar** organizaciones (GET/POST/PATCH/DELETE `/app/organizacion/`)
- ✅ **Crear, editar, eliminar** categorías
- ✅ **Ver TODOS los testimonios públicos** (GET `/app/testimonios/`)
- ✅ **Ver TODAS las organizaciones** del sistema

#### Limitaciones:
- ❌ **NO puede usar** `/app/testimonios-totales/` (endpoint de visitantes/editores)
- ❌ **NO puede cambiar estado** de testimonios de organizaciones que no gestiona
- ❌ **Admin solo supervisa**, no gestiona testimonios directamente

#### Dashboard:
**Sección Cliente (hereda de visitante):**
- `/dashboard/visitante/mis-testimonios` - Si tiene testimonios personales
- `/dashboard/visitante/crear-testimonio` - Crear testimonios como cliente

**Sección Editor (hereda de editor):**
- `/dashboard/editor/*` - Si está asignado como editor a alguna organización

**Sección Admin (exclusiva):**
- `/dashboard/admin` - Dashboard con métricas del sistema
- `/dashboard/admin/usuarios` - Gestión de usuarios
- `/dashboard/admin/testimonios` - Ver testimonios públicos aprobados
- `/dashboard/admin/organizaciones` - Gestión de organizaciones
- `/dashboard/admin/categorias` - Gestión de categorías

---

## Endpoints Críticos del Backend

### `/app/testimonios-totales/` ⚠️ **ENDPOINT DUAL**

Este endpoint tiene **DOBLE FUNCIONALIDAD** según el rol detectado en el JWT:

```typescript
// VISITANTE logueado:
GET /app/testimonios-totales/
→ Devuelve testimonios que EL USUARIO CREÓ

// EDITOR logueado:
GET /app/testimonios-totales/
→ Devuelve testimonios de SUS ORGANIZACIONES

// ADMIN logueado:
GET /app/testimonios-totales/
→ ⚠️ NO USAR - Comportamiento indefinido
```

**Solución implementada:**
- Visitantes y Editores: Usan `testimonialService.getMyTestimonials()`
- Admin: Usa `testimonialService.getPublicTestimonials()` (GET `/app/testimonios/`)

---

### Otros Endpoints Importantes

#### `/app/testimonios/` (Público)
- **Acceso**: Público (no requiere autenticación)
- **Devuelve**: TODOS los testimonios APROBADOS de TODAS las organizaciones
- **Uso**: Landing page, Admin

#### `/app/organizacion/` (Admin)
- **Acceso**: Solo administradores
- **Devuelve**: TODAS las organizaciones del sistema
- **Uso**: Panel de administración

#### `/app/organizacion/editores/` (Editor)
- **Acceso**: Solo editores
- **Devuelve**: Organizaciones a las que pertenece el editor
- **Uso**: Dashboard de editor

---

## Separación de Secciones en el Frontend

### Principio de Diseño
**Cada rol tiene sus propias secciones claramente separadas, pero con privilegios acumulativos.**

```
┌─────────────────────────────────────────────────────┐
│ VISITANTE (Cliente)                                 │
│ - Crear testimonios como cliente                   │
│ - Ver/editar/eliminar SUS testimonios               │
└─────────────────────────────────────────────────────┘
                      ↓ ASCIENDE
┌─────────────────────────────────────────────────────┐
│ EDITOR (Staff)                                      │
│ ✅ CONSERVA: Acceso completo de visitante           │
│ ➕ NUEVO: Gestión de testimonios de organizaciones │
│ ➕ NUEVO: Ver estadísticas de organizaciones        │
└─────────────────────────────────────────────────────┘
                      ↓ ASCIENDE
┌─────────────────────────────────────────────────────┐
│ ADMIN (Administrador)                               │
│ ✅ CONSERVA: Acceso completo de visitante           │
│ ✅ CONSERVA: Acceso completo de editor (si aplica)  │
│ ➕ NUEVO: Gestión de usuarios del sistema           │
│ ➕ NUEVO: Gestión de organizaciones                 │
│ ➕ NUEVO: Gestión de categorías                     │
│ ➕ NUEVO: Vista de testimonios públicos             │
└─────────────────────────────────────────────────────┘
```

---

## Navegación del Sidebar

### Visitante ve:
```
Dashboard
─────────────────────
Mis Testimonios       👤 Como cliente
Crear Testimonio      👤 Como cliente
```

### Editor ve:
```
Dashboard
─────────────────────
Mis Testimonios       👤 Como cliente
Crear Testimonio      👤 Como cliente
─────────────────────
Gestionar Testimonios 💼 Como staff
Mis Organizaciones    💼 Como staff
Estadísticas          💼 Como staff
```

### Admin ve:
```
Dashboard
─────────────────────
Mis Testimonios       👤 Como cliente
Crear Testimonio      👤 Como cliente
─────────────────────
Gestionar Testimonios 💼 Como staff
Mis Organizaciones    💼 Como staff
Estadísticas          💼 Como staff
─────────────────────
Usuarios              👑 Como admin
Testimonios Públicos  👑 Como admin
Organizaciones        👑 Como admin
Categorías            👑 Como admin
```

---

## Casos de Uso Comunes

### Caso 1: José es Visitante
1. José crea cuenta
2. José crea testimonio para "Microsoft"
3. José ve su testimonio en "Mis Testimonios"
4. José puede editar/eliminar su testimonio
5. Microsoft (editor) aprueba el testimonio
6. El testimonio aparece público en `/app/testimonios/`

### Caso 2: José asciende a Editor de Microsoft
1. Admin asigna a José como editor de "Microsoft"
2. José ahora ve DOS secciones:
   - **Cliente**: Su testimonio personal que creó antes
   - **Staff**: Testimonios de Microsoft (todos, de todos los clientes)
3. José puede aprobar/rechazar testimonios de Microsoft
4. José **NO puede crear** testimonios desde la sección editor
5. José **SÍ puede crear** testimonios desde la sección cliente

### Caso 3: José asciende a Admin
1. Admin promueve a José a administrador
2. José ahora ve TRES secciones:
   - **Cliente**: Su testimonio personal
   - **Staff**: Organizaciones que gestiona (si alguna)
   - **Admin**: Vista de TODO el sistema
3. José puede crear usuarios, organizaciones, categorías
4. José puede ver todos los testimonios públicos en "Testimonios Públicos"
5. José NO gestiona testimonios pendientes (eso es trabajo de editores)

---

## Restricciones Importantes

### ⚠️ Editores NO pueden crear testimonios (desde sección editor)
**Motivo**: Un editor representa a la organización, no es un cliente.
**Solución**: Editor puede crear testimonios como cliente en la sección visitante.

### ⚠️ Admin NO usa `/app/testimonios-totales/`
**Motivo**: Ese endpoint es dual (visitante/editor) y puede causar confusión.
**Solución**: Admin usa `/app/testimonios/` para ver testimonios públicos.

### ⚠️ Las secciones están SEPARADAS pero ACUMULATIVAS
**Motivo**: Un editor es un visitante con permisos extras, no un rol diferente.
**Solución**: Editor ve ambas secciones claramente separadas en el sidebar.

---

## Resumen de Endpoints por Rol

| Endpoint | Visitante | Editor | Admin |
|----------|-----------|--------|-------|
| `POST /app/testimonios/` | ✅ Crear | ✅ Crear (como cliente) | ✅ Crear (como cliente) |
| `GET /app/testimonios-totales/` | ✅ Ver suyos | ✅ Ver de orgs | ❌ NO USAR |
| `GET /app/testimonios/` | ✅ Público | ✅ Público | ✅ Supervisión |
| `PATCH /app/testimonios-cambiar-estado/{id}/` | ❌ | ✅ De sus orgs | ❌ |
| `GET /app/organizacion/editores/` | ❌ | ✅ Ver suyas | ❌ |
| `GET /app/organizacion/` | ❌ | ❌ | ✅ Ver todas |
| `POST /app/visitantes/` | ✅ Registro | ❌ | ✅ Crear |
| `POST /app/administradores/` | ❌ | ❌ | ✅ Crear |

---

## Preguntas Frecuentes

### P: ¿Por qué el editor no puede crear testimonios?
**R:** Un editor es una cuenta de staff de la organización. No es un cliente, por lo tanto no crea testimonios "para la organización". Sin embargo, el editor **SÍ puede** crear testimonios como cliente en la sección visitante.

### P: ¿Cómo un editor ve sus testimonios personales Y los de su organización?
**R:** El sistema separa claramente:
- `/dashboard/visitante/mis-testimonios` → Testimonios que creó como cliente
- `/dashboard/editor/testimonios` → Testimonios de organizaciones que gestiona

### P: ¿El admin puede aprobar/rechazar testimonios?
**R:** Admin puede ver testimonios públicos, pero NO gestiona estados. Esa es responsabilidad de los editores de cada organización.

### P: ¿Qué pasa si un usuario tiene múltiples roles?
**R:** Los roles son excluyentes en el backend (un usuario es visitante O editor O admin). Pero los permisos son acumulativos: editor conserva funcionalidad de visitante, admin conserva funcionalidad de editor.

---

## Mantenimiento Futuro

### Si el backend agrega endpoints separados:
- `GET /app/mis-testimonios-personales/` → Reemplazar getMyTestimonials para visitantes
- `GET /app/mis-organizaciones-testimonios/` → Reemplazar getMyTestimonials para editores

### Si se necesita admin con gestión de testimonios:
- Solicitar nuevo endpoint: `GET /app/testimonios/todas-las-organizaciones/`
- Solicitar permiso: `PATCH /app/testimonios-cambiar-estado/{id}/` para admins

---

**Última actualización**: 24 de noviembre de 2025
**Autor**: Equipo Frontend
**Revisión**: v1.0 - Arquitectura base adaptada al backend real
