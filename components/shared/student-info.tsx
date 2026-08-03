"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, GraduationCap, User } from "lucide-react";
import { format } from "date-fns";
import { formatGradeLabel } from "@/lib/utils";
import type { IStudentWithUserData } from "@/types/enriched-student";

interface StudentInfoProps {
  user: IStudentWithUserData;
}

export function StudentInfo({ user }: StudentInfoProps) {
  const getChildAge = (dateOfBirth?: Date) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
            <AvatarFallback>
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.name || "Unknown Student"}</CardTitle>
            <p className="text-sm text-muted-foreground">Student Profile</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.email || "No email"}</span>
          </div>

          {user.dateOfBirth && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Age {getChildAge(user.dateOfBirth ? new Date(user.dateOfBirth) : undefined)}
              </span>
            </div>
          )}

          {user.grade && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatGradeLabel(user.grade)}</span>
            </div>
          )}

          {user.gender && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm capitalize">{user.gender}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <p className="text-sm font-medium">Subscription</p>
            <Badge
              variant={user.subscription === "pro" ? "default" : "secondary"}
              className="capitalize"
            >
              {user.subscription || "Free"}
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <p className="text-sm font-medium">Learning Stats</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Courses</p>
                <p className="font-medium">{user.enrolledCourses.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Streak</p>
                <p className="font-medium">{user.codingStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        {user.goals && user.goals.length > 0 && (
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Goals</p>
              <div className="space-y-1">
                {user.goals.slice(0, 3).map((goal, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    • {goal}
                  </p>
                ))}
                {user.goals.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{user.goals.length - 3} more goals
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <p className="text-sm font-medium">Member Since</p>
            <p className="text-sm text-muted-foreground">
              {format(user.createdAt, "MMMM yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
