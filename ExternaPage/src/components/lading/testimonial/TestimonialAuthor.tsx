import { Building2, ExternalLink } from "lucide-react";

interface TestimonialAuthorProps {
  usuarioRegistrado?: string;
  usuarioAnonimoUsername?: string;
  categoriaNombre?: string;
  organizacionNombre?: string;
  enlace?: string;
  hideNameAndCategory?: boolean;
}

const cleanDomain = (domain: string | undefined): string => {
  if (!domain) return "";
  return domain
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/$/, "")
    .toLowerCase();
};

export const TestimonialAuthor = ({
  usuarioRegistrado,
  usuarioAnonimoUsername,
  categoriaNombre,
  organizacionNombre,
  enlace,
  hideNameAndCategory = false,
}: TestimonialAuthorProps) => {
  const displayName = typeof usuarioRegistrado === 'string'
    ? usuarioRegistrado
    : usuarioAnonimoUsername || "Usuario Anónimo";
  
  const displayDomain = cleanDomain(organizacionNombre);

  return (
    <div className="text-center border-t border-gray-100 pt-6">
      <div className="flex flex-col items-center gap-2">
        {!hideNameAndCategory && (
          <>
            <p className="font-bold text-lg text-gray-900">{displayName}</p>

            {categoriaNombre && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {categoriaNombre}
              </span>
            )}
          </>
        )}

        {displayDomain && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{displayDomain}</span>
          </div>
        )}

        {enlace && (
          <a
            href={enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors mt-2"
          >
            Ver más
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};
