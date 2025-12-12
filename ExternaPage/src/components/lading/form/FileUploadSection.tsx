import { Input, Label } from "@/components";
import { FilePreview } from "./FilePreview";

interface FileUploadSectionProps {
  selectedFiles: File[];
  filePreviews: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  maxFiles: number;
}

export const FileUploadSection = ({
  selectedFiles,
  filePreviews,
  onFileChange,
  onRemoveFile,
  maxFiles,
}: FileUploadSectionProps) => {
  return (
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
            onChange={onFileChange}
            disabled={selectedFiles.length >= maxFiles}
            className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        {selectedFiles.length >= maxFiles && (
          <p className="text-sm text-amber-600 font-medium">
            ⚠️ Has alcanzado el límite máximo de {maxFiles} archivos
          </p>
        )}
        <p className="text-sm text-gray-500">
          Máximo {maxFiles} archivos • 5MB por archivo • Imágenes (JPG, PNG, GIF) y Videos (MP4, WebM)
        </p>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {selectedFiles.map((file, index) => (
              <FilePreview
                key={`${file.name}-${file.size}-${file.lastModified}`}
                file={file}
                previewUrl={filePreviews[index]}
                onRemove={() => onRemoveFile(index)}
              />
            ))}
          </div>
        )}

        {/* Contador de archivos */}
        {selectedFiles.length > 0 && (
          <p className="text-sm text-gray-600 font-medium">
            {selectedFiles.length} de {maxFiles} archivos seleccionados
          </p>
        )}
      </div>
    </div>
  );
};
