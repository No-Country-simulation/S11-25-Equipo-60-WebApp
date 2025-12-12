import { Upload, X } from "lucide-react";
import { Button } from "@/components";

interface FilePreviewProps {
  file: File;
  previewUrl: string | undefined;
  onRemove: () => void;
}

export const FilePreview = ({ file, previewUrl, onRemove }: FilePreviewProps) => {
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
