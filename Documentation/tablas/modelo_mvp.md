
# Modelo de Datos – Testimonial CMS (SaaS) 

Este documento contiene el listado de tablas y relaciones del MVP,
---

# 🟥 1. Tabla `organizations`
Representa a cada cliente del SaaS.

```
id PK
name
created_at
updated_at
```

---

# 🟦 2. Tabla `roles`
Lista de roles disponibles en el sistema.

```
id PK
name (admin_client, editor, super_admin)
```

---

# 🟩 3. Tabla `users`
Usuarios internos del cliente (no visitantes).

```
id PK
organization_id FK
role_id FK → roles.id
email
password_hash
created_at
updated_at
```

---

# 🟪 4. Tabla `public_users`
Usuarios visitantes (provenientes de la app del cliente).

```
id PK
organization_id FK
external_id
name
email (nullable)
created_at
```

---

# 🟧 5. Tabla `testimonials`
Testimonios enviados por usuarios anónimos o visitantes.

```
id PK
organization_id FK
author_type_id FK → author_types.id
public_user_id FK (nullable)
anonymous_name (nullable)
text
image_url (nullable)
video_url (nullable)
category_id FK
status_id FK → testimonial_status.id
rejection_feedback (nullable)
is_resubmission boolean
created_at
updated_at
```

---

# 🟨 6. Tabla `testimonial_status`
Estados posibles del testimonio.

```
id PK
name (pending_review, published, rejected, rejected_with_feedback, resubmitted)
```

---

# 🟫 7. Tabla `author_types`
Define quién creó el testimonio.

```
id PK
name (anonymous, visitor)
```

---

# 🔷 8. Tabla `categories`
Categorías definidas por cada cliente.

```
id PK
organization_id FK
name
```

---

# 🔹 9. Tabla `tags`
Tags múltiples por organización.

```
id PK
organization_id FK
name
```

---

# 🔸 10. Tabla `testimonials_tags`
Relación many-to-many.

```
id PK
testimonial_id FK
tag_id FK
```

---

# 🟣 11. Tabla `domains`
Dominios registrados por cada cliente.

```
id PK
organization_id FK
domain
created_at
```

---

# 🟤 12. Tabla `branding`
Configuración visual del widget.

```
id PK
organization_id FK (unique)
primary_color
font_family
font_size
layout_id FK → layouts.id
logo_url
```

---

# 🔵 13. Tabla `layouts`
Define los layouts disponibles del widget.

```
id PK
name (list, grid, carousel)
```

---

# 🔴 14. Tabla `audit_logs`
Historial de acciones realizadas sobre testimonios.

```
id PK
user_id FK
testimonial_id FK
action_id FK → audit_actions.id
note (nullable)
created_at
```

---

# 🔻 15. Tabla `audit_actions`
Acciones registradas en el log.

```
id PK
name (approve, reject, feedback, resubmit)
```

---

# 🧩 Relaciones principales

```
organizations
 ├── users → roles
 ├── public_users
 ├── categories
 ├── tags
 │     └── testimonials_tags ← testimonials
 ├── domains
 ├── branding → layouts
 ├── testimonials → testimonial_status
 │                     └→ author_types
 │                     └→ categories
 │                     └→ testimonials_tags
 └── audit_logs → audit_actions
```

