import { Star, Clock, Users, Target } from "lucide-react";

interface CourseStatsProps {
  rating: number;
  totalHours: number;
  studentsCount: number;
  difficulty: string;
}

export function CourseStats({
  rating,
  totalHours,
  studentsCount,
  difficulty,
}: CourseStatsProps) {
  const items = [
    { label: "Rating", value: String(rating), icon: Star },
    { label: "Duration", value: `${totalHours}h`, icon: Clock },
    { label: "Students", value: String(studentsCount), icon: Users },
    { label: "Level", value: difficulty, icon: Target },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl bg-muted/40 px-3 py-3 text-center"
        >
          <Icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
          <div className="text-base font-bold tracking-tight">{value}</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
