"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components";
import { useTestimonialStore } from "@/stores";
import { GET_API_KEY, GET_DEFAULT_CATEGORY_ID, GET_ORGANIZATION_ID } from "@/config";
import { useCategories } from "@/hooks";
import {
  RatingSelector,
  FileUploadSection,
  BasicInputField,
  DisabledInputField,
  TextAreaField,
  CategorySelector,
  validateFileCount,
  validateFileType,
  validateFileSize,
  validateTotalSize,
  generateFilePreviews,
  MAX_FILES,
} from "../form";

export const TestimonialForm = () => {
  const { createTestimonial, fetchTestimonials } = useTestimonialStore();
  const { categories, isLoading: loadingCategories } = useCategories();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(GET_DEFAULT_CATEGORY_ID.toString());

  const organizationName = typeof globalThis.window !== 'undefined' && typeof document !== 'undefined' ? document.title : 'Cargando...';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    if (!validateFileCount(newFiles, selectedFiles.length)) return;
    if (!newFiles.every(validateFileType)) return;
    if (!newFiles.every(validateFileSize)) return;
    if (!validateTotalSize(newFiles, selectedFiles)) return;

    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);

    generateFilePreviews(newFiles, (newPreviews) => {
      setFilePreviews(prev => [...prev, ...newPreviews]);
    });

    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleTestimonialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    setIsSubmitting(true);

    try {
      const formElement = e.currentTarget;
      const formData = new FormData();

      formData.append('organizacion', GET_ORGANIZATION_ID.toString());
      formData.append('categoria', selectedCategory);
      formData.append('usuario_anonimo_username', formElement['testimonial-name'].value);
      formData.append('usuario_anonimo_email', formElement['testimonial-email'].value);
      formData.append('comentario', formElement['testimonial-message'].value);
      formData.append('ranking', rating.toString());
      formData.append('api_key', GET_API_KEY);
      formData.append('estado', 'E');

      if (videoLink.trim()) {
        formData.append('enlace', videoLink.trim());
      }

      selectedFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      await createTestimonial(formData);

      toast.success("¡Testimonio enviado con éxito! Será revisado por nuestro equipo.");

      await fetchTestimonials();

      formElement.reset();
      setRating(0);
      setSelectedFiles([]);
      setFilePreviews([]);
      setVideoLink("");
      setSelectedCategory(GET_DEFAULT_CATEGORY_ID.toString());

    } catch (error: any) {
      console.error("Error al enviar testimonio:", error);
      toast.error(error.message || "Error inesperado al enviar el testimonio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gray-700 text-2xl font-bold text-blue-600">
      <CardHeader>
        <CardTitle>Comparte Tu Experiencia</CardTitle>
        <CardDescription>
          Tu testimonio nos ayuda a mejorar y ayudar a otros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTestimonialSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BasicInputField
              id="testimonial-name"
              name="testimonial-name"
              label="Nombre"
              placeholder="Tu nombre completo"
              required
              maxLength={50}
            />
            <BasicInputField
              id="testimonial-email"
              name="testimonial-email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <DisabledInputField
            id="organization-name"
            name="organization-name"
            label="Para *"
            value={organizationName}
            description="Tu testimonio será asociado a esta organización"
          />

          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            isLoading={loadingCategories}
          />

          <RatingSelector
            rating={rating}
            hoverRating={hoverRating}
            onRatingChange={setRating}
            onHoverChange={setHoverRating}
          />

          <TextAreaField
            id="testimonial-message"
            name="testimonial-message"
            label="Tu Testimonio"
            placeholder="Cuéntanos sobre tu experiencia con nuestra plataforma..."
            rows={6}
            required
            maxLength={500}
            description="Máximo 500 caracteres"
          />

          <BasicInputField
            id="video-link"
            name="video-link"
            label="Enlace de Video (Opcional)"
            type="url"
            placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
            maxLength={100}
          />

          <FileUploadSection
            selectedFiles={selectedFiles}
            filePreviews={filePreviews}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
            maxFiles={MAX_FILES}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Testimonio"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
