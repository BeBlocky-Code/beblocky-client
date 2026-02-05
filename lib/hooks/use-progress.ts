"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { progressApi } from "@/lib/api/progress";
import type { IProgress, IStudentProgress, IProgressResponse } from "@/types/dashboard-simple";

/**
 * Hook to fetch all progress records for a student
 *
 * @param studentId - The student ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: progress } = useStudentProgress(studentId);
 */
export function useStudentProgress(
  studentId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.progress.byStudent(studentId || ""),
    queryFn: () => progressApi.getStudentProgress(studentId!),
    enabled: enabled && !!studentId,
    staleTime: 60 * 1000, // Progress data: 1 minute stale time
  });
}

/**
 * Hook to fetch a student's progress for a specific course
 *
 * @param studentId - The student ID
 * @param courseId - The course ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: progress } = useStudentCourseProgress(studentId, courseId);
 */
export function useStudentCourseProgress(
  studentId: string | undefined,
  courseId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.progress.byStudentAndCourse(
      studentId || "",
      courseId || ""
    ),
    queryFn: () => progressApi.getStudentCourseProgress(studentId!, courseId!),
    enabled: enabled && !!studentId && !!courseId,
    staleTime: 30 * 1000, // Active progress: 30 second stale time
  });
}

/**
 * Hook to silently check if progress exists (doesn't throw on 404)
 *
 * @param studentId - The student ID
 * @param courseId - The course ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: progress } = useStudentCourseProgressSilent(studentId, courseId);
 * const isEnrolled = !!progress;
 */
export function useStudentCourseProgressSilent(
  studentId: string | undefined,
  courseId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: [
      ...queryKeys.progress.byStudentAndCourse(studentId || "", courseId || ""),
      "silent",
    ],
    queryFn: () =>
      progressApi.getStudentCourseProgressSilently(studentId!, courseId!),
    enabled: enabled && !!studentId && !!courseId,
    staleTime: 30 * 1000,
    retry: false, // Don't retry on failure since we expect 404s
  });
}

/**
 * Hook to fetch all progress records for a course
 *
 * @param courseId - The course ID
 * @param enabled - Whether the query should run
 */
export function useCourseProgress(courseId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.progress.byCourse(courseId || ""),
    queryFn: () => progressApi.getCourseProgress(courseId!),
    enabled: enabled && !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for creating a new progress entry
 *
 * Automatically invalidates related progress queries on success.
 *
 * @example
 * const createMutation = useCreateProgress();
 * createMutation.mutate({ studentId, courseId });
 */
export function useCreateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (progressData: Partial<IProgress>) =>
      progressApi.createProgress(progressData),
    onSuccess: (_, variables) => {
      // Invalidate student's progress queries
      if (variables.studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byStudent(variables.studentId),
        });
      }
      // Invalidate course progress
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byCourse(variables.courseId),
        });
      }
      // Invalidate specific student+course progress
      if (variables.studentId && variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byStudentAndCourse(
            variables.studentId,
            variables.courseId
          ),
        });
      }
    },
  });
}

/**
 * Hook for creating minimal progress (just studentId and courseId)
 *
 * @example
 * const enrollMutation = useEnrollInCourse();
 * enrollMutation.mutate({ studentId, courseId });
 */
export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      courseId,
    }: {
      studentId: string;
      courseId: string;
    }) => progressApi.createMinimalProgress(studentId, courseId),
    onSuccess: (_, variables) => {
      // Invalidate all related progress queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.byStudent(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.byCourse(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.byStudentAndCourse(
          variables.studentId,
          variables.courseId
        ),
      });
      // Also invalidate the silent check query
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.progress.byStudentAndCourse(
            variables.studentId,
            variables.courseId
          ),
          "silent",
        ],
      });
    },
  });
}

/**
 * Hook for updating progress
 *
 * @example
 * const updateMutation = useUpdateProgress();
 * updateMutation.mutate({
 *   progressId,
 *   data: { completionPercentage: 50 },
 *   studentId,
 *   courseId
 * });
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      progressId,
      data,
    }: {
      progressId: string;
      data: Partial<IProgress>;
      studentId?: string;
      courseId?: string;
    }) => progressApi.updateProgress(progressId, data),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      if (variables.studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byStudent(variables.studentId),
        });
      }
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byCourse(variables.courseId),
        });
      }
      if (variables.studentId && variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byStudentAndCourse(
            variables.studentId,
            variables.courseId
          ),
        });
      }
    },
  });
}

/**
 * Hook for marking a lesson/slide as completed
 *
 * @example
 * const completeMutation = useMarkAsCompleted();
 * completeMutation.mutate({ studentId, courseId, lessonId, slideId });
 */
export function useMarkAsCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      courseId,
      lessonId,
      slideId,
    }: {
      studentId: string;
      courseId: string;
      lessonId: string;
      slideId?: string;
    }) => progressApi.markAsCompleted(studentId, courseId, lessonId, slideId),
    onSuccess: (_, variables) => {
      // Invalidate all related progress queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.byStudent(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.byStudentAndCourse(
          variables.studentId,
          variables.courseId
        ),
      });
    },
  });
}

/**
 * Hook for deleting a progress entry
 *
 * @example
 * const deleteMutation = useDeleteProgress();
 * deleteMutation.mutate({ progressId, studentId, courseId });
 */
export function useDeleteProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      progressId,
    }: {
      progressId: string;
      studentId?: string;
      courseId?: string;
    }) => progressApi.deleteProgress(progressId),
    onSuccess: (_, variables) => {
      if (variables.studentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byStudent(variables.studentId),
        });
      }
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byCourse(variables.courseId),
        });
      }
      if (variables.studentId && variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.progress.byStudentAndCourse(
            variables.studentId,
            variables.courseId
          ),
        });
      }
    },
  });
}
