# Resumen detallado de la reunión

**Fecha de la reunión:** No especificada  
**Participantes:** Alejandro Navarro, Jesus Medina, José Ortega, Luis Nina, Vladimir Villacrés, david coach dev (dc dev)

---

## 1. **Bienvenida e inicio**

- David dio la bienvenida a todos los participantes y se acordó grabar la reunión para tener una referencia.
- Luis se unió como nuevo miembro, presentándose y comentando que tiene experiencia en React y algunos conocimientos de backend con Express, aunque está en proceso de aprendizaje. Se le propuso iniciar con tareas de frontend para ganar más experiencia.

## 2. **Estado de los proyectos actuales**

- Se comentó que se ha subido una rama para el login a revisar.
- David informó que él está enfocado en un nuevo proyecto con Java, pero sigue supervisando el desarrollo del sistema.
- Se aclaró que existen dos principales líneas de trabajo: la landing page y el componente de login.
- Se acordó que el login debe estar funcional y que los roles deben implementarse correctamente (administrador, editor, visitante/escritor).

## 3. **Organización del equipo y distribución de tareas**

- Luis y Vladimir fueron integrados y se les están asignando tareas acorde a su nivel de conocimiento.
- José y Vladimir trabajarán en la landing page.
- Alejandro seguirá con el login y el manejo del estado global (Se utilizó la biblioteca "sustan" para manejo de estados).
- Se propuso formar dos equipos para que los integrantes más experimentados puedan apoyar a los nuevos.
- Se mencionó la necesidad de designar líderes para frontend y backend; se nombró a Jesús como líder de backend.

## 4. **Discusión sobre el backend y roles de usuarios**

- Jesús explicó la estructura del backend basado en Django, manejo de tokens de acceso y refresh, y roles: administrador, editor y visitante.
- Se aclaró que el administrador tiene control completo, el editor puede moderar contenido y el visitante/escritor puede enviar testimonios pero sin permisos administrativos.
- Se estableció que los usuarios se registran como visitantes inicialmente y sólo el administrador puede elevar roles a editor o administrador del dominio.
- Se discutió sobre la seguridad de las rutas y endpoints, siendo necesarias autenticación y permisos adecuados para evitar accesos indebidos.

## 5. **Estado y funcionalidades del Login**

- Se observó que el login está maquetado y parcialmente funcional, pero faltan ajustes importantes:
  - Los botones para seleccionar el rol (administrador, editor, visitante) no funcionan correctamente.
  - Se debe asegurar que la sesión guarde correctamente el token y muestre información básica del usuario (nombre y rol).
  - Se pidió implementar una página sencilla tras el login que muestre datos del usuario en una tabla para verificar conexión con backend.
- Alejandro levantó dudas sobre la integración y manejo del estado global, que debe ser resuelto pronto.
- Se propuso que Luis ayude en la creación de componentes de React para facilitar el avance frontend.

## 6. **Diseño y UI**

- Se discutió sobre la necesidad de un diseño uniforme y consistente para la aplicación:
  - Se apoyará un diseño minimalista y sencillo, con colores y tipografías definidas.
  - Vladimir mostró avances basados en un diseño ya definido.
  - Se decidirá si implementar cambio de tema e idiomas, aunque inicialmente no es prioritario.
  - La librería de componentes principal es Material UI, con buena integración en Next.js.

## 7. **Gestión de usuarios y roles**

- Se discutió cómo manejar los roles y las organizaciones:
  - Un usuario puede pertenecer a varias organizaciones.
  - El administrador global gestiona la aplicación completa y los administradores de dominio gestionan usuarios de su organización.
  - El editor puede agregar otros usuarios a su organización si tiene permisos adecuados.
- Se aclaró que los visitantes sólo pueden ver y gestionar su contenido propio sin acceder a datos de otros usuarios o a funciones administrativas.
- Los usuarios anónimos pueden enviar testimonios mediante un formulario seguro que valida dominio y clave (piquín) para evitar accesos no autorizados.

## 8. **Base de datos y modelos**

- Jesús mostró los modelos básicos en Django, incluyendo tablas para categorías, estados, organizaciones y usuarios.
- Se propuso tener un control de estados para los testimonios (Pendiente, Aprobado, Rechazado, Publicado, Archivado) con iconos y colores para facilitar su visualización.
- Se aclaró que las categorías son creadas sólo por administradores para evitar duplicidades.
- Se reforzó la validación de dominios permitidos y "piquín" para controlar el acceso externo a la API.
- Se habló del uso de limits (limites de peticiones por hora) para proteger la API.

## 9. **Integración y desarrollo**

- Se mencionó la necesidad de administrar la subida de archivos multimedia (imágenes, video) con un flujo para validar la subida correcta antes de guardar el testimonio.
- Se acordó que José seguirá trabajando en la landing y se pondrá de acuerdo con Alejandro y Vladimir para coordinar.
- Jesús se encargará de funcionalidades del backend, incluyendo endpoints para autologin, gestión de usuarios y roles.
- David actuará principalmente como PM supervisando las integraciones y asegurando coherencia del proyecto.
- Se definió un cronograma para tener la landing y los dashboards funcionales para el jueves próximo, con funcionalidades básicas activas.

## 10. **Comunicación y logística**

- Se estableció nuevo horario para las reuniones: diarias tipo daily a las 10:30 pm (hora Argentina), con sprints lunes y jueves.
- Se discutió la dificultad para algunos miembros por diferencias horarias y se acordó buscar un horario que acomode a todos.
- Se enfatizó la importancia de que los integrantes entren diariamente al chat y reporten avances para mantener un ranking de actividad.
- David mencionó la necesidad de actualizar la documentación, control de repositorios y que todos añadan información personal (LinkedIn, GitHub).

## 11. **Conclusiones y próximos pasos**

- Se establecieron entregables mínimos para el jueves: landing completa y dashboards funcionales con carga de datos segmentados por usuario y rol.
- Se continuará con coordinación de frontend y backend por equipos.
- Jesús aclarará dudas y finalizará detalles del backend.
- Se programarán reuniones adicionales para revisar tablas, endpoints y demás detalles técnicos.
- Se validará el manejo adecuado de roles y seguridad en la aplicación.
- Se continuará con mejoras en el login, gestión de sesiones y carga de datos.
- David recordó que esta es una contribución voluntaria y que se debe fomentar el compañerismo y trabajo en equipo.

---

**Fin del resumen**