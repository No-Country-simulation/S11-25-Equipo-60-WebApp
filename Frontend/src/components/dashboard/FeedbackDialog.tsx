"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, MessageSquare } from "lucide-react"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  testimonialId: number
  testimonialTitle?: string
  testimonialImages?: string[] // URLs de las imágenes del testimonio
  onSubmit: (feedback: string) => Promise<void>
}

/**
 * Dialog para agregar feedback a testimonios en estado ESPERA
 * 
 * Automáticamente cambia el estado del testimonio a RECHAZADO al enviar el feedback.
 * 
 * @param open - Control de visibilidad del dialog
 * @param onOpenChange - Callback para cambiar la visibilidad
 * @param testimonialId - ID del testimonio a rechazar con feedback
 * @param testimonialTitle - Título/descripción del testimonio (opcional)
 * @param testimonialImages - URLs de imágenes adjuntas al testimonio (opcional)
 * @param onSubmit - Función async que envía el feedback al backend
 */
export function FeedbackDialog({
  open,
  onOpenChange,
  testimonialId,
  testimonialTitle,
  testimonialImages,
  onSubmit,
}: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación
    if (!feedback.trim()) {
      setError("El feedback no puede estar vacío")
      return
    }

    if (feedback.length > 512) {
      setError("El feedback no puede exceder los 512 caracteres")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await onSubmit(feedback.trim())
      
      // Limpiar y cerrar
      setFeedback("")
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message || "Error al enviar feedback")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFeedback("")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Agregar Feedback
          </DialogTitle>
          <DialogDescription>
            Proporciona retroalimentación al autor del testimonio. El testimonio
            será marcado automáticamente como <strong>RECHAZADO</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {testimonialTitle && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Testimonio
                </Label>
                <p className="text-sm">{testimonialTitle}</p>
              </div>
            )}

            {/* Preview de imágenes */}
            {testimonialImages && testimonialImages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Archivos adjuntos ({testimonialImages.length})
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {testimonialImages.map((url, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden bg-muted/30">
                      {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={url}
                          alt={`Archivo ${index + 1}`}
                          className="w-full h-24 object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-24 text-xs text-primary hover:underline p-2 text-center"
                        >
                          📎 Archivo {index + 1}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback">
                Retroalimentación <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="feedback"
                placeholder="Explica las razones del rechazo y sugerencias de mejora..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                maxLength={512}
                className="resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground text-right">
                {feedback.length}/512 caracteres
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-900">
              <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Importante:</strong> Al enviar este feedback, el
                  testimonio cambiará automáticamente a estado RECHAZADO. El
                  visitante podrá ver tu retroalimentación y mejorar su
                  testimonio.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !feedback.trim()}>
              {isLoading ? "Enviando..." : "Rechazar y Enviar Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
