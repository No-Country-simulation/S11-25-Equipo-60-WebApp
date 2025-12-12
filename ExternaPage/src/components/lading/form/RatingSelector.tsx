import { Star } from "lucide-react";
import { Label } from "@/components";

interface RatingSelectorProps {
  rating: number;
  hoverRating: number;
  onRatingChange: (rating: number) => void;
  onHoverChange: (rating: number) => void;
}

export const RatingSelector = ({
  rating,
  hoverRating,
  onRatingChange,
  onHoverChange,
}: RatingSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Calificación *</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHoverChange(star)}
            onMouseLeave={() => onHoverChange(0)}
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
  );
};
