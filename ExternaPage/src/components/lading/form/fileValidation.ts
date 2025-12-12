import { toast } from "sonner";

// Constantes de validación
export const MAX_FILES = 4;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

// Funciones de validación
export const validateFileCount = (newFiles: File[], currentCount: number): boolean => {
  const totalCount = newFiles.length + currentCount;
  if (totalCount > MAX_FILES) {
    const plural = currentCount === 1 ? '' : 's';
    toast.error(`Máximo ${MAX_FILES} archivos permitidos. Ya tienes ${currentCount} archivo${plural} seleccionado${plural}.`);
    return false;
  }
  return true;
};

export const validateFileType = (file: File): boolean => {
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

export const validateFileSize = (file: File): boolean => {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`Archivo ${file.name}: excede el tamaño máximo de 5MB`);
    return false;
  }
  return true;
};

export const validateTotalSize = (newFiles: File[], existingFiles: File[]): boolean => {
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

export const generateFilePreviews = (
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
