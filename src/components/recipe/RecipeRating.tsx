import React, { useState } from 'react';
import { Star, MessageCircle, ThumbsUp, Flag } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  userHelpful?: boolean;
}

interface RecipeRatingProps {
  recipeId: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  userRating?: number;
  onRate: (rating: number) => void;
  onReview: (rating: number, comment: string) => void;
  onHelpful: (reviewId: string) => void;
  onReport: (reviewId: string, reason: string) => void;
}

export const RecipeRating: React.FC<RecipeRatingProps> = ({
  recipeId,
  averageRating,
  totalReviews,
  reviews,
  userRating,
  onRate,
  onReview,
  onHelpful,
  onReport,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const { user } = useAuth();

  const handleSubmitReview = () => {
    if (newRating > 0) {
      onReview(newRating, newComment);
      setShowReviewForm(false);
      setNewRating(0);
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Ratings & Reviews</h3>
          {user && !userRating && (
            <Button
              onClick={() => setShowReviewForm(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Star size={16} />
              Write Review
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-400 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={20}
                  className={`${
                    star <= averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating - 1];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-300 w-8">{rating}</span>
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Write a Review</h4>
          
          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    <Star
                      size={24}
                      className={`${
                        star <= (hoveredStar || newRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this recipe..."
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1">
                {newComment.length}/500 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowReviewForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={newRating === 0}
                className="flex-1"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Reviews</h4>
          
          {reviews.map(review => (
            <div
              key={review.id}
              className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{review.userName}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
                
                <button
                  onClick={() => onReport(review.id, 'inappropriate')}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  aria-label="Report review"
                >
                  <Flag size={16} />
                </button>
              </div>

              {review.comment && (
                <p className="text-gray-300 mb-3 leading-relaxed">{review.comment}</p>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => onHelpful(review.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    review.userHelpful
                      ? 'text-secondary-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  aria-label={`Mark review as helpful (${review.helpful} people found this helpful)`}
                >
                  <ThumbsUp size={14} className={review.userHelpful ? 'fill-current' : ''} />
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-white mb-2">No reviews yet</h4>
          <p className="text-gray-400 mb-4">
            Be the first to share your thoughts about this recipe!
          </p>
          {user && (
            <Button
              onClick={() => setShowReviewForm(true)}
              variant="primary"
            >
              Write First Review
            </Button>
          )}
        </div>
      )}
    </div>
  );
};