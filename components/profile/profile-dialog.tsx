"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { StudentProfileForm } from "@/components/profile/student-profile-form";
import { ParentProfileForm } from "@/components/profile/parent-profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Scroll/highlight student personal details (gender, DOB). */
  focusSection?: "personal" | "general";
}

export function ProfileDialog({
  open,
  onOpenChange,
  focusSection,
}: ProfileDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleDeleteAccountClick = () => {
    onOpenChange(false);
    router.push("/delete-account");
  };

  const role = session?.user?.roles?.[0] ?? "student";
  const profileUser = session?.user
    ? {
        _id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: role as "student" | "parent" | "teacher",
        emailVerified: true,
        image: session.user.image,
        createdAt: "",
        updatedAt: "",
      }
    : null;

  if (!profileUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-full overflow-y-auto rounded-2xl border-border/40 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
            <DialogDescription>
              Sign in to view and edit your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Profile not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to view your profile.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden rounded-2xl border-border/40 p-0",
          "max-w-[calc(100%-1.5rem)] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl"
        )}
      >
        <DialogHeader className="shrink-0 space-y-4 border-b border-border/40 px-6 py-5 text-left sm:px-8">
          <div className="flex items-start gap-4 pr-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
              {profileUser.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <DialogTitle className="truncate text-2xl font-bold tracking-tight">
                {profileUser.name || "Your profile"}
              </DialogTitle>
              <DialogDescription className="truncate text-sm">
                {profileUser.email}
              </DialogDescription>
              <Badge
                variant="outline"
                className="rounded-full border-border/40 capitalize"
              >
                {profileUser.role === "student" ? "Student" : profileUser.role}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {profileUser.role === "student" ? (
            <StudentProfileForm
              userData={profileUser}
              highlightPersonal={focusSection === "personal"}
            />
          ) : profileUser.role === "parent" ? (
            <ParentProfileForm userData={profileUser} />
          ) : (
            <div className="rounded-2xl border border-border/40 bg-muted/20 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Profile settings for the {profileUser.role} role are not yet
                available.
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-destructive">Danger zone</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deleting your account permanently removes progress,
                  achievements, and course data. This cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4 h-10 rounded-full px-5 text-xs font-bold"
                  onClick={handleDeleteAccountClick}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
