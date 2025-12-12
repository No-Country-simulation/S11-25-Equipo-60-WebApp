import { Star } from "lucide-react";

interface TestimonialRatingProps {
  rating: string;
  testimonialId: number;
}

export const TestimonialRating = ({ rating, testimonialId }: TestimonialRatingProps) => {
  const ratingValue = Math.round(Number.parseFloat(rating || "5"));

  return (
    <div className="flex justify-center items-center gap-1 mb-4">
      {Array.from({ length: ratingValue }).map((_, i) => (
        <Star
          key={`star-${testimonialId}-${i}`}
          className="h-5 w-5 fill-amber-400 text-amber-400 drop-shadow-sm"
        />
      ))}
      <span className="ml-2 text-base font-semibold text-gray-700">
        {rating || "5.0"}
      </span>
    </div>
  );
};
