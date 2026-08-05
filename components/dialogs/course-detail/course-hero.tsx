import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { ICourse } from "@/types/course";

interface CourseHeroProps {
  course: ICourse;
}

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="flex h-36 items-center justify-center bg-[radial-gradient(ellipse_at_top,oklch(0.75_0.16_55_/_0.45),transparent_70%),linear-gradient(180deg,oklch(0.97_0.02_70),oklch(0.96_0.01_50))] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.45_0.12_55_/_0.35),transparent_70%),linear-gradient(180deg,oklch(0.22_0.02_70),oklch(0.18_0.01_50))]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
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
