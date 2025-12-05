import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface FileUploadState {
  files: File[];
  previews: string[];
  errors: string[];
}

interface UseFileUploadReturn {
  files: File[];
  previews: string[];
  errors: string[];
  addFiles: (newFiles: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  hasFiles: boolean;
  canAddMore: boolean;
}

const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];

/**
 * Hook para manejar múltiples archivos (máximo 4)
 * Incluye validación de tipo y tamaño, y generación de previews
 * 
 * Uso:
 * ```tsx
 * const { files, previews, addFiles, removeFile } = useFileUpload();
 * 
 * // Agregar archivos
 * <input type="file" multiple onChange={(e) => addFiles(e.target.files)} />
 * 
 * // Agregar a FormData
 * files.forEach(file => formData.append('archivos', file));
 * ```
 */
export const useFileUpload = (): UseFileUploadReturn => {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    previews: [],
    errors: [],
  });

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WEBP) y videos (MP4).`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: Archivo muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        // Para videos, usar un placeholder o la URL del video
        resolve('video-placeholder');
      }
    });
  };

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    
    // Validar cantidad máxima
    if (state.files.length + filesArray.length > MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} archivos permitidos`);
      return;
    }

    const errors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of filesArray) {
      const error = validateFile(file);
      
      if (error) {
        errors.push(error);
        toast.error(error);
      } else {
        validFiles.push(file);
        try {
          const preview = await createPreview(file);
          newPreviews.push(preview);
        } catch {
          newPreviews.push('error-preview');
        }
      }
    }

    setState(prev => ({
      files: [...prev.files, ...validFiles],
      previews: [...prev.previews, ...newPreviews],
      errors: [...prev.errors, ...errors],
    }));

    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} archivo(s) agregado(s)`);
    }
  }, [state.files.length]);

  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      files: prev.files.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index),
      errors: prev.errors,
    }));
    toast.info('Archivo eliminado');
  }, []);

  const clearFiles = useCallback(() => {
    setState({
      files: [],
      previews: [],
      errors: [],
    });
  }, []);

  return {
    files: state.files,
    previews: state.previews,
    errors: state.errors,
    addFiles,
    removeFile,
    clearFiles,
    hasFiles: state.files.length > 0,
    canAddMore: state.files.length < MAX_FILES,
  };
};
