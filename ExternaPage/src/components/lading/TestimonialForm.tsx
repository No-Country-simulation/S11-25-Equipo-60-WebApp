"use client";

import { useState } from "react";
import { Star, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Textarea, Label } from "@/components";
import { CONFIG } from "@/config";
import { useTestimonialStore } from "@/stores";

// Constantes de validación
const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

// Funciones de validación
const validateFileCount = (newFiles: File[], currentCount: number): boolean => {
  const totalCount = newFiles.length + currentCount;
  if (totalCount > MAX_FILES) {
    const plural = currentCount === 1 ? '' : 's';
    toast.error(`Máximo ${MAX_FILES} archivos permitidos. Ya tienes ${currentCount} archivo${plural} seleccionado${plural}.`);
    return false;
  }
  return true;
};

const validateFileType = (file: File): boolean => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isGif = file.type === 'image/gif';
  
  const isValid = isImage || isVideo || isGif;
  
  if (!isValid) {
    toast.error(
      `Archivo "${file.name}" no es válido. Solo se permiten: imágenes (JPG, PNG, GIF, etc.) y videos (MP4, WebM, etc.)`
    );
  }
  return isValid;
};

const validateFileSize = (file: File): boolean => {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`Archivo ${file.name}: excede el tamaño máximo de 5MB`);
    return false;
  }
  return true;
};

const validateTotalSize = (newFiles: File[], existingFiles: File[]): boolean => {
  const existingSize = existingFiles.reduce((sum, file) => sum + file.size, 0);
  const newSize = newFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSize = existingSize + newSize;
  
  if (totalSize > MAX_TOTAL_SIZE) {
    const totalMB = (totalSize / (1024 * 1024)).toFixed(1);
    toast.error(`El tamaño total de los archivos (${totalMB}MB) excede los 20MB permitidos`);
    return false;
  }
  return true;
};

const generateFilePreviews = (
  files: File[],
  callback: (previews: string[]) => void
): void => {
  const previews: string[] = [];
  let loadedCount = 0;

  files.forEach((file, index) => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews[index] = reader.result as string;
        loadedCount++;
        if (loadedCount === files.length) {
          callback([...previews]);
        }
      };
      reader.readAsDataURL(file);
    }
  });
};

// Componente para preview de archivo individual
interface FilePreviewProps {
  file: File;
  previewUrl: string | undefined;
  onRemove: () => void;
}

const FilePreview = ({ file, previewUrl, onRemove }: FilePreviewProps) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  const renderPreview = () => {
    if (isImage && previewUrl) {
      return (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      );
    }

    if (isVideo && previewUrl) {
      return (
        <video
          src={previewUrl}
          className="w-full h-full object-cover"
          muted
        />
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-50">
        <Upload className="h-6 w-6 text-gray-400 mb-1" />
        <p className="text-xs text-gray-600 text-center truncate w-full px-1">
          {file.name}
        </p>
      </div>
    );
  };

  return (
    <div className="relative group bg-white rounded-lg border-2 border-gray-200 hover:border-primary transition-colors overflow-hidden aspect-square">
      {renderPreview()}
      
      {/* Overlay con info del archivo */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
        <div className="w-full p-1 bg-linear-to-t from-black/70 to-transparent">
          <p className="text-xs text-white font-medium truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-300">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
      
      {/* Botón X en esquina superior derecha */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 h-5 w-5 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg z-10 opacity-90 hover:opacity-100"
        aria-label={`Eliminar ${file.name}`}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export const TestimonialForm = () => {
  // ✅ Usar el store de Zustand
  const { createTestimonial, fetchTestimonials } = useTestimonialStore();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    
    // Validar que no se exceda el máximo considerando archivos ya seleccionados
    if (!validateFileCount(newFiles, selectedFiles.length)) return;
    if (!newFiles.every(validateFileType)) return;
    if (!newFiles.every(validateFileSize)) return;
    if (!validateTotalSize(newFiles, selectedFiles)) return;

    // Agregar nuevos archivos a los existentes
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    
    // Generar previsualizaciones solo para los nuevos archivos
    generateFilePreviews(newFiles, (newPreviews) => {
      setFilePreviews(prev => [...prev, ...newPreviews]);
    });
    
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo si es necesario
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
      
      // Agregar campos básicos
      formData.append('organizacion', CONFIG.TESTIMONIAL_ORGANIZATION_ID.toString());
      formData.append('categoria', CONFIG.TESTIMONIAL_DEFAULT_CATEGORY_ID.toString());
      formData.append('usuario_anonimo_username', formElement['testimonial-name'].value);
      formData.append('usuario_anonimo_email', formElement['testimonial-email'].value);
      formData.append('comentario', formElement['testimonial-message'].value);
      formData.append('ranking', rating.toString());
      formData.append('api_key', CONFIG.TESTIMONIAL_API_KEY);
      formData.append('estado', 'E');
      
      // Agregar enlace de video si existe
      if (videoLink.trim()) {
        formData.append('enlace', videoLink.trim());
      }
      
      // Agregar archivos
      selectedFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      // ✅ USAR EL STORE en vez de la API directa
      await createTestimonial(formData);

      toast.success("¡Testimonio enviado con éxito! Será revisado por nuestro equipo.");
      
      // ✅ Refrescar lista de testimonios públicos
      await fetchTestimonials();
      
      // Limpiar formulario
      formElement.reset();
      setRating(0);
      setSelectedFiles([]);
      setFilePreviews([]);
      setVideoLink("");
      
    } catch (error: any) {
      console.error("Error al enviar testimonio:", error);
      toast.error(error.message || "Error inesperado al enviar el testimonio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparte Tu Experiencia</CardTitle>
        <CardDescription>
          Tu testimonio nos ayuda a mejorar y ayudar a otros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTestimonialSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testimonial-name">Nombre *</Label>
              <Input
                id="testimonial-name"
                name="testimonial-name"
                placeholder="Tu nombre completo"
                required
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testimonial-email">Email *</Label>
              <Input
                id="testimonial-email"
                name="testimonial-email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial-company">Empresa / Cargo (Opcional)</Label>
            <Input
              id="testimonial-company"
              name="testimonial-company"
              placeholder="Tu empresa y cargo (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Calificación *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                Has seleccionado {rating} estrella{rating > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial-message">Tu Testimonio *</Label>
            <Textarea
              id="testimonial-message"
              name="testimonial-message"
              placeholder="Cuéntanos sobre tu experiencia con nuestra plataforma..."
              rows={6}
              required
              maxLength={500}
            />
            <p className="text-sm text-gray-500">Máximo 500 caracteres</p>
          </div>

          {/* Video Link Section */}
          <div className="space-y-2">
            <Label htmlFor="video-link">Enlace de Video (Opcional)</Label>
            <Input
              id="video-link"
              name="video-link"
              type="url"
              placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              maxLength={100}
            />
            <p className="text-sm text-gray-500">
              Puedes compartir un enlace de YouTube, Vimeo u otra plataforma
            </p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="testimonial-files">
              Archivos Adjuntos (Opcional)
            </Label>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  id="testimonial-files"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= MAX_FILES}
                  className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {selectedFiles.length >= MAX_FILES && (
                <p className="text-sm text-amber-600 font-medium">
                  ⚠️ Has alcanzado el límite máximo de {MAX_FILES} archivos
                </p>
              )}
              <p className="text-sm text-gray-500">
                Máximo 4 archivos • 5MB por archivo • Imágenes (JPG, PNG, GIF) y Videos (MP4, WebM)
              </p>
              
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {selectedFiles.map((file, index) => (
                    <FilePreview
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      file={file}
                      previewUrl={filePreviews[index]}
                      onRemove={() => removeFile(index)}
                    />
                  ))}
                </div>
              )}
              
              {/* Contador de archivos */}
              {selectedFiles.length > 0 && (
                <p className="text-sm text-gray-600 font-medium">
                  {selectedFiles.length} de 4 archivos seleccionados
                </p>
              )}
            </div>
          </div>

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
