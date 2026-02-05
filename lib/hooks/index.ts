/**
 * Centralized exports for all TanStack Query hooks
 *
 * Usage:
 *   import { useCourses, useStudentProgress, useUser } from '@/lib/hooks';
 */

// Course hooks
export {
  useCourses,
  useCourse,
  useCourseRatingStats,
  useCourseRatings,
  useRateCourse,
  useUpdateCourseRating,
  useDeleteCourseRating,
} from "./use-courses";

// Progress hooks
export {
  useStudentProgress,
  useStudentCourseProgress,
  useStudentCourseProgressSilent,
  useCourseProgress,
  useCreateProgress,
  useEnrollInCourse,
  useUpdateProgress,
  useMarkAsCompleted,
  useDeleteProgress,
} from "./use-progress";

// User/Student/Parent hooks
export {
  // Users
  useUser,
  useUserByEmail,
  useUpdateUser,
  // Students
  useStudent,
  useStudentByUserId,
  useUpdateStudent,
  // Parents
  useParent,
  useParentByUserId,
  useParentChildren,
  useParentWithChildren,
  useUpdateParent,
  useAddChildToParent,
} from "./use-users";
