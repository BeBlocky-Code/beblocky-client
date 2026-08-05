import { Button } from "@/components/ui/button";
import { Play, Plus, CheckCircle } from "lucide-react";
import { CourseSubscriptionType } from "@/types/course";
import { canAccessCourse } from "@/lib/utils/subscription-hierarchy";
import {
  dialogPrimaryBtnClass,
  dialogSecondaryBtnClass,
} from "@/components/dialogs/dialog-shell";

interface CourseActionsProps {
  course: any;
  userType: "student" | "parent";
  isLoading: boolean;
  isEnrolled: boolean;
  subscription?: any;
  onEnroll?: (courseId: string) => void;
  onAddToPlan?: (courseId: string) => void;
  onClose: () => void;
}

export function CourseActions({
  course,
  userType,
  isLoading,
  isEnrolled,
  subscription,
  onEnroll,
  onAddToPlan,
  onClose,
}: CourseActionsProps) {
  const userHasSameCourse =
    course?.progress !== undefined && course?.progress > 0;

  const shouldShowAddToPlan = (() => {
    if (!course) return false;
    if (course.subType === CourseSubscriptionType.FREE) return false;
    const userPlan = subscription?.planName || null;
    const covered = canAccessCourse(userPlan as any, course.subType);
    return !covered;
  })();

  const studentHasAccess = (() => {
    if (!course) return false;
    const userPlan = subscription?.planName || null;
    return canAccessCourse(userPlan as any, course.subType);
  })();

  const handleAction = async () => {
    if (userType === "student") {
      onEnroll?.(course._id);
    } else {
      onAddToPlan?.(course._id);
    }
    onClose();
  };

  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/20 px-0 pt-4 sm:flex-row">
      <Button
        variant="outline"
        onClick={onClose}
        className={dialogSecondaryBtnClass}
      >
        Close
      </Button>

      {userType === "student" ? (
        studentHasAccess ? (
          <Button
            onClick={handleAction}
            disabled={isLoading || isEnrolled}
            className={`${dialogPrimaryBtnClass} gap-2`}
          >
            {isLoading ? (
              "Enrolling…"
            ) : isEnrolled ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Already enrolled
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {course.progress ? "Continue learning" : "Enroll now"}
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => onAddToPlan?.(course._id)}
            disabled={isLoading}
            className={`${dialogPrimaryBtnClass} gap-2`}
          >
            {isLoading ? (
              "Adding…"
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to plan
              </>
            )}
          </Button>
        )
      ) : shouldShowAddToPlan && !userHasSameCourse ? (
        <Button
          onClick={handleAction}
          disabled={isLoading}
          className={`${dialogPrimaryBtnClass} gap-2`}
        >
          {isLoading ? (
            "Adding…"
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to plan
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="outline"
          disabled
          className={`${dialogSecondaryBtnClass} gap-2`}
        >
          <CheckCircle className="h-4 w-4" />
          Already in plan
        </Button>
      )}
    </div>
  );
}