"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { EnrollmentDialog } from "@/components/dialogs/enrollment-dialog";
import { CourseDetailSkeleton } from "@/components/skeletons";
import { useCourse } from "@/lib/hooks";
import { useState } from "react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string | undefined;
  const { data: course, isLoading: loading } = useCourse(courseId);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  if (loading) {
    return <CourseDetailSkeleton />;
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              {course.courseTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{course.courseDescription}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Language</p>
                <p className="font-medium">{course.courseLanguage}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Plan</p>
                <p className="font-medium">{course.subType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">{course.status}</p>
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
              Enroll in this course to start coding in the IDE.
            </p>
            <Button onClick={() => setEnrollmentOpen(true)}>Enroll</Button>
          </CardContent>
        </Card>
      </div>

      <EnrollmentDialog
        course={course}
        isOpen={enrollmentOpen}
        onClose={() => setEnrollmentOpen(false)}
      />
    </div>
  );
}
