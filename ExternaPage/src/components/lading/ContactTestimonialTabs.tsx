"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { TestimonialForm } from "./TestimonialForm";

export const ContactTestimonialTabs = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Contáctanos o Comparte Tu Experiencia
          </h2>
          <p className="text-xl text-gray-600">
            Estamos aquí para ayudarte o escuchar tu historia
          </p>
        </div>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-auto">
            <TabsTrigger value="contact" className="text-lg py-4 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Mail className="mr-2 h-5 w-5" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="testimonial" className="text-lg py-4 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="mr-2 h-5 w-5" />
              Enviar Testimonio
            </TabsTrigger>
          </TabsList>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <ContactForm />
          </TabsContent>

          {/* Testimonial Tab */}
          <TabsContent value="testimonial">
            <TestimonialForm />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
