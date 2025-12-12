import { Card, CardContent } from "@/components";
import { TestimonialRating } from "./TestimonialRating";
import { TestimonialAttachments } from "./TestimonialAttachments";
import { TestimonialAuthor } from "./TestimonialAuthor";
import type { TestimonioAprobado } from "@/interfaces";

interface TestimonialCardProps {
  testimonial: TestimonioAprobado;
}

export const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  const archivos = testimonial.archivos || testimonial.archivos_urls || [];
  const displayName = typeof testimonial.usuario_registrado === 'string'
    ? testimonial.usuario_registrado
    : testimonial.usuario_anonimo_username || "Usuario Anónimo";

  return (
    <Card className="border border-purple-300 shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-purple-200">
      <CardContent className="p-4 md:p-6">
        {/* Nombre del usuario arriba */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <p className="font-bold text-2xl text-gray-900">{displayName}</p>
          {testimonial.categoria_nombre && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {testimonial.categoria_nombre}
            </span>
          )}
        </div>

        <TestimonialRating 
          rating={testimonial.ranking || "5.0"} 
          testimonialId={testimonial.id} 
        />

        {/* Layout: comentario arriba, imágenes abajo */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Comentario */}
          <div className="w-full flex items-center justify-center px-2">
            <blockquote className="text-lg text-gray-700 text-center leading-relaxed wrap-break-word hyphens-auto overflow-wrap-anywhere w-full">
              <span className="text-blue-500 text-2xl leading-none align-top">"</span>
              {testimonial.comentario}
              <span className="text-blue-500 text-2xl leading-none align-top">"</span>
            </blockquote>
          </div>

          {/* Imágenes - En una línea abajo */}
          {archivos && archivos.length > 0 && (
            <div className="w-full flex items-center justify-center">
              <TestimonialAttachments 
                archivos={archivos} 
                testimonialId={testimonial.id} 
              />
            </div>
          )}
        </div>

        <TestimonialAuthor
          usuarioRegistrado={testimonial.usuario_registrado}
          usuarioAnonimoUsername={testimonial.usuario_anonimo_username}
          categoriaNombre={testimonial.categoria_nombre}
          organizacionNombre={testimonial.organizacion_nombre}
          enlace={testimonial.enlace}
          hideNameAndCategory={true}
        />
      </CardContent>
    </Card>
  );
};
