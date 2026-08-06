"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Star,
  Clock,
  Users,
  Award,
  Play,
  Plus,
  CheckCircle,
  Globe,
  Target,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import type {
  ICourse,
  ICourseRatingResponse,
  ICourseRatingStats,
} from "@/types/course";
import { CourseSubscriptionType } from "@/types/course";
import { useSubscription } from "@/hooks/use-subscription";
import { canAccessCourse } from "@/lib/utils/subscription-hierarchy";
import { formatDate } from "@/lib/utils";
import { courseApi } from "@/lib/api/course";
import { lessonApi } from "@/lib/api/lesson";
import { progressApi } from "@/lib/api/progress";
import { studentApi } from "@/lib/api/student";
import { useSession } from "@/lib/auth-client";

interface CourseDetailsDialogProps {
  course: ICourse | null;
  isOpen: boolean;
  onClose: () => void;
  userType: "student" | "parent";
  onEnroll?: (courseId: string) => void;
  onAddToPlan?: (courseId: string) => void;
}

export function CourseDetailsDialog({
  course,
  isOpen,
  onClose,
  userType,
  onEnroll,
  onAddToPlan,
}: CourseDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<ICourseRatingResponse[]>([]);
  const [ratingStats, setRatingStats] = useState<ICourseRatingStats | null>(
    null
  );
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [totalHours, setTotalHours] = useState(2);
  const [studentsCount, setStudentsCount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Get user ID from session
  const { data: session } = useSession();
  const { subscription } = useSubscription();

  // Use the same pattern as in user.ts to safely access user ID
  const userId = (() => {
    if (session && typeof session === "object" && "user" in session) {
      const user = (session as { user: { id: string; email?: string } }).user;
      return user?.id;
    }
    return undefined;
  })();

  // Validate userId to ensure it's not null/undefined/empty
  const isValidUserId =
    userId && typeof userId === "string" && userId.trim().length > 0;

  // Fetch lesson data for duration calculation
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!course) return;

      try {
        const lessons = await lessonApi.getLessonsByCourse(course._id);
        const totalMinutes = lessons.reduce(
          (sum, lesson) => sum + (Number(lesson.duration) || 0),
          0
        );
        const hours =
          totalMinutes > 0 ? Math.max(1, Math.round(totalMinutes / 60)) : 2;
        setTotalHours(hours);
      } catch (error) {
        console.warn(
          "Failed to fetch lesson data for course:",
          course._id,
          error
        );
        setTotalHours(2); // Default fallback
      }
    };

    fetchLessonData();
  }, [course]);

  // Calculate students count from course data
  useEffect(() => {
    if (!course) return;

    const count = Array.isArray((course as any).students)
      ? ((course as any).students as string[]).length
      : 0;
    setStudentsCount(count);
  }, [course]);

  // Check enrollment status for students
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!course || !session?.user?.id || userType !== "student") {
        setIsEnrolled(false);
        return;
      }

      try {
        const student = await studentApi.getStudentByUserId(session.user.id);
        const progress = await progressApi.getStudentCourseProgressSilently(
          student._id,
          course._id
        );
        setIsEnrolled(!!progress);
      } catch (error) {
        console.warn("Failed to check enrollment status:", error);
        setIsEnrolled(false);
      }
    };

    checkEnrollment();
  }, [course, session?.user?.id, userType]);

  const loadReviews = useCallback(async () => {
    if (!course) return;

    setIsLoadingReviews(true);
    try {
      // Only fetch user-specific stats if we have a valid userId
      // For now, skip user-specific data if userId is not in expected format
      const isUserIdValid = userId && userId.length > 0;

      const [ratingsResponse, statsResponse] = await Promise.all([
        courseApi.getCourseRatings(course._id),
        isUserIdValid
          ? courseApi.getRatingStats(course._id, userId)
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
  }, [course, userId]);

  useEffect(() => {
    if (course && showReviews) {
      loadReviews();
    }
  }, [course, showReviews, loadReviews]);

  if (!course) return null;

  const handleSubmitReview = async () => {
    if (!course || !userId || userRating === 0) {
      console.error("Cannot submit review: missing course, userId, or rating");
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
        await courseApi.updateRating(course._id, userId, ratingData);
      } else {
        // Create new rating
        await courseApi.rateCourse(course._id, userId, ratingData);
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
    if (!course || !userId) {
      console.error("Cannot delete review: missing course or userId");
      return;
    }

    try {
      await courseApi.deleteRating(course._id, userId);
      setUserRating(0);
      setUserReview("");
      await loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again later.");
    }
  };

  const handleAction = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (userType === "student") {
      onEnroll?.(course._id);
    } else {
      onAddToPlan?.(course._id);
    }

    setIsLoading(false);
    onClose();
  };

  // Check if user has the same course (for parent users)
  const userHasSameCourse =
    course?.progress !== undefined && course?.progress > 0;

  // Determine if Add to Plan should be visible per hierarchy
  const shouldShowAddToPlan = (() => {
    if (!course) return false;
    // 1) Free plan courses should NOT show add to plan
    if (course.subType === CourseSubscriptionType.FREE) return false;
    // 2) If user plan already covers this course level, hide
    const userPlan = subscription?.planName || null;
    const covered = canAccessCourse(userPlan as any, course.subType);
    return !covered;
  })();

  // Determine if current user has access to this course level
  const studentHasAccess = (() => {
    if (!course) return false;
    const userPlan = subscription?.planName || null;
    return canAccessCourse(userPlan as any, course.subType);
  })();

  const features = [
    "Interactive coding exercises",
    "Step-by-step tutorials",
    "Real-world projects",
    "Progress tracking",
    "Certificate of completion",
  ];

  const difficulty =
    course.courseLanguage === "HTML"
      ? "Beginner"
      : course.courseLanguage === "Python"
        ? "Intermediate"
        : "Advanced";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="sr-only">Course Details</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Hero Section */}
          <div className="relative">
            <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
            <Badge
              className="absolute top-4 right-4"
              variant={course.status === "Active" ? "default" : "secondary"}
            >
              {course.status}
            </Badge>
          </div>

          {/* Course Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{course.courseTitle}</h1>
              <p className="text-muted-foreground">
                {course.courseDescription}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-3">
                <CardContent className="p-0 text-center">
                  <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{course.rating}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0 text-center">
                  <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{totalHours}h</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0 text-center">
                  <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{studentsCount}</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0 text-center">
                  <Target className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{difficulty}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </CardContent>
              </Card>
            </div>

            {/* Course Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4">
                <CardContent className="p-0">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    What You&apos;ll Learn
                  </h3>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardContent className="p-0">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Course Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Language
                      </span>
                      <Badge variant="outline">{course.courseLanguage}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Subscription
                      </span>
                      <Badge variant="secondary">{course.subType}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Difficulty
                      </span>
                      <span className="text-sm font-medium">{difficulty}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Last Updated
                      </span>
                      <span className="text-sm">
                        {formatDate(course.updatedAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress (if enrolled) */}
            {course.progress && (
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Your Progress</h3>
                    <span className="text-sm text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reviews & Ratings
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviews(!showReviews)}
                  >
                    {showReviews ? "Hide" : "Show"} Reviews
                  </Button>
                </div>

                {showReviews && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Rating Stats */}
                    {ratingStats && (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {ratingStats.averageRating.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Average Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {ratingStats.totalRatings}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Reviews
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {ratingStats.userRating ? "✓" : "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Your Rating
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add Review Form */}
                    {userId ? (
                      <div className="space-y-3 p-4 border rounded-lg">
                        <h4 className="font-medium">Write a Review</h4>
                        <p className="text-xs text-muted-foreground">
                          User ID: {userId.substring(0, 10)}...
                        </p>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setUserRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= userRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
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

                        {/* Review Text */}
                        <Textarea
                          placeholder="Share your experience with this course..."
                          value={userReview}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setUserReview(e.target.value)}
                          className="min-h-[80px]"
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitReview}
                            disabled={userRating === 0 || isSubmittingReview}
                            size="sm"
                            className="gap-2"
                          >
                            {isSubmittingReview ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            {ratingStats?.userRating ? "Update" : "Submit"}{" "}
                            Review
                          </Button>

                          {ratingStats?.userRating && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDeleteReview}
                            >
                              Delete Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>Please sign in to write a review</p>
                      </div>
                    )}

                    {/* Reviews List */}
                    {isLoadingReviews ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium">Recent Reviews</h4>
                        {reviews.slice(0, 5).map((review) => (
                          <div
                            key={review.id}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
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
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p>
                          No reviews yet. Be the first to review this course!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Close
            </Button>

            {userType === "student" ? (
              studentHasAccess ? (
                <Button
                  onClick={handleAction}
                  disabled={isLoading || isEnrolled}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    "Enrolling..."
                  ) : isEnrolled ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Already Enrolled
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      {course.progress ? "Continue Learning" : "Enroll Now"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => onAddToPlan?.(course._id)}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add to Plan
                    </>
                  )}
                </Button>
              )
            ) : shouldShowAddToPlan && !userHasSameCourse ? (
              <Button
                onClick={handleAction}
                disabled={isLoading}
                className="flex-1 gap-2"
              >
                {isLoading ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add to Plan
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" disabled className="flex-1 gap-2">
                <CheckCircle className="h-4 w-4" />
                Already in Plan
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
