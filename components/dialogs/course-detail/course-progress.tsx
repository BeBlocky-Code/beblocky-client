import { Progress } from "@/components/ui/progress";

interface CourseProgressProps {
  progress?: number;
}

export function CourseProgress({ progress }: CourseProgressProps) {
  if (!progress) return null;

  return (
    <div className="space-y-2 rounded-2xl bg-muted/40 px-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight">Your progress</h3>
        <span className="text-sm font-semibold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
