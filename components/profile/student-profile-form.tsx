"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  Phone,
  Calendar,
  Target,
} from "lucide-react";
import type { IUser } from "@/lib/api/user";
import { updateAccount, useSession } from "@/lib/auth-client";
import { studentApi } from "@/lib/api/student";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface StudentProfileFormProps {
  userData: IUser;
  /** Emphasize gender / date of birth when opened from the completion notice. */
  highlightPersonal?: boolean;
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function StudentProfileForm({
  userData,
  highlightPersonal = false,
}: StudentProfileFormProps) {
  const { refetch: refetchSession } = useSession();
  const queryClient = useQueryClient();
  const personalRef = useRef<HTMLDivElement>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userForm, setUserForm] = useState({
    name: userData.name || "",
    email: userData.email || "",
  });
  const [studentForm, setStudentForm] = useState({
    grade: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const studentData = await studentApi.getStudentByUserId(userData._id);

        setStudentForm({
          grade: studentData.grade?.toString() || "",
          dateOfBirth: toDateInputValue(studentData.dateOfBirth),
          gender: studentData.gender || "",
          emergencyContact: {
            name: studentData.emergencyContact?.name || "",
            relationship: studentData.emergencyContact?.relationship || "",
            phone: studentData.emergencyContact?.phone || "",
          },
        });
      } catch (error) {
        console.warn("Failed to load student data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadStudentData();
  }, [userData._id]);

  useEffect(() => {
    if (!highlightPersonal || isLoadingData) return;
    const id = window.setTimeout(() => {
      personalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [highlightPersonal, isLoadingData]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);

    try {
      const { error } = await updateAccount({ name: userForm.name });
      if (error) {
        toast.error(error.message ?? "Failed to update profile");
        return;
      }
      await refetchSession();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUserLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentLoading(true);

    try {
      const requiredFields = {
        grade: studentForm.grade,
        dateOfBirth: studentForm.dateOfBirth,
        gender: studentForm.gender,
        "emergencyContact.name": studentForm.emergencyContact.name,
        "emergencyContact.relationship":
          studentForm.emergencyContact.relationship,
        "emergencyContact.phone": studentForm.emergencyContact.phone,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || value.trim() === "")
        .map(([field]) => field);

      if (missingFields.length > 0) {
        toast.error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        setStudentLoading(false);
        return;
      }

      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(studentForm.gender)) {
        toast.error("Please select a valid gender");
        setStudentLoading(false);
        return;
      }

      const gradeNum = parseInt(studentForm.grade);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 13) {
        toast.error("Please select a valid grade");
        setStudentLoading(false);
        return;
      }

      const studentData = await studentApi.getStudentByUserId(userData._id);
      await studentApi.updateStudent(studentData._id, {
        grade: parseInt(studentForm.grade) || 0,
        gender: studentForm.gender as "male" | "female" | "other" | undefined,
        dateOfBirth: studentForm.dateOfBirth,
        emergencyContact: studentForm.emergencyContact,
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.students.byUserId(userData._id),
      });

      toast.success("Student information updated successfully!");
    } catch (error) {
      console.error("Failed to update student:", error);
      toast.error("Failed to update student information");
    } finally {
      setStudentLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border/40 bg-muted/20 py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">
            Loading student information…
          </p>
        </div>
      </div>
    );
  }

  const missingPersonal =
    !studentForm.dateOfBirth?.trim() || !studentForm.gender?.trim();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Account
            </h3>
            <p className="text-sm text-muted-foreground">
              Basic details for your BeBlocky account
            </p>
          </div>
        </div>

        <form
          onSubmit={handleUserSubmit}
          className="rounded-2xl border border-border/40 bg-card/40 p-5 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                placeholder="Enter your full name"
                className="h-11 rounded-xl border-border/40 bg-background/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                disabled
                className="h-11 rounded-xl border-border/40 bg-muted/30"
              />
              <p className="text-xs text-muted-foreground">
                Email is managed by your sign-in provider
              </p>
            </div>
          </div>
          <Button
            type="submit"
            disabled={userLoading}
            className="mt-5 h-10 rounded-full px-5 text-xs font-bold"
          >
            {userLoading ? "Saving…" : "Save account"}
          </Button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
            <GraduationCap className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Student information
            </h3>
            <p className="text-sm text-muted-foreground">
              Academic and personal details used across BeBlocky
            </p>
          </div>
        </div>

        <form
          onSubmit={handleStudentSubmit}
          className="space-y-5 rounded-2xl border border-border/40 bg-card/40 p-5 sm:p-6"
        >
          <div
            ref={personalRef}
            id="profile-personal-details"
            className={cn(
              "space-y-3 rounded-xl p-4 transition-colors",
              (highlightPersonal || missingPersonal) &&
                "border border-amber-500/30 bg-amber-500/5"
            )}
          >
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Personal details
              {missingPersonal && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Required
                </span>
              )}
            </h4>
            {(highlightPersonal || missingPersonal) && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Date of birth and gender are required to continue using BeBlocky
                fully.
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={studentForm.dateOfBirth}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl border-border/40 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={studentForm.gender}
                  onValueChange={(value) =>
                    setStudentForm({ ...studentForm, gender: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-border/40 bg-background/60">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-muted-foreground" />
              Academic details
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grade">
                  Grade level <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={studentForm.grade}
                  onValueChange={(value) =>
                    setStudentForm({ ...studentForm, grade: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-border/40 bg-background/60">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Grade {grade}
                        </SelectItem>
                      )
                    )}
                    <SelectItem value="13">Above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Emergency contact
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">
                  Contact name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyName"
                  value={studentForm.emergencyContact.name}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      emergencyContact: {
                        ...studentForm.emergencyContact,
                        name: e.target.value,
                      },
                    })
                  }
                  placeholder="Full name"
                  className="h-11 rounded-xl border-border/40 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelationship">
                  Relationship <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyRelationship"
                  value={studentForm.emergencyContact.relationship}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      emergencyContact: {
                        ...studentForm.emergencyContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Parent, Guardian"
                  className="h-11 rounded-xl border-border/40 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">
                  Phone number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyPhone"
                  value={studentForm.emergencyContact.phone}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      emergencyContact: {
                        ...studentForm.emergencyContact,
                        phone: e.target.value,
                      },
                    })
                  }
                  placeholder="Phone number"
                  className="h-11 rounded-xl border-border/40 bg-background/60"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={studentLoading}
            className="h-10 rounded-full px-5 text-xs font-bold"
          >
            {studentLoading ? "Saving…" : "Save student information"}
          </Button>
        </form>
      </section>
    </div>
  );
}
