# Detailed summary with citation

# Resumen Detallado de la Reunión

## 1. Introducción y Bienvenida
- Se dio la bienvenida a los participantes y se verificó el audio y la comunicación antes de empezar. [00:00]

## 2. Estado del Proyecto y Repositorios
- Se mencionó que se subió la rama de login para revisión y que hay proyectos nuevos en desarrollo con tecnologías como Java. [03:30]
- Se dio acceso al repositorio del proyecto a Luis y se resolvieron dudas sobre estructura de carpetas backend/frontend y manejo de archivos como `.env`. [20:00]
- Se acordó que cada persona trabajaría sobre carpetas independientes para evitar conflictos al hacer git push. [28:00]
- Se está usando una librería de iconos integrada con Tailwind y React. [01:55:00]

## 3. Roles y Usuarios en la Aplicación
- Explicación sobre los roles: administrador, editor y visitante/escritor, con responsabilidades y permisos diferenciados. [49:30]
- Discusión sobre la creación automática de usuarios visitantes y cómo se asignan roles durante el registro. [53:00]
- Aclaración de que los usuarios visitantes deben tener un control de acceso estricto, sin poder acceder a las funcionalidades de editor o administrador. [01:00:00]
- Necesidad de manejar roles con tablas claras para evitar conflictos y controlar accesos desde el backend. [01:02:00]
- La organización puede tener varios editores y administradores con permisos diferenciados por dominio. [01:10:00]

## 4. Login, Registro y Manejo de Tokens
- Se está mejorando el login para que devuelva nombre y rol junto con el token, facilitando el manejo del estado global en el frontend. [13:30]
- Confirmación de que los tokens incluyen token de acceso y refresh token, con lógica para renovación automática. [15:30]
- Se sugirió crear una tabla simple que muestre datos del usuario para verificar la conexión con backend. [17:00]
- Discusión sobre los métodos de autenticación y la seguridad involucrada, incluyendo la gestión de tokens JWT. [01:05:30]

## 5. Distribución del Trabajo y Gestión del Equipo
- Se propuso que Jesús sea líder del backend y otros integrantes coordinadores de frontend para repartir tareas. [44:30]
- Se acordó formar dos parejas para trabajar en landing page y login, considerando niveles de experiencia. [01:30:00]
- Se estableció horario de reuniones a las 10:30 pm hora Argentina, considerando zonas horarias distintas de los miembros. [01:40:00]
- Se aclaró la importancia de enviar reportes diarios de presencia para mantener un ranking de integraciones y compromiso. [02:23:00]

## 6. Estado Actual y Avances Técnicos
- Hay una landing page y login parcialmente funcionales con interfaces básicas, pendientes mejoras en los dashboards y manejo de roles. [08:30]
- Se definió el flujo de testimonios entre escritor y editor, usando un campo de "feedback" para comunicación entre ambos sin chat directo. [45:30]
- La aplicación está dividida en varias tablas: usuarios administrativos, editores y visitantes, manejando estos roles en el backend de manera clara. [01:55:00]
- Se trabaja en limitar la cantidad de peticiones por usuario (rate limiting) para asegurar la estabilidad del backend. [02:15:00]

## 7. Seguridad y Validación de Datos
- Para usuarios anónimos se implementará un sistema de validación con API key (piquín), que será enviada en la cabecera de las peticiones para autenticar. [01:52:00]
- Validación de dominios permitidos para evitar que datos se ingresen desde sitios no autorizados. [01:54:00]
- Mencionaron la importancia de cifrado de tokens para mayor seguridad. [01:55:30]

## 8. Diseño y Usabilidad
- Se sugirió que cada equipo utilice el mismo esquema de diseño y colores para mantener coherencia, con un estilo minimalista. [01:30:00]
- Se propuso usar componentes como spinners y skeletons para mejorar la experiencia de carga en la interfaz. [02:05:30]
- Se discutió si implementar cambio de idioma y tema, y se acordó dejarlo para una futura mejora. [02:01:00]

## 9. Organización de Bases de Datos y Tablas
- Se revisaron tablas clave como categorías, estados y organizaciones con sus campos: nombre, color, icono, descripción; y la importancia de que el administrador pueda gestionar estas tablas por medio del backend. [01:50:00]
- Se acordó que los estados de los testimonios serán variados (pendiente, aprobado, publicado, archivado, rechazado) y gestionados desde una tabla específica para flexibilidad. [01:53:30]
- Se definió que los usuarios deben ser filtrados según rol para que solo tengan acceso a la información que les corresponde. [01:57:30]

## 10. Próximos Pasos y Planificación
- El objetivo es tener la landing completa y dashboards funcionales (aunque sin todas las funciones) para el jueves. [02:06:30]
- Se acordó que Jesús terminará de ajustar tablas y seguridad en backend, mientras el equipo frontend continúa con maquetado y funcionalidad del login y landing. [02:20:00]
- Se señaló la necesidad de coordinar reuniones para clarificar puntos técnicos y evitar alargar las sesiones. [02:21:00]

## 11. Comentarios Finales
- Se valora el trabajo en equipo y comunicación, con la recomendación de mantener una actitud colaborativa y respetuosa durante el proyecto. [02:07:00]
- Se mencionó que el PM (David) no participará activamente en la codificación para centrarse en gestión, y se apoya a los desarrolladores en dudas técnicas. [02:05:00]
- Se recomendó el uso de Chrome para las reuniones y coordinación para acceder al repositorio y roles. [01:40:00]

---

Este resumen refleja los puntos clave tratados en la reunión basados en el tiempo registrado para cada mención, facilitando su revisión y seguimiento para el equipo.