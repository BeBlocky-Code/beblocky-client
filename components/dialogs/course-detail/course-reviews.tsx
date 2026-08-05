import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { courseApi } from "@/lib/api/course";
import type {
  ICourse,
  ICourseRatingResponse,
  ICourseRatingStats,
} from "@/types/course";

interface CourseReviewsProps {
  course: ICourse;
  userId?: string;
  isValidUserId: boolean;
}

export function CourseReviews({
  course,
  userId,
  isValidUserId,
}: CourseReviewsProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<ICourseRatingResponse[]>([]);
  const [ratingStats, setRatingStats] = useState<ICourseRatingStats | null>(
    null
  );
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!course) return;

    setIsLoadingReviews(true);
    try {
      // Only fetch user-specific stats if we have a valid userId
      const [ratingsResponse, statsResponse] = await Promise.all([
        courseApi.getCourseRatings(course._id),
        isValidUserId
          ? courseApi.getRatingStats(course._id, userId!)
          : courseApi.getRatingStats(course._id), // Without userId
      ]);

      // Safely set reviews with fallback to empty array
      setReviews(ratingsResponse || []);

      // Safely set rating stats with fallback to null
      setRatingStats(statsResponse || null);

      // Set user's existing rating if any (with safe navigation)
      if (statsResponse?.userRating) {
        setUserRating(statsResponse.userRating);
      } else {
        setUserRating(0); // Reset if no user rating
      }

      if (statsResponse?.userReview) {
        setUserReview(statsResponse.userReview);
      } else {
        setUserReview(""); // Reset if no user review
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      // Set default values on error
      setReviews([]);
      setRatingStats(null);
      setUserRating(0);
      setUserReview("");
    } finally {
      setIsLoadingReviews(false);
    }
  }, [course, userId, isValidUserId]);

  useEffect(() => {
    if (course && showReviews) {
      loadReviews();
    }
  }, [course, showReviews, loadReviews]);

  const handleSubmitReview = async () => {
    if (!course || !isValidUserId || userRating === 0) {
      console.error(
        "Cannot submit review: missing course, valid userId, or rating"
      );
      return;
    }

    setIsSubmittingReview(true);
    try {
      const ratingData = {
        rating: userRating,
        review: userReview.trim() || undefined,
      };

      if (ratingStats?.userRating) {
        // Update existing rating
        await courseApi.updateRating(course._id, userId!, ratingData);
      } else {
        // Create new rating
        await courseApi.rateCourse(course._id, userId!, ratingData);
      }

      // Reload reviews to show updated data
      await loadReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      // Show user-friendly error message
      alert("Failed to submit review. Please try again later.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!course || !isValidUserId) {
      console.error("Cannot delete review: missing course or valid userId");
      return;
    }

    try {
      await courseApi.deleteRating(course._id, userId!);
      setUserRating(0);
      setUserReview("");
      await loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again later.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold tracking-tight">Reviews & ratings</h3>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setShowReviews(!showReviews)}
        >
          {showReviews ? "Hide" : "Show"} reviews
        </Button>
      </div>

      {showReviews && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {ratingStats && (
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/40 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {ratingStats.averageRating.toFixed(1)}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Average
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {ratingStats.totalRatings}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Reviews
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {ratingStats.userRating ? "✓" : "—"}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Yours
                </div>
              </div>
            </div>
          )}

          {isValidUserId ? (
            <div className="space-y-3 rounded-2xl border border-border/50 p-4">
              <h4 className="text-sm font-bold tracking-tight">Write a review</h4>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="rounded-md p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= userRating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {userRating > 0
                    ? `${userRating} star${userRating > 1 ? "s" : ""}`
                    : "Select rating"}
                </span>
              </div>

              <Textarea
                placeholder="Share your experience with this course…"
                value={userReview}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setUserReview(e.target.value)
                }
                className="min-h-[80px] rounded-xl border-border/60 bg-muted/30"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={userRating === 0 || isSubmittingReview}
                  size="sm"
                  className="gap-2 rounded-full"
                >
                  {isSubmittingReview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {ratingStats?.userRating ? "Update" : "Submit"} review
                </Button>

                {ratingStats?.userRating && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleDeleteReview}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Please sign in to write a review
            </p>
          )}

          {isLoadingReviews ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-bold tracking-tight">Recent reviews</h4>
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl bg-muted/30 px-4 py-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.review && (
                    <p className="text-sm text-muted-foreground">
                      {review.review}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">
                No reviews yet. Be the first to review this course!
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
