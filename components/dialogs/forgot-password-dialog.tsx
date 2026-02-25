"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Clock,
  Shield,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { forgetPassword } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ForgotPasswordDialogProps {
  trigger?: React.ReactNode;
  onResetRequest?: (email: string) => Promise<void>;
}

type DialogState = "initial" | "loading" | "success" | "error";

export function ForgotPasswordDialog({
  trigger,
  onResetRequest,
}: ForgotPasswordDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dialogState, setDialogState] = useState<DialogState>("initial");
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
    if (dialogState === "error") {
      setDialogState("initial");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setDialogState("loading");
      setEmailError("");

      // Prefer provided handler; otherwise call Better Auth requestPasswordReset
      if (onResetRequest) {
        await onResetRequest(email);
      } else {
        const { data, error } = await forgetPassword({
          email,
          redirectTo: "/sign-in",
        } as any);

        if (error) {
          // Handle specific authentication errors with toast
          const errorMessage = (error as { message?: string }).message ?? "Failed to send reset email";

          if (
            errorMessage.includes("Invalid email") ||
            errorMessage.includes("invalid email")
          ) {
            toast.error("Please enter a valid email address");
          } else if (
            errorMessage.includes("User not found") ||
            errorMessage.includes("user not found")
          ) {
            toast.error("No account found with this email address.");
          } else if (
            errorMessage.includes("Email not verified") ||
            errorMessage.includes("email not verified")
          ) {
            toast.error("Please verify your email address first.");
          } else {
            toast.error(errorMessage);
          }

          throw new Error(errorMessage);
        }
      }

      setDialogState("success");
      startCountdown();
      // Redirect to reset page as requested
      setTimeout(() => {
        router.push("/sign-in");
      }, 800);
    } catch (error) {
      console.error("Password reset failed:", error);
      setDialogState("error");

      // Don't set email error if we already handled it with toast
      if (error instanceof Error && !error.message.includes("Invalid email")) {
        setEmailError("Failed to send reset email. Please try again.");
      }
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    if (countdown === 0) {
      handleSubmit(new Event("submit") as any);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after animation completes
    setTimeout(() => {
      setEmail("");
      setEmailError("");
      setDialogState("initial");
      setCountdown(0);
    }, 300);
  };

  const handleBackToLogin = () => {
    setDialogState("initial");
    setEmail("");
    setEmailError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Initial State */}
          {dialogState === "initial" && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  className="inline-flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <div className="p-3 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                    <Mail className="h-6 w-6" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
                <p className="text-muted-foreground">
                  No worries! Enter your email address and we'll send you a
                  reset link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`pl-10 h-12 transition-all duration-200 ${
                        emailError
                          ? "border-destructive ring-destructive/20"
                          : "focus:ring-primary/20"
                      }`}
                      required
                    />
                    {email && validateEmail(email) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive flex items-center gap-2"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold gap-2"
                  disabled={!email.trim()}
                >
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-sm text-muted-foreground"
                >
                  Back to Login
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {dialogState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="text-center">
                <motion.div
                  className="inline-flex items-center justify-center mb-6"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                    <RefreshCw className="h-8 w-8" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-semibold mb-2">
                  Sending Reset Link
                </h3>
                <p className="text-muted-foreground mb-6">
                  We're sending a password reset link to{" "}
                  <strong>{email}</strong>
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <span>Processing your request...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {dialogState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="text-center">
                <motion.div
                  className="inline-flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-semibold mb-2">
                  Check Your Email!
                </h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>

                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800 mb-6">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Link expires in 15 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Check your spam folder if you don't see it</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span>The link can only be used once</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="w-full gap-2 bg-transparent"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Email"}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleBackToLogin}
                    className="w-full gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {dialogState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="text-center">
                <motion.div
                  className="inline-flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <div className="p-4 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-semibold mb-2">
                  Something Went Wrong
                </h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't send the reset email. Please check your email
                  address and try again.
                </p>

                <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 mb-6">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {emailError}
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Button onClick={handleBackToLogin} className="w-full gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="w-full gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
