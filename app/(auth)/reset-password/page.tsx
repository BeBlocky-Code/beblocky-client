"use client";

import type React from "react";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { resetPassword } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid:
        minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidation = validatePassword(password);
    const newErrors: {
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!passwordValidation.isValid) {
      newErrors.password = "Password doesn't meet requirements";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        if (!token) throw new Error("Invalid or missing token");
        const { data, error } = await resetPassword({
          newPassword: password,
          token: token as string,
        } as any);
        if (error) throw new Error((error as { message?: string }).message ?? "Failed to reset password");
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 1200);
      } catch (error) {
        console.error("Password reset error:", error);
        setErrors({
          general:
            error instanceof Error
              ? error.message
              : "Failed to reset password. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    router.push("/sign-in");
  };

  const passwordValidation = validatePassword(password);

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="p-4 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white inline-flex mb-6"
              >
                <AlertCircle className="h-8 w-8" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
              <p className="text-muted-foreground mb-6">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <div className="space-y-3">
                <Button onClick={handleBackToLogin} className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/sign-in")}
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white inline-flex mb-6"
              >
                <CheckCircle className="h-8 w-8" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully updated. You can now log in
                with your new password.
              </p>
              <div className="space-y-3">
                <Button onClick={handleBackToLogin} className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Continue to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Reset Password
                </h1>
                <Badge variant="secondary" className="mt-1 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              Create a new secure password for your account
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* General Error */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {errors.general}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                      errors.password
                        ? "border-destructive ring-destructive/20"
                        : "focus:ring-primary/20"
                    }`}
                    placeholder="Enter new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password Requirements */}
                <AnimatePresence>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 p-3 bg-muted/50 rounded-lg border"
                    >
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          { key: "minLength", label: "At least 8 characters" },
                          {
                            key: "hasUpperCase",
                            label: "One uppercase letter",
                          },
                          {
                            key: "hasLowerCase",
                            label: "One lowercase letter",
                          },
                          { key: "hasNumbers", label: "One number" },
                          {
                            key: "hasSpecialChar",
                            label: "One special character",
                          },
                        ].map(({ key, label }) => (
                          <motion.div
                            key={key}
                            className="flex items-center gap-2 text-xs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div
                              className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                                passwordValidation[
                                  key as keyof typeof passwordValidation
                                ]
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span
                              className={`transition-colors duration-200 ${
                                passwordValidation[
                                  key as keyof typeof passwordValidation
                                ]
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {label}
                            </span>
                            {passwordValidation[
                              key as keyof typeof passwordValidation
                            ] && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-destructive flex items-center gap-2"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-destructive ring-destructive/20"
                        : "focus:ring-primary/20"
                    }`}
                    placeholder="Confirm new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password Match Indicator */}
                <AnimatePresence>
                  {confirmPassword && password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-center gap-2 text-xs ${
                        password === confirmPassword
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          <span>Passwords don't match</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-destructive flex items-center gap-2"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gap-2 mt-6"
                disabled={
                  isLoading ||
                  !passwordValidation.isValid ||
                  password !== confirmPassword ||
                  !password ||
                  !confirmPassword
                }
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleBackToLogin}
                className="text-sm text-muted-foreground hover:text-primary gap-2"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
