import React from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false,
  onChange 
}: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={index}
            type={interactive ? "button" : "button"}
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            className={clsx(
              "focus:outline-none transition-colors",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default",
              isFilled ? "text-yellow-400" : "text-gray-300"
            )}
          >
            <Star 
              className={clsx(sizes[size], isFilled && "fill-current")} 
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;

