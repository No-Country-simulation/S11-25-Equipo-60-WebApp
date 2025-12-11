"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const ContactForm = () => {
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    toast.info("Funcionalidad de contacto próximamente");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Contacto</CardTitle>
        <CardDescription>
          Completa el formulario y te responderemos a la brevedad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleContactSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Nombre *</Label>
              <Input
                id="contact-name"
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-company">Empresa</Label>
            <Input
              id="contact-company"
              placeholder="Nombre de tu empresa (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-subject">Asunto *</Label>
            <Input
              id="contact-subject"
              placeholder="¿En qué podemos ayudarte?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Mensaje *</Label>
            <Textarea
              id="contact-message"
              placeholder="Cuéntanos más sobre tu consulta..."
              rows={6}
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            Enviar Mensaje
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
