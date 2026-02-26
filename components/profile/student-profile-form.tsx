"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  Phone,
  MapPin,
  Calendar,
  Target,
} from "lucide-react";
import type { IUser } from "@/lib/api/user";
import type { IStudentResponse } from "@/lib/api/student";
import { updateAccount, useSession } from "@/lib/auth-client";
import { studentApi } from "@/lib/api/student";
import { useEffect } from "react";

interface StudentProfileFormProps {
  userData: IUser;
}

export function StudentProfileForm({ userData }: StudentProfileFormProps) {
  const { refetch: refetchSession } = useSession();
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

  // Load existing student data
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const studentData = await studentApi.getStudentByUserId(userData._id);

        setStudentForm({
          grade: studentData.grade?.toString() || "",
          dateOfBirth: studentData.dateOfBirth || "",
          gender: studentData.gender || "",
          emergencyContact: {
            name: studentData.emergencyContact?.name || "",
            relationship: studentData.emergencyContact?.relationship || "",
            phone: studentData.emergencyContact?.phone || "",
          },
        });
      } catch (error) {
        console.warn("Failed to load student data:", error);
        // Keep default empty values if no student data exists
      } finally {
        setIsLoadingData(false);
      }
    };

    loadStudentData();
  }, [userData._id]);

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
      // Validate required fields for student
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

      // Validate gender value
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(studentForm.gender)) {
        toast.error("Please select a valid gender");
        setStudentLoading(false);
        return;
      }

      // Validate grade (should be 1-12)
      const gradeNum = parseInt(studentForm.grade);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        toast.error("Please select a valid grade (1-12)");
        setStudentLoading(false);
        return;
      }

      // Get student data first to get the student ID
      const studentData = await studentApi.getStudentByUserId(userData._id);
      // Update student information using the student API
      await studentApi.updateStudent(studentData._id, {
        grade: parseInt(studentForm.grade) || 0,
        gender: studentForm.gender as "male" | "female" | "other" | undefined,
        dateOfBirth: studentForm.dateOfBirth,
        emergencyContact: studentForm.emergencyContact,
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
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading student information...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your basic account information
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <Button type="submit" disabled={userLoading} className="w-full">
              {userLoading ? "Updating..." : "Update User Information"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Student Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your academic and personal details
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStudentSubmit} className="space-y-6">
            {/* Academic Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Academic Details
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">
                    Grade Level <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={studentForm.grade}
                    onValueChange={(value) =>
                      setStudentForm({ ...studentForm, grade: value })
                    }
                  >
                    <SelectTrigger>
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth <span className="text-red-500">*</span>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={studentForm.gender}
                    onValueChange={(value) =>
                      setStudentForm({ ...studentForm, gender: value })
                    }
                  >
                    <SelectTrigger>
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

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">
                    Contact Name <span className="text-red-500">*</span>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">
                    Relationship <span className="text-red-500">*</span>
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
                    placeholder="e.g., Parent, Guardian"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">
                    Phone Number <span className="text-red-500">*</span>
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
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={studentLoading} className="w-full">
              {studentLoading ? "Updating..." : "Update Student Information"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
