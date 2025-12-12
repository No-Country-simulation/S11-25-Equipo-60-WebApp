"use client"

import { useEffect, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components";
import { useTestimonials } from "@/hooks";
import { TestimonialCard, fallbackTestimonials } from "../testimonial";

export const TestimonialsSection = () => {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const { testimonials, isLoading, error } = useTestimonials();

  useEffect(() => {
    console.log('Testimonios de tu organización:', testimonials);
    console.log('Total testimonios:', testimonials.length);
  }, [testimonials]);

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  if (error) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-500 font-medium">Error al cargar testimonios: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
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
            className="w-full max-w-[75%] mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {displayTestimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <div className="p-4">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Botones de navegación con mejor contraste y visibilidad */}
            <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 border-2 border-blue-600 bg-white text-blue-600 hover:text-white  hover:bg-blue-600 hover:border-white shadow-lg transition-all duration-200" />
            <CarouselNext className="hidden md:flex -right-12 h-12 w-12 border-2 border-blue-600 bg-white text-blue-600 hover:text-white hover:bg-blue-600 hover:border-white shadow-lg transition-all duration-200" />
          </Carousel>
        )}

        {/* Indicador de testimonios */}
        {!isLoading && displayTestimonials.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              {displayTestimonials.length} {displayTestimonials.length === 1 ? 'testimonio' : 'testimonios'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
