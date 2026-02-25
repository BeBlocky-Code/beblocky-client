"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { ChildrenList } from "@/components/children/children-list";
import { AddChildDialog } from "@/components/children/add-child-dialog";
import { ManageCoursesDialog } from "@/components/children/manage-courses-dialog";
import { childrenApi } from "@/lib/api/children";
import { parentApi } from "@/lib/api/parent";
import { courseApi } from "@/lib/api/course";
import { userApi } from "@/lib/api/user";
import { useToast } from "@/hooks/use-toast";
import type { ICourse } from "@/types/course";
import type { IStudent, ICreateStudentDto } from "@/types/student";
import type { IStudentResponse } from "@/lib/api/student";

// Extended type for API responses that include _id
type IStudentWithId = IStudent & { _id: string };

export default function ChildrenPage() {
  const { data: session } = useSession();
  const [children, setChildren] = useState<IStudentWithId[]>([]);
  const [availableCourses, setAvailableCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [manageCoursesDialog, setManageCoursesDialog] = useState<{
    open: boolean;
    child: IStudent | null;
  }>({ open: false, child: null });
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    try {
      setLoading(true);
      // Get the actual parent ID from the session
      const parentData = await parentApi.getParentByUserId(userId);
      const [childrenData, coursesData] = await Promise.all([
        childrenApi.getChildrenByParent(parentData._id),
        courseApi.fetchAllCourses(),
      ]);
      setChildren(childrenData as IStudentWithId[]);
      setAvailableCourses(coursesData);
    } catch (error: unknown) {
      console.error("Children API Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Handle 404 gracefully - no children data available yet
      if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        setChildren([]);
        toast({
          title: "No Children Found",
          description:
            "You haven&apos;t added any children yet. Add your first child to get started.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [session, toast]);

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id, loadData]);

  const handleAddChild = async (data: ICreateStudentDto) => {
    try {
      const newChild = await childrenApi.createChild(data);
      setChildren([...children, newChild as IStudentWithId]);
      setAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Child has been added successfully!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      await childrenApi.deleteChild(childId);
      setChildren(children.filter((child) => child._id !== childId));
      toast({
        title: "Success",
        description: "Child has been removed successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove child. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditChild = (child: IStudent) => {
    // TODO: Implement edit functionality
    console.log("Edit child:", child);
  };

  const handleManageCourses = (child: IStudent) => {
    setManageCoursesDialog({ open: true, child });
  };

  const handleAddCourse = async (childId: string, courseId: string) => {
    try {
      const updatedChild = await childrenApi.addCourseToChild(
        childId,
        courseId
      );
      setChildren(
        children.map((child) =>
          child._id === childId ? (updatedChild as IStudentWithId) : child
        )
      );
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
      const updatedChild = await childrenApi.removeCourseFromChild(
        childId,
        courseId
      );
      setChildren(
        children.map((child) =>
          child._id === childId ? (updatedChild as IStudentWithId) : child
        )
      );
      toast({
        title: "Success",
        description: "Course removed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove course. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading children...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ChildrenList
        studentList={children}
        courses={availableCourses}
        onAddChild={() => setAddDialogOpen(true)}
        onEditChild={handleEditChild}
        onDeleteChild={handleDeleteChild}
        onManageCourses={handleManageCourses}
      />

      <AddChildDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={loadData}
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
