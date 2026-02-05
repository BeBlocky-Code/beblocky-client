/**
 * Query Key Factory for TanStack Query
 *
 * This module provides a centralized, hierarchical query key system for consistent
 * cache management across the application.
 *
 * Usage:
 *   import { queryKeys } from '@/lib/query-keys';
 *
 *   // In useQuery:
 *   useQuery({
 *     queryKey: queryKeys.courses.detail(courseId),
 *     queryFn: () => courseApi.fetchCourseById(courseId),
 *   });
 *
 *   // In invalidation:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
 *   queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) });
 *
 * Key Hierarchy Pattern:
 *   - ['entity'] - all queries for this entity
 *   - ['entity', 'list'] - all list queries
 *   - ['entity', 'list', { filters }] - filtered list
 *   - ['entity', 'detail', id] - single item by id
 *   - ['entity', 'byField', fieldValue] - item by custom field
 */

export const queryKeys = {
  // ============================================
  // COURSES
  // ============================================
  courses: {
    all: ["courses"] as const,
    lists: () => [...queryKeys.courses.all, "list"] as const,
    list: (filters?: { language?: string; level?: string }) =>
      [...queryKeys.courses.lists(), filters] as const,
    details: () => [...queryKeys.courses.all, "detail"] as const,
    detail: (courseId: string) =>
      [...queryKeys.courses.details(), courseId] as const,
    withContent: (courseId: string) =>
      [...queryKeys.courses.all, "withContent", courseId] as const,
  },

  // ============================================
  // LESSONS
  // ============================================
  lessons: {
    all: ["lessons"] as const,
    lists: () => [...queryKeys.lessons.all, "list"] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.lessons.lists(), { courseId }] as const,
    details: () => [...queryKeys.lessons.all, "detail"] as const,
    detail: (lessonId: string) =>
      [...queryKeys.lessons.details(), lessonId] as const,
    withSlides: (lessonId: string) =>
      [...queryKeys.lessons.all, "withSlides", lessonId] as const,
  },

  // ============================================
  // USERS
  // ============================================
  users: {
    all: ["users"] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (userId: string) => [...queryKeys.users.details(), userId] as const,
    byEmail: (email: string) =>
      [...queryKeys.users.all, "byEmail", email] as const,
    current: () => [...queryKeys.users.all, "current"] as const,
  },

  // ============================================
  // STUDENTS
  // ============================================
  students: {
    all: ["students"] as const,
    details: () => [...queryKeys.students.all, "detail"] as const,
    detail: (studentId: string) =>
      [...queryKeys.students.details(), studentId] as const,
    byUserId: (userId: string) =>
      [...queryKeys.students.all, "byUserId", userId] as const,
    byEmail: (email: string) =>
      [...queryKeys.students.all, "byEmail", email] as const,
  },

  // ============================================
  // PARENTS
  // ============================================
  parents: {
    all: ["parents"] as const,
    details: () => [...queryKeys.parents.all, "detail"] as const,
    detail: (parentId: string) =>
      [...queryKeys.parents.details(), parentId] as const,
    byUserId: (userId: string) =>
      [...queryKeys.parents.all, "byUserId", userId] as const,
    children: (parentId: string) =>
      [...queryKeys.parents.all, "children", parentId] as const,
    withChildren: (parentId: string) =>
      [...queryKeys.parents.all, "withChildren", parentId] as const,
  },

  // ============================================
  // PROGRESS
  // ============================================
  progress: {
    all: ["progress"] as const,
    byStudent: (studentId: string) =>
      [...queryKeys.progress.all, "byStudent", studentId] as const,
    byStudentAndCourse: (studentId: string, courseId: string) =>
      [
        ...queryKeys.progress.all,
        "byStudentAndCourse",
        studentId,
        courseId,
      ] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.progress.all, "byCourse", courseId] as const,
  },

  // ============================================
  // AI CONVERSATIONS
  // ============================================
  ai: {
    all: ["ai"] as const,
    conversations: {
      all: () => [...queryKeys.ai.all, "conversations"] as const,
      byStudent: (studentId: string) =>
        [...queryKeys.ai.conversations.all(), "byStudent", studentId] as const,
      detail: (conversationId: string) =>
        [...queryKeys.ai.conversations.all(), "detail", conversationId] as const,
    },
    analysis: {
      all: () => [...queryKeys.ai.all, "analysis"] as const,
      historyByStudent: (studentId: string) =>
        [...queryKeys.ai.analysis.all(), "history", studentId] as const,
      detail: (analysisId: string) =>
        [...queryKeys.ai.analysis.all(), "detail", analysisId] as const,
    },
  },

  // ============================================
  // SUBSCRIPTIONS
  // ============================================
  subscriptions: {
    all: ["subscriptions"] as const,
    byUser: (userId: string) =>
      [...queryKeys.subscriptions.all, "byUser", userId] as const,
    plans: () => [...queryKeys.subscriptions.all, "plans"] as const,
  },

  // ============================================
  // PAYMENTS
  // ============================================
  payments: {
    all: ["payments"] as const,
    byUser: (userId: string) =>
      [...queryKeys.payments.all, "byUser", userId] as const,
    detail: (paymentId: string) =>
      [...queryKeys.payments.all, "detail", paymentId] as const,
  },

  // ============================================
  // REVIEWS
  // ============================================
  reviews: {
    all: ["reviews"] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.reviews.all, "byCourse", courseId] as const,
    byUser: (userId: string) =>
      [...queryKeys.reviews.all, "byUser", userId] as const,
  },
} as const;

/**
 * Helper type to extract query key types
 */
export type QueryKeys = typeof queryKeys;
