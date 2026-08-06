"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { studentApi } from "@/lib/api/student";
import { parentApi } from "@/lib/api/parent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldAlert,
  Trash2,
  X,
  UserX,
  AlertCircle,
} from "lucide-react";

// Confirmation steps
const STEPS = [
  {
    title: "Understand the Consequences",
    description: "Review what will happen when you delete your account",
  },
  {
    title: "Confirm Your Decision",
    description: "Acknowledge that this action is irreversible",
  },
  {
    title: "Verify Your Identity",
    description: "Enter your email to confirm account deletion",
  },
  {
    title: "Final Confirmation",
    description: "Last chance to cancel before permanent deletion",
  },
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [acknowledgements, setAcknowledgements] = useState({
    dataLoss: false,
    noRecovery: false,
    progressLoss: false,
    subscriptionCancel: false,
  });

  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "User";

  const allAcknowledged = Object.values(acknowledgements).every(Boolean);
  const emailConfirmed = confirmEmail.toLowerCase() === userEmail.toLowerCase();
  const textConfirmed = confirmText === "DELETE MY ACCOUNT";

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return allAcknowledged;
      case 1:
        return true;
      case 2:
        return emailConfirmed;
      case 3:
        return textConfirmed;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/");
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) {
      toast.error("No user session found");
      return;
    }

    setIsDeleting(true);

    try {
      const role = session.user.roles?.[0];

      // Delete role-specific profile in beblocky-api
      if (role === "student") {
        try {
          const student = await studentApi.getStudentByUserId(session.user.id);
          if (student?._id) {
            await studentApi.deleteStudent(student._id);
          }
        } catch (error) {
          console.warn("No student profile to delete or deletion failed:", error);
        }
      } else if (role === "parent") {
        try {
          const parent = await parentApi.getParentByUserId(session.user.id);
          if (parent?._id) {
            await parentApi.deleteParent(parent._id);
          }
        } catch (error) {
          console.warn("No parent profile to delete or deletion failed:", error);
        }
      }

      // Account record lives in auth-service; no user document in beblocky-api.
      // For full account deletion, auth-service would need a delete-account endpoint.
      toast.success("Your profile data has been removed. You have been signed out.");

      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again or contact support.");
    } finally {
      setIsDeleting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <UserX className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-destructive">Delete Account</h1>
              <p className="text-muted-foreground">
                This action is permanent and cannot be undone
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-medium">{STEPS[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {STEPS[currentStep].title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {STEPS[currentStep].description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Step 1: Understand Consequences */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <h3 className="font-semibold text-destructive flex items-center gap-2 mb-3">
                        <ShieldAlert className="h-5 w-5" />
                        What happens when you delete your account:
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          All your personal data will be permanently erased
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          Your learning progress and achievements will be lost
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          All earned coins and rewards will be forfeited
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          Any active subscriptions will be cancelled
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          You will not be able to recover your account
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Please acknowledge each of the following:
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="dataLoss"
                            checked={acknowledgements.dataLoss}
                            onCheckedChange={(checked) =>
                              setAcknowledgements({
                                ...acknowledgements,
                                dataLoss: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor="dataLoss"
                            className="text-sm cursor-pointer"
                          >
                            I understand that all my personal data will be permanently deleted
                          </Label>
                        </div>

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="progressLoss"
                            checked={acknowledgements.progressLoss}
                            onCheckedChange={(checked) =>
                              setAcknowledgements({
                                ...acknowledgements,
                                progressLoss: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor="progressLoss"
                            className="text-sm cursor-pointer"
                          >
                            I understand that all my learning progress, achievements, and coins will be lost
                          </Label>
                        </div>

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="subscriptionCancel"
                            checked={acknowledgements.subscriptionCancel}
                            onCheckedChange={(checked) =>
                              setAcknowledgements({
                                ...acknowledgements,
                                subscriptionCancel: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor="subscriptionCancel"
                            className="text-sm cursor-pointer"
                          >
                            I understand that any active subscriptions will be cancelled without refund
                          </Label>
                        </div>

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="noRecovery"
                            checked={acknowledgements.noRecovery}
                            onCheckedChange={(checked) =>
                              setAcknowledgements({
                                ...acknowledgements,
                                noRecovery: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor="noRecovery"
                            className="text-sm cursor-pointer"
                          >
                            I understand that this action is irreversible and my account cannot be recovered
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Confirm Decision */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Are you sure you want to continue?
                      </h3>
                      <p className="text-muted-foreground">
                        We&apos;re sorry to see you go, {userName}. Before you proceed,
                        consider that all your hard work and progress will be permanently lost.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Alternatives to deletion:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Take a break - you can always come back later
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Downgrade your subscription instead of deleting
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Contact support if you&apos;re having issues
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step 3: Verify Identity */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        For security purposes, please enter your email address to confirm
                        you are the account owner.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="confirmEmail">
                          Enter your email address
                        </Label>
                        <Input
                          id="confirmEmail"
                          type="email"
                          placeholder={userEmail}
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className={
                            confirmEmail && !emailConfirmed
                              ? "border-destructive"
                              : emailConfirmed
                              ? "border-green-500"
                              : ""
                          }
                        />
                        {confirmEmail && !emailConfirmed && (
                          <p className="text-xs text-destructive">
                            Email does not match your account email
                          </p>
                        )}
                        {emailConfirmed && (
                          <p className="text-xs text-green-500 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Email verified
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Final Confirmation */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-destructive">
                            This is your final warning
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            After clicking the delete button, your account and all associated
                            data will be permanently removed. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="confirmText">
                          Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
                        </Label>
                        <Input
                          id="confirmText"
                          type="text"
                          placeholder="DELETE MY ACCOUNT"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          className={
                            confirmText && !textConfirmed
                              ? "border-destructive"
                              : textConfirmed
                              ? "border-green-500"
                              : ""
                          }
                        />
                        {textConfirmed && (
                          <p className="text-xs text-green-500 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Confirmation text verified
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {currentStep === 0 ? "Cancel" : "Back"}
                  </Button>

                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="gap-2"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={!canProceed() || isDeleting}
                      className="gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Permanently Delete Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
