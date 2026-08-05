import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ICourse } from "@/types/course";

interface CourseDetailsProps {
  course: ICourse;
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const features = [
    "Interactive coding exercises",
    "Step-by-step tutorials",
    "Real-world projects",
    "Progress tracking",
    "Certificate of completion",
  ];

  const difficulty =
    course.courseLanguage === "HTML"
      ? "Beginner"
      : course.courseLanguage === "Python"
        ? "Intermediate"
        : "Advanced";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-tight">What you&apos;ll learn</h3>
        <ul className="space-y-2.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-tight">Course information</h3>
        <div className="space-y-3 rounded-2xl bg-muted/40 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Language</span>
            <Badge variant="outline" className="rounded-full">
              {course.courseLanguage}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Subscription</span>
            <Badge variant="secondary" className="rounded-full">
              {course.subType}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Difficulty</span>
            <span className="text-sm font-semibold">{difficulty}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Last updated</span>
            <span className="text-sm font-medium">
              {formatDate(course.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
