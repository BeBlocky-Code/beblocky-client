"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api/user";
import { parentApi } from "@/lib/api/parent";
import { studentApi } from "@/lib/api/student";
import type { IUser } from "@/lib/api/user";
import { StudentProfileForm } from "@/components/profile/student-profile-form";
import { ParentProfileForm } from "@/components/profile/parent-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Loader2, X, Trash2, AlertTriangle } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDeleteAccountClick = () => {
    onOpenChange(false);
    router.push("/delete-account");
  };

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDataResponse = await userApi.getUserById(session.user.id);
      setUserData(userDataResponse);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (open && session?.user?.id) {
      fetchUserData();
    }
  }, [open, session?.user?.id, fetchUserData]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading profile...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!userData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground">
                Unable to load your profile information.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-primary/20 hover:ring-primary/30 transition-all duration-300 hover:scale-105">
                {userData.name?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-md"
                >
                  {userData.role === "student" ? "Student" : "Parent"}
                </Badge>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {userData.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="capitalize font-medium">
                  {userData.role}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {userData.email}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Forms */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {userData.role === "student" ? (
                <StudentProfileForm userData={userData} />
              ) : userData.role === "parent" ? (
                <ParentProfileForm userData={userData} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Profile settings for {userData.role} role are not yet
                    available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone - Delete Account */}
          <Separator className="my-6" />
          
          <Card className="shadow-lg border-destructive/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once you delete your account, there is no going back. All your data, progress, and achievements will be permanently removed.
                  </p>
                  <Button
                    variant="destructive"
                    className="mt-4 gap-2"
                    onClick={handleDeleteAccountClick}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
