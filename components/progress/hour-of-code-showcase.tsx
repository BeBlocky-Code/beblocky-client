"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ChevronRight } from "lucide-react";
import { fetchHourOfCode } from "@/lib/api/hour-of-code";
import type { HourOfCodeResponse, HourOfCodeCourse } from "@/lib/api/hour-of-code";

function isPopulatedCourse(c: HourOfCodeCourse | string): c is HourOfCodeCourse {
  return typeof c === "object" && c !== null && "_id" in c;
}

export function HourOfCodeShowcase() {
  const [data, setData] = useState<HourOfCodeResponse | null | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;
    fetchHourOfCode().then((res) => {
      if (!cancelled) setData(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (data === undefined) return null;
  if (data === null) return null;

  const courseList = Array.isArray(data.courseIds)
    ? data.courseIds.filter(isPopulatedCourse)
    : [];

  if (courseList.length === 0) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hour of Code
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick-start courses to try in an hour.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courseList.map((course) => (
            <Link
              key={course._id}
              href={`/courses/${course._id}`}
              className="block"
            >
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {course.courseTitle ?? "Course"}
                    </p>
                    {course.courseDescription && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {course.courseDescription}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
