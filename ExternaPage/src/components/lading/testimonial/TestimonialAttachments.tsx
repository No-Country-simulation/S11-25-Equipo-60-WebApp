interface TestimonialAttachmentsProps {
  archivos: string[];
  testimonialId: number;
}

export const TestimonialAttachments = ({ archivos, testimonialId }: TestimonialAttachmentsProps) => {
  if (!archivos || archivos.length === 0) return null;

  return (
    <div className="flex flex-row gap-2 w-full max-w-[600px] mx-auto justify-center">
      {archivos.map((fileUrl: string, index: number) => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(fileUrl);

        return (
          <div
            key={`file-${testimonialId}-${index}`}
            className="relative w-[100px] h-[100px] shrink-0 rounded-md overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-105 border border-gray-200 bg-gray-100"
          >
            {isVideo ? (
              <>
                <video
                  src={fileUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </>
            ) : (
              <img
                src={fileUrl}
                alt={`Imagen ${index + 1} del testimonio`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
