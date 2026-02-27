"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import type { ICourse } from "@/types/course";
import { courseApi } from "@/lib/api/course";
import { EnrollmentDialog } from "@/components/dialogs/enrollment-dialog";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string | undefined;

  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await courseApi.fetchCourseById(courseId);
        if (!cancelled) {
          setCourse(data);
        }
      } catch (error) {
        console.error("Failed to load course", error);
        if (!cancelled) {
          setCourse(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading course...</span>
        </div>
      </div>
    );
  }

  if (!course || !courseId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Course not found.</p>
        <Button
          variant="link"
          className="mt-2"
          onClick={() => router.push("/courses")}
        >
          Back to courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <button
        type="button"
        onClick={() => router.push("/courses")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] items-start">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </span>
              <span className="truncate">{course.courseTitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {course.courseDescription}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Language</div>
                <div className="text-muted-foreground">
                  {course.courseLanguage || "English"}
                </div>
              </div>
              <div>
                <div className="font-medium">Plan</div>
                <div className="text-muted-foreground">
                  {course.subType ?? "Free"}
                </div>
              </div>
              <div>
                <div className="font-medium">Status</div>
                <div className="text-muted-foreground">
                  {course.status ?? "Active"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Ready to learn?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enroll in this course and we’ll take you straight into the Beblocky
              IDE to start learning.
            </p>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => setEnrollmentOpen(true)}
            >
              <BookOpen className="h-4 w-4" />
              Learn in IDE
            </Button>
          </CardContent>
        </Card>
      </div>

      <EnrollmentDialog
        course={course}
        isOpen={enrollmentOpen}
        onClose={() => setEnrollmentOpen(false)}
        onEnrollmentSuccess={() => {
          // no-op; EnrollmentDialog already navigates to IDE
        }}
      />
    </div>
  );
}

