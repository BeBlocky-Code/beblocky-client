"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useStudentByUserId } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, UserRound } from "lucide-react";
import { ProfileDialog } from "@/components/profile/profile-dialog";

const SNOOZE_KEY = "beblocky:profile-complete-snoozed";

function isMissingField(value?: string | null) {
  return !value || String(value).trim() === "";
}

export function IncompleteProfileNotice() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.roles?.[0];
  const isStudent = role === "student";

  const { data: student, isLoading, isError, refetch } = useStudentByUserId(
    userId,
    !!userId && isStudent
  );

  const [snoozed, setSnoozed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  useEffect(() => {
    try {
      setSnoozed(sessionStorage.getItem(SNOOZE_KEY) === "1");
    } catch {
      setSnoozed(false);
    }
  }, []);

  const missing = useMemo(() => {
    if (!student) return { gender: false, dateOfBirth: false };
    return {
      gender: isMissingField(student.gender),
      dateOfBirth: isMissingField(student.dateOfBirth),
    };
  }, [student]);

  const needsCompletion = missing.gender || missing.dateOfBirth;

  useEffect(() => {
    if (isPending || isLoading || isError || !isStudent || !student) {
      setNoticeOpen(false);
      return;
    }
    if (needsCompletion && !snoozed && !profileOpen) {
      setNoticeOpen(true);
    } else if (!needsCompletion) {
      setNoticeOpen(false);
      try {
        sessionStorage.removeItem(SNOOZE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [
    isPending,
    isLoading,
    isError,
    isStudent,
    student,
    needsCompletion,
    snoozed,
    profileOpen,
  ]);

  const handleComplete = () => {
    setNoticeOpen(false);
    setProfileOpen(true);
  };

  const handleSnooze = () => {
    try {
      sessionStorage.setItem(SNOOZE_KEY, "1");
    } catch {
      /* ignore */
    }
    setSnoozed(true);
    setNoticeOpen(false);
  };

  const handleProfileOpenChange = (open: boolean) => {
    setProfileOpen(open);
    if (!open) {
      void refetch().then((result) => {
        const next = result.data;
        const stillMissing =
          isMissingField(next?.gender) || isMissingField(next?.dateOfBirth);
        if (stillMissing && !snoozed) {
          setNoticeOpen(true);
        }
      });
    }
  };

  if (!isStudent) return null;

  return (
    <>
      <Dialog
        open={noticeOpen}
        onOpenChange={(open) => {
          // Block dismiss via overlay/escape — only Complete or Later.
          if (!open) return;
          setNoticeOpen(true);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md rounded-2xl border-border/40"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-3 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Complete your profile
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              We need a few details to personalize your learning experience and
              keep your account accurate. Please add the missing information
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-xl border border-border/40 bg-muted/30 p-4">
            {missing.dateOfBirth && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="font-medium">Date of birth</span>
                  <span className="text-muted-foreground"> — required</span>
                </span>
              </div>
            )}
            {missing.gender && (
              <div className="flex items-center gap-3 text-sm">
                <UserRound className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="font-medium">Gender</span>
                  <span className="text-muted-foreground"> — required</span>
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="h-11 w-full rounded-full text-sm font-bold"
              onClick={handleComplete}
            >
              Complete profile
            </Button>
            <Button
              variant="ghost"
              className="h-10 w-full rounded-full text-sm text-muted-foreground"
              onClick={handleSnooze}
            >
              Remind me later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={handleProfileOpenChange}
        focusSection="personal"
      />
    </>
  );
}
