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
import { toast } from "sonner";
import { User, Users, Phone, MapPin, Heart } from "lucide-react";
import type { IUser } from "@/lib/api/user";
import type { IParent } from "@/lib/api/parent";
import { updateAccount } from "@/lib/auth-client";
import { parentApi } from "@/lib/api/parent";
import { useEffect } from "react";

interface ParentProfileFormProps {
  userData: IUser;
}

export function ParentProfileForm({ userData }: ParentProfileFormProps) {
  const [userLoading, setUserLoading] = useState(false);
  const [parentLoading, setParentLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userForm, setUserForm] = useState({
    name: userData.name || "",
    email: userData.email || "",
  });
  const [parentForm, setParentForm] = useState({
    relationship: "",
    phoneNumber: "",
    address: {
      subCity: "",
      city: "",
      country: "",
    },
  });

  // Load existing parent data
  useEffect(() => {
    const loadParentData = async () => {
      try {
        const parentData = await parentApi.getParentByUserId(userData._id);

        setParentForm({
          relationship: parentData.relationship || "",
          phoneNumber: parentData.phoneNumber || "",
          address: {
            subCity: parentData.address?.subCity || "",
            city: parentData.address?.city || "",
            country: parentData.address?.country || "",
          },
        });
      } catch (error) {
        console.warn("Failed to load parent data:", error);
        // Keep default empty values if no parent data exists
      } finally {
        setIsLoadingData(false);
      }
    };

    loadParentData();
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
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUserLoading(false);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentLoading(true);

    try {
      // Validate required fields
      const requiredFields = {
        relationship: parentForm.relationship,
        phoneNumber: parentForm.phoneNumber,
        "address.subCity": parentForm.address.subCity,
        "address.city": parentForm.address.city,
        "address.country": parentForm.address.country,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || value.trim() === "")
        .map(([field]) => field);

      if (missingFields.length > 0) {
        toast.error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        setParentLoading(false);
        return;
      }

      // Validate relationship value
      const validRelationships = ["mother", "father", "guardian", "other"];
      if (!validRelationships.includes(parentForm.relationship)) {
        toast.error("Please select a valid relationship");
        setParentLoading(false);
        return;
      }

      // Get parent data first to get the parent ID
      const parentData = await parentApi.getParentByUserId(userData._id);
      // Update parent information using the parent API
      await parentApi.updateParent(parentData._id, parentForm as any);
      toast.success("Parent information updated successfully!");
    } catch (error) {
      console.error("Failed to update parent:", error);
      toast.error("Failed to update parent information");
    } finally {
      setParentLoading(false);
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
                Loading parent information...
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

      {/* Parent Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Parent Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your family and contact details
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleParentSubmit} className="space-y-6">
            {/* Family Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Family Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="relationship">
                    Relationship to Children{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={parentForm.relationship}
                    onValueChange={(value) =>
                      setParentForm({ ...parentForm, relationship: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={parentForm.phoneNumber}
                    onChange={(e) =>
                      setParentForm({
                        ...parentForm,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subCity">
                    Sub City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subCity"
                    value={parentForm.address.subCity}
                    onChange={(e) =>
                      setParentForm({
                        ...parentForm,
                        address: {
                          ...parentForm.address,
                          subCity: e.target.value,
                        },
                      })
                    }
                    placeholder="Sub city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={parentForm.address.city}
                    onChange={(e) =>
                      setParentForm({
                        ...parentForm,
                        address: {
                          ...parentForm.address,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    value={parentForm.address.country}
                    onChange={(e) =>
                      setParentForm({
                        ...parentForm,
                        address: {
                          ...parentForm.address,
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={parentLoading} className="w-full">
              {parentLoading ? "Updating..." : "Update Parent Information"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
