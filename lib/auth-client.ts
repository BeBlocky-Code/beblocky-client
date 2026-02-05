import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
});

export const { signIn, signUp, getSession, signOut, useSession } = authClient;

// Password reset function - calls the better-auth API endpoint
export const forgetPassword = async ({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo?: string;
}): Promise<{ data: any; error: any }> => {
  try {
    const response = await fetch("/api/auth/forget-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, redirectTo }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: { message: "Failed to send reset email" } };
  }
};

// Alias for consistency
export const forgotPassword = forgetPassword;

// Reset password with token
export const resetPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}): Promise<{ data: any; error: any }> => {
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: { message: "Failed to reset password" } };
  }
};
