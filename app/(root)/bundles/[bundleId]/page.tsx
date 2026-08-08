"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BookOpen, ArrowLeft } from "lucide-react";
import { fetchBundle } from "@/lib/api/bundle";
import type { BundleResponse, BundleCourse } from "@/lib/api/bundle";
import { BundleDetailSkeleton } from "@/components/skeletons";

function isPopulatedCourse(c: BundleCourse | string): c is BundleCourse {
  return typeof c === "object" && c !== null && "_id" in c;
}

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bundleId = params.bundleId as string;
  const [bundle, setBundle] = useState<BundleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bundleId) return;
    fetchBundle(bundleId)
      .then((data) => setBundle(data))
      .catch(() => setBundle(null))
      .finally(() => setLoading(false));
  }, [bundleId]);

  if (loading) {
    return <BundleDetailSkeleton />;
  }

  if (!bundle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Bundle not found.</p>
        <Button variant="link" className="mt-2" onClick={() => router.push("/courses")}>
          Back to courses
        </Button>
      </div>
    );
  }

  const courseList = Array.isArray(bundle.courseIds)
    ? bundle.courseIds.filter(isPopulatedCourse)
    : [];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Package className="h-5 w-5" />
          <span>Bundle</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">{bundle.name}</h1>
        {bundle.description && (
          <p className="text-muted-foreground mt-2">{bundle.description}</p>
        )}
      </div>

      {courseList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            This bundle has no courses yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courseList.map((course) => (
            <Link
              key={course._id}
              href={`/courses/${course._id}`}
              className="block"
            >
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg line-clamp-1">
                    {course.courseTitle ?? "Course"}
                  </CardTitle>
                  {course.courseDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {course.courseDescription}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">
                    View course →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
