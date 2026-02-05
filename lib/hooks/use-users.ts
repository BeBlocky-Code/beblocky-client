"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { userApi, type IUser } from "@/lib/api/user";
import { studentApi, type IStudentResponse } from "@/lib/api/student";
import { parentApi, type IParent } from "@/lib/api/parent";

// ============================================
// USER HOOKS
// ============================================

/**
 * Hook to fetch a user by ID
 *
 * @param userId - The user ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: user } = useUser(userId);
 */
export function useUser(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId || ""),
    queryFn: () => userApi.getUserById(userId!),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a user by email
 *
 * @param email - The user email
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: user } = useUserByEmail(email);
 */
export function useUserByEmail(email: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.byEmail(email || ""),
    queryFn: () => userApi.getUserByEmail(email!),
    enabled: enabled && !!email,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for updating a user
 *
 * @example
 * const updateMutation = useUpdateUser();
 * updateMutation.mutate({ userId, data: { name: "New Name" } });
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<IUser> }) =>
      userApi.updateUser(userId, data),
    onSuccess: (updatedUser, variables) => {
      // Update the cache directly with the new data
      queryClient.setQueryData(
        queryKeys.users.detail(variables.userId),
        updatedUser
      );
      // Also update by email if we have it
      if (updatedUser.email) {
        queryClient.setQueryData(
          queryKeys.users.byEmail(updatedUser.email),
          updatedUser
        );
      }
    },
  });
}

// ============================================
// STUDENT HOOKS
// ============================================

/**
 * Hook to fetch a student by ID
 *
 * @param studentId - The student ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: student } = useStudent(studentId);
 */
export function useStudent(studentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId || ""),
    queryFn: () => studentApi.getStudent(studentId!),
    enabled: enabled && !!studentId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch a student by user ID
 *
 * @param userId - The user ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: student } = useStudentByUserId(userId);
 */
export function useStudentByUserId(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.students.byUserId(userId || ""),
    queryFn: () => studentApi.getStudentByUserId(userId!),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for updating a student
 *
 * @example
 * const updateMutation = useUpdateStudent();
 * updateMutation.mutate({ studentId, data: { grade: 5 } });
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      data,
      userId,
    }: {
      studentId: string;
      data: Partial<IStudentResponse>;
      userId?: string;
    }) => studentApi.updateStudent(studentId, data),
    onSuccess: (updatedStudent, variables) => {
      // Update student by ID cache
      queryClient.setQueryData(
        queryKeys.students.detail(variables.studentId),
        updatedStudent
      );
      // Update student by userId cache if we have it
      if (variables.userId || updatedStudent.userId) {
        queryClient.setQueryData(
          queryKeys.students.byUserId(variables.userId || updatedStudent.userId),
          updatedStudent
        );
      }
    },
  });
}

// ============================================
// PARENT HOOKS
// ============================================

/**
 * Hook to fetch a parent by ID
 *
 * @param parentId - The parent ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: parent } = useParent(parentId);
 */
export function useParent(parentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.parents.detail(parentId || ""),
    queryFn: () => parentApi.getParent(parentId!),
    enabled: enabled && !!parentId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch a parent by user ID
 *
 * @param userId - The user ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: parent } = useParentByUserId(userId);
 */
export function useParentByUserId(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.parents.byUserId(userId || ""),
    queryFn: () => parentApi.getParentByUserId(userId!),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch a parent's children
 *
 * @param parentId - The parent ID
 * @param enabled - Whether the query should run
 *
 * @example
 * const { data: children } = useParentChildren(parentId);
 */
export function useParentChildren(parentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.parents.children(parentId || ""),
    queryFn: () => parentApi.getChildrenByParent(parentId!),
    enabled: enabled && !!parentId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch a parent with populated children data
 *
 * @param parentId - The parent ID
 * @param enabled - Whether the query should run
 */
export function useParentWithChildren(
  parentId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.parents.withChildren(parentId || ""),
    queryFn: () => parentApi.getParentWithChildren(parentId!),
    enabled: enabled && !!parentId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for updating a parent
 *
 * @example
 * const updateMutation = useUpdateParent();
 * updateMutation.mutate({ parentId, data: { phoneNumber: "123" } });
 */
export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      data,
      userId,
    }: {
      parentId: string;
      data: Partial<IParent>;
      userId?: string;
    }) => parentApi.updateParent(parentId, data),
    onSuccess: (updatedParent, variables) => {
      // Update parent by ID cache
      queryClient.setQueryData(
        queryKeys.parents.detail(variables.parentId),
        updatedParent
      );
      // Update parent by userId cache if we have it
      if (variables.userId || updatedParent.userId) {
        queryClient.setQueryData(
          queryKeys.parents.byUserId(variables.userId || updatedParent.userId),
          updatedParent
        );
      }
    },
  });
}

/**
 * Hook for adding a child to a parent
 *
 * @example
 * const addChildMutation = useAddChildToParent();
 * addChildMutation.mutate({ parentId, childData: { name: "Child", ... } });
 */
export function useAddChildToParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      childData,
    }: {
      parentId: string;
      childData: Parameters<typeof parentApi.addChildToParent>[1];
    }) => parentApi.addChildToParent(parentId, childData),
    onSuccess: (_, variables) => {
      // Invalidate children list
      queryClient.invalidateQueries({
        queryKey: queryKeys.parents.children(variables.parentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.parents.withChildren(variables.parentId),
      });
      // Also invalidate the parent itself as children array changes
      queryClient.invalidateQueries({
        queryKey: queryKeys.parents.detail(variables.parentId),
      });
    },
  });
}
