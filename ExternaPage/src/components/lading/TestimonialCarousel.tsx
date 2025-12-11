"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Star, Loader2 } from "lucide-react";
import { useTestimonials } from "@/hooks";
import { useEffect, useRef } from "react";

export const TestimonialCarousel = () => {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const { testimonials, isLoading, error } = useTestimonials();

  // Debug: ver qué testimonios tenemos
  useEffect(() => {
    console.log('Testimonios recibidos:', testimonials);
    console.log('Total testimonios:', testimonials.length);
  }, [testimonials]);

  // Filtrar testimonios publicados ('P') o aprobados ('A')
  const publicTestimonials = testimonials.filter(t => t.estado === 'P' || t.estado === 'A');

  // Datos de respaldo si no hay testimonios del backend
  const fallbackTestimonials = [
    {
      id: 1,
      usuario_registrado: "María González",
      usuario_anonimo_username: undefined,
      comentario: "Esta plataforma transformó completamente la manera en que recolectamos feedback de nuestros clientes. Ahora tenemos un proceso automatizado y profesional.",
      ranking: "5.0",
      categoria_nombre: "Empresas"
    },
    {
      id: 2,
      usuario_registrado: "Carlos Ruiz",
      usuario_anonimo_username: undefined,
      comentario: "Los testimonios reales han aumentado nuestra tasa de conversión en un 40%. Es una herramienta indispensable para cualquier negocio serio.",
      ranking: "5.0",
      categoria_nombre: "Marketing"
    },
    {
      id: 3,
      usuario_registrado: "Ana Martínez",
      usuario_anonimo_username: undefined,
      comentario: "Implementación súper sencilla y resultados inmediatos. Nuestros clientes ahora pueden dejar testimonios en minutos y nosotros podemos gestionarlos fácilmente.",
      ranking: "5.0",
      categoria_nombre: "Startups"
    },
    {
      id: 4,
      usuario_registrado: "Roberto Silva",
      usuario_anonimo_username: undefined,
      comentario: "La mejor inversión que hemos hecho este año. La credibilidad que nos dan los testimonios verificados es invaluable.",
      ranking: "5.0",
      categoria_nombre: "E-commerce"
    },
    {
      id: 5,
      usuario_registrado: "Laura Fernández",
      usuario_anonimo_username: undefined,
      comentario: "Interface intuitiva y funcionalidades potentes. Exactamente lo que necesitábamos para fortalecer nuestra presencia online.",
      ranking: "5.0",
      categoria_nombre: "SaaS"
    },
  ];

  const displayTestimonials = publicTestimonials.length > 0 
    ? publicTestimonials 
    : fallbackTestimonials;

  if (error) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-600">Error al cargar testimonios: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isLoading ? "Cargando testimonios..." : "Miles de empresas confían en nosotros para gestionar sus testimonios"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-5xl mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {displayTestimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <div className="p-4">
                    <Card className="border-2 shadow-xl">
                      <CardContent className="p-8 md:p-12">
                        {/* Rating Stars */}
                        <div className="flex justify-center mb-6">
                          {Array.from({ length: Math.round(Number.parseFloat(testimonial.ranking || "5")) }).map((_, i) => (
                            <Star
                              key={`star-${testimonial.id}-${i}`}
                              className="h-6 w-6 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>

                        {/* Testimonial Content */}
                        <blockquote className="text-xl md:text-2xl text-gray-700 text-center mb-8 italic">
                          "{testimonial.comentario}"
                        </blockquote>

                        {/* Author Info */}
                        <div className="text-center">
                          <p className="font-bold text-lg text-gray-900">
                            {typeof testimonial.usuario_registrado === 'string' 
                              ? testimonial.usuario_registrado 
                              : testimonial.usuario_anonimo_username || "Usuario Anónimo"}
                          </p>
                          {testimonial.categoria_nombre && (
                            <p className="text-gray-600">
                              {testimonial.categoria_nombre}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        )}
      </div>
    </section>
  );
};
