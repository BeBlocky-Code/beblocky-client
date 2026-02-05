import { useState, useEffect, useCallback } from "react";
import { courseApi } from "@/lib/api/course";
import { useSession } from "@/lib/auth-client";
import type {
  ICourse,
  ICreateCourseDto,
  IUpdateCourseDto,
} from "@/types/course";

interface UseCoursesReturn {
  courses: ICourse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCourse: (data: ICreateCourseDto) => Promise<ICourse>;
  updateCourse: (id: string, data: IUpdateCourseDto) => Promise<ICourse>;
  deleteCourse: (id: string) => Promise<void>;
}

export function useCourses(): UseCoursesReturn {
  const { data: session, isPending: sessionLoading } = useSession();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    // Don't fetch if session is still loading
    if (sessionLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await courseApi.fetchAllCourses();
      setCourses(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch courses";
      setError(errorMessage);
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [session, sessionLoading]);

  const createCourse = useCallback(
    async (data: ICreateCourseDto): Promise<ICourse> => {
      try {
        const newCourse = await courseApi.createCourse(data);
        setCourses((prev) => [...prev, newCourse]);
        return newCourse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create course";
        throw new Error(errorMessage);
      }
    },
    []
  );

  const updateCourse = useCallback(
    async (id: string, data: IUpdateCourseDto): Promise<ICourse> => {
      try {
        const updatedCourse = await courseApi.updateCourse(id, data);
        setCourses((prev) =>
          prev.map((course) => (course._id === id ? updatedCourse : course))
        );
        return updatedCourse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update course";
        throw new Error(errorMessage);
      }
    },
    []
  );

  const deleteCourse = useCallback(async (id: string): Promise<void> => {
    try {
      await courseApi.deleteCourse(id);
      setCourses((prev) => prev.filter((course) => course._id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete course";
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading: sessionLoading || loading,
    error,
    refetch: fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

// Hook for single course operations
export function useCourse(id: string) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!id || sessionLoading) return;

    try {
      setLoading(true);
      setError(null);
      const data = await courseApi.fetchCourseById(id);
      setCourse(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch course";
      setError(errorMessage);
      console.error(`Error fetching course ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, [id, sessionLoading]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return {
    course,
    loading: sessionLoading || loading,
    error,
    refetch: fetchCourse,
  };
}
