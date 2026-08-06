import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { ICourse } from "@/types/course";

interface CourseHeroProps {
  course: ICourse;
}

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="flex h-36 items-center justify-center bg-muted">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen className="h-7 w-7" />
        </div>
      </div>
      <Badge
        className="absolute top-4 right-4 rounded-full"
        variant={course.status === "Active" ? "default" : "secondary"}
      >
        {course.status}
      </Badge>
    </div>
  );
}
