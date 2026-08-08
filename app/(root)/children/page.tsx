"use client";

import { useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { ChildrenList } from "@/components/children/children-list";
import { AddChildDialog } from "@/components/children/add-child-dialog";
import { ManageCoursesDialog } from "@/components/children/manage-courses-dialog";
import { childrenApi } from "@/lib/api/children";
import { useToast } from "@/hooks/use-toast";
import { ChildrenPageSkeleton } from "@/components/skeletons";
import {
  useCourses,
  useParentByUserId,
  useParentChildren,
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { IStudent } from "@/types/student";

type IStudentWithId = IStudent & { _id: string };

export default function ChildrenPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const parentQuery = useParentByUserId(userId);
  const parentId = parentQuery.data?._id;
  const childrenQuery = useParentChildren(parentId);
  const coursesQuery = useCourses();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [manageCoursesDialog, setManageCoursesDialog] = useState<{
    open: boolean;
    child: IStudent | null;
  }>({ open: false, child: null });

  const children = (childrenQuery.data ?? []) as IStudentWithId[];
  const availableCourses = coursesQuery.data ?? [];

  const loading =
    sessionPending ||
    parentQuery.isLoading ||
    childrenQuery.isLoading ||
    coursesQuery.isLoading;

  const invalidateChildren = () => {
    if (!parentId) return;
    void queryClient.invalidateQueries({
      queryKey: queryKeys.parents.children(parentId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.parents.detail(parentId),
    });
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      await childrenApi.deleteChild(childId);
      invalidateChildren();
      toast({
        title: "Success",
        description: "Child has been removed.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete child. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditChild = (child: IStudent) => {
    console.log("Edit child:", child);
  };

  const handleManageCourses = (child: IStudent) => {
    setManageCoursesDialog({ open: true, child });
  };

  const handleAddCourse = async (childId: string, courseId: string) => {
    try {
      await childrenApi.addCourseToChild(childId, courseId);
      invalidateChildren();
      toast({
        title: "Success",
        description: "Course added successfully!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCourse = async (childId: string, courseId: string) => {
    try {
      await childrenApi.removeCourseFromChild(childId, courseId);
      invalidateChildren();
      toast({
        title: "Success",
        description: "Course removed successfully!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const parentNotFound = useMemo(
    () =>
      parentQuery.isError &&
      String(parentQuery.error).toLowerCase().includes("404"),
    [parentQuery.error, parentQuery.isError]
  );

  if (loading) {
    return <ChildrenPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-6">
      <ChildrenList
        studentList={parentNotFound ? [] : children}
        courses={availableCourses}
        onAddChild={() => setAddDialogOpen(true)}
        onEditChild={handleEditChild}
        onDeleteChild={handleDeleteChild}
        onManageCourses={handleManageCourses}
      />

      <AddChildDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        parentId={parentId}
        onSuccess={invalidateChildren}
      />

      <ManageCoursesDialog
        open={manageCoursesDialog.open}
        onOpenChange={(open) => setManageCoursesDialog({ open, child: null })}
        child={manageCoursesDialog.child}
        availableCourses={availableCourses}
        onAddCourse={handleAddCourse}
        onRemoveCourse={handleRemoveCourse}
      />
    </div>
  );
}
