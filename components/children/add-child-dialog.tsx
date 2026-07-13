"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { parentApi } from "@/lib/api/parent";
import type { IAddChildDto } from "@/lib/api/children";
import { useSession } from "@/lib/auth-client";

type AddChildMode = "create" | "link";

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  onSuccess?: () => void;
}

function generateTempPassword(): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const emptyForm = (): IAddChildDto => ({
  email: "",
  grade: 1,
  createAccount: true,
  name: "",
  password: "",
  dateOfBirth: "",
  gender: undefined,
});

export function AddChildDialog({
  open,
  onOpenChange,
  parentId,
  onSuccess,
}: AddChildDialogProps) {
  const { data: session } = useSession();
  const [mode, setMode] = useState<AddChildMode>("create");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IAddChildDto>(emptyForm());

  const handleModeChange = (nextMode: AddChildMode) => {
    setMode(nextMode);
    setFormData((prev) => ({
      ...prev,
      createAccount: nextMode === "create",
      ...(nextMode === "link" ? { name: "", password: "" } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let actualParentId = parentId;

    if (!actualParentId && session?.user?.id) {
      try {
        const parentData = await parentApi.getParentByUserId(session.user.id);
        actualParentId = parentData._id;
      } catch (error) {
        console.error("Failed to fetch parent data:", error);
        toast.error("Failed to fetch parent information. Please try again.");
        return;
      }
    }

    if (!actualParentId) {
      toast.error("Parent information not found. Please try again.");
      return;
    }

    if (!formData.email) {
      toast.error("Please enter your child's email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (mode === "create") {
      if (!formData.name?.trim()) {
        toast.error("Please enter your child's name.");
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
    }

    const payload: IAddChildDto = {
      email: formData.email.trim(),
      grade: formData.grade,
      createAccount: mode === "create",
      ...(mode === "create" && {
        name: formData.name?.trim(),
        password: formData.password,
      }),
      ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
      ...(formData.gender && { gender: formData.gender }),
    };

    setLoading(true);
    try {
      await parentApi.addChildToParent(actualParentId, payload);

      toast.success(
        mode === "create"
          ? "Child account created and linked successfully!"
          : "Child linked successfully!"
      );
      onOpenChange(false);
      onSuccess?.();
      setFormData(emptyForm());
      setMode("create");
    } catch (error) {
      console.error("Failed to add child:", error);

      let errorMessage = "Failed to add child. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          errorMessage =
            "An account with this email already exists. Try linking instead.";
        } else if (error.message.includes("404")) {
          errorMessage =
            mode === "link"
              ? "No account found for this email. Try creating an account instead."
              : "Parent not found. Please check your account status.";
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Child
          </DialogTitle>
        </DialogHeader>

        <div className="flex rounded-lg border p-1 gap-1">
          <button
            type="button"
            onClick={() => handleModeChange("create")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "create"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("link")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "link"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Link existing
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Create a sign-in account for your child. Date of birth and gender are optional."
              : "Link a child who already has a Beblocky account."}
          </p>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="child@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          {mode === "create" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Child&apos;s Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your child's name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    placeholder="At least 8 characters"
                    value={formData.password || ""}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleInputChange("password", generateTempPassword())
                    }
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this password with your child so they can sign in.
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="grade">
              Grade Level <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.grade.toString()}
              onValueChange={(value) =>
                handleInputChange("grade", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">
                Date of Birth{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) => handleInputChange("gender", value)}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating…" : "Linking…"}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <UserPlus className="mr-2 h-4 w-4" />
                  ) : (
                    <Link2 className="mr-2 h-4 w-4" />
                  )}
                  {mode === "create" ? "Create & link" : "Link child"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
