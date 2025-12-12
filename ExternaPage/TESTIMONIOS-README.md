# Configuración de Testimonios por Organización

## 📝 Resumen de cambios

Se ha refactorizado el componente `TestimonialCarousel` para:

### ✅ Mejoras implementadas:

1. **Filtrado por organización**: Los testimonios ahora se filtran automáticamente por el ID de tu organización
2. **Mejor contraste de colores**: Diseño más claro y profesional con mejor legibilidad
3. **Soporte para imágenes**: Las imágenes de los testimonios (`archivos_urls`) ahora se muestran en un grid responsivo
4. **Botones más visibles**: Botones de navegación con mejor contraste (borde azul, hover interactivo)
5. **Mostrar organización**: Se muestra el nombre del dominio de la organización (sin www)
6. **Estado visual mejorado**: Mejores gradientes, sombras y efectos hover

## 🔧 Configuración

### 1. Configura el ID de tu organización

Edita el archivo `.env.local` en la raíz de `ExternaPage`:

```bash
# ID de tu organización (obtén este ID desde tu base de datos)
NEXT_PUBLIC_ORGANIZATION_ID=1
```

Para obtener el ID de tu organización:
1. Ve al admin de Django: `/admin/app/organizacion/`
2. Busca tu organización
3. Copia el ID

### 2. Reinicia el servidor de desarrollo

Después de cambiar variables de entorno, reinicia el servidor:

```bash
npm run dev
```

## 📊 Flujo de datos

```
Backend (Django)
  ↓
GET /app/organizacion/{id}/testimonios-aprobados/
  ↓
useTestimonials Hook
  ↓ (filtra por estado P o A)
TestimonialCarousel Component
  ↓
Muestra solo testimonios de TU organización
```

## 🎨 Características del diseño

### Colores y contraste mejorados:
- **Fondo**: Gradiente suave gris claro → blanco → gris claro
- **Título**: Gradiente azul → morado con efecto de texto transparente
- **Estrellas**: Color ámbar con sombra suave
- **Botones**: Borde azul, fondo blanco, hover azul completo
- **Cards**: Bordes grises, sombras sutiles con efecto hover

### Imágenes:
- Grid responsivo (1, 2, o 3 columnas según cantidad)
- Máximo 4 imágenes por testimonio
- Efecto hover con zoom suave
- Aspect ratio 16:9 optimizado

### Información mostrada:
- ⭐ Rating con número
- 💬 Comentario
- 🖼️ Imágenes (si existen)
- 👤 Nombre del usuario
- 🏷️ Categoría (badge azul)
- 🏢 Dominio de la organización
- 🔗 Enlace externo (si existe)

## 🔍 Datos del backend necesarios

El serializer `TestimonioAprobadoSerializer` debe devolver:

```python
{
  "id": 1,
  "usuario_registrado": "Nombre Usuario",
  "usuario_anonimo_username": null,
  "usuario_anonimo_email": null,
  "categoria": 1,
  "categoria_nombre": "Categoría",
  "organizacion_nombre": "tudominio.com",  # ← Importante
  "comentario": "Excelente servicio...",
  "enlace": "https://...",  # ← Opcional
  "archivos_urls": ["https://...", "https://..."],  # ← Opcional
  "fecha_comentario": "2024-01-01T10:00:00Z",
  "ranking": "5.0",
  "estado": "P"
}
```

## 🚀 Uso

El componente se usa automáticamente en la landing page:

```tsx
import { TestimonialCarousel } from "@/components/lading/TestimonialCarousel";

// En tu página
<TestimonialCarousel />
```

No necesitas pasar props, todo se configura automáticamente desde `.env.local`.

## 📱 Responsividad

- **Mobile**: 1 testimonio por vista, botones ocultos (swipe)
- **Tablet**: 1 testimonio por vista, botones visibles
- **Desktop**: 1 testimonio por vista con autoplay, controles completos

## ⚙️ Personalización

Para cambiar el tiempo de autoplay, edita en `TestimonialCarousel.tsx`:

```tsx
const plugin = useRef(
  Autoplay({ delay: 5000, stopOnInteraction: true }) // ← Cambia 5000 (5 segundos)
);
```
