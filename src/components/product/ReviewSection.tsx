import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductReviews, submitReview } from '../../lib/api';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckCircle } from 'lucide-react';
import { Review } from '../../types';

interface ReviewSectionProps {
  productId: string | number;
}

export const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: resData, isLoading, refetch } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getProductReviews(productId),
  });

  const reviewList: Review[] = resData?.reviews || (Array.isArray(resData) ? resData : []);
  const avgRating = resData?.summary?.average_rating || 
    (reviewList.length ? reviewList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewList.length : 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await submitReview({
        product_id: Number(productId),
        customer_name: name,
        rating,
        title,
        body: comment,
      });
      setIsWriting(false);
      setTitle('');
      setComment('');
      refetch();
      alert('Thank you! Your review has been submitted for verification.');
    } catch {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl my-4" />;

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-[var(--deep-navy)] mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <span className="text-4xl font-bold">{avgRating.toFixed(1)}</span>
            <div>
              <StarRating rating={avgRating} />
              <p className="text-sm text-gray-500 mt-1">{reviewList.length} verified ratings</p>
            </div>
          </div>
        </div>

        <div className="ml-auto w-full md:w-auto">
          <Button onClick={() => setIsWriting(!isWriting)} variant="outline">
            {isWriting ? 'Cancel' : 'Write a Review'}
          </Button>
        </div>
      </div>

      {isWriting && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl mb-8 space-y-4 max-w-xl">
          <h3 className="font-bold text-lg text-[var(--deep-navy)]">Share Your Experience</h3>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Your Rating</label>
            <StarRating rating={rating} interactive onChange={(val) => setRating(val)} />
          </div>
          <Input
            label="Your Name *"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            required
          />
          <Input
            label="Review Headline"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="e.g. Kids love this toy!"
          />
          <Input
            label="Your Detailed Review"
            multiline
            rows={3}
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            placeholder="Tell other parents about durability, fun factor, safety..."
          />
          <Button type="submit" loading={submitting}>
            Submit Review
          </Button>
        </form>
      )}

      {reviewList.length === 0 ? (
        <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviewList.map((review: any) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900">{review.customer_name || review.userName}</span>
                <span className="text-xs text-gray-400">
                  {review.created_at ? new Date(review.created_at).toLocaleDateString('en-IN') : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} size="sm" />
                {review.title && <span className="font-medium text-sm text-gray-800">{review.title}</span>}
              </div>
              <p className="text-gray-600 text-sm">{review.body || review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
