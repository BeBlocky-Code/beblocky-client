"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { courseApi } from "@/lib/api/course";
import type { ICourse, ICreateCourseDto, IUpdateCourseDto, ICourseRatingResponse, ICourseRatingStats } from "@/types/course";

/**
 * Hook to fetch all courses
 *
 * @example
 * const { data: courses, isLoading, error } = useCourses();
 */
export function useCourses() {
  return useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: () => courseApi.fetchAllCourses(),
    staleTime: 5 * 60 * 1000, // Courses don't change often, 5 min stale time
  });
}

/**
 * Hook to fetch a single course by ID
 *
 * @param courseId - The course ID to fetch
 * @param enabled - Whether the query should run (default: true when courseId exists)
 *
 * @example
 * const { data: course, isLoading } = useCourse(courseId);
 */
export function useCourse(courseId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId || ""),
    queryFn: () => courseApi.fetchCourseById(courseId!),
    enabled: enabled && !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch course rating statistics
 *
 * @param courseId - The course ID
 * @param userId - Optional user ID to check if user has rated
 *
 * @example
 * const { data: stats } = useCourseRatingStats(courseId, userId);
 */
export function useCourseRatingStats(
  courseId: string | undefined,
  userId?: string
) {
  return useQuery({
    queryKey: [...queryKeys.reviews.byCourse(courseId || ""), "stats", userId],
    queryFn: () => courseApi.getRatingStats(courseId!, userId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch all ratings for a course
 *
 * @param courseId - The course ID
 *
 * @example
 * const { data: ratings } = useCourseRatings(courseId);
 */
export function useCourseRatings(courseId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.byCourse(courseId || ""),
    queryFn: () => courseApi.getCourseRatings(courseId!),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for rating a course
 *
 * Automatically invalidates course ratings and stats on success.
 *
 * @example
 * const rateMutation = useRateCourse();
 * rateMutation.mutate({ courseId, userId, rating: 5, review: "Great course!" });
 */
export function useRateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      userId,
      rating,
      review,
    }: {
      courseId: string;
      userId: string;
      rating: number;
      review?: string;
    }) => courseApi.rateCourse(courseId, userId, { rating, review }),
    onSuccess: (_, variables) => {
      // Invalidate ratings and stats for this course
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byCourse(variables.courseId),
      });
    },
  });
}

/**
 * Hook for updating a course rating
 *
 * @example
 * const updateMutation = useUpdateCourseRating();
 * updateMutation.mutate({ courseId, userId, rating: 4 });
 */
export function useUpdateCourseRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      userId,
      rating,
      review,
    }: {
      courseId: string;
      userId: string;
      rating: number;
      review?: string;
    }) => courseApi.updateRating(courseId, userId, { rating, review }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byCourse(variables.courseId),
      });
    },
  });
}

/**
 * Hook for deleting a course rating
 *
 * @example
 * const deleteMutation = useDeleteCourseRating();
 * deleteMutation.mutate({ courseId, userId });
 */
export function useDeleteCourseRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, userId }: { courseId: string; userId: string }) =>
      courseApi.deleteRating(courseId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byCourse(variables.courseId),
      });
    },
  });
}
