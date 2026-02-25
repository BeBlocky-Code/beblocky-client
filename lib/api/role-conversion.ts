import { assignRole } from "@/lib/auth-client";
import { studentApi } from "./student";

export interface RoleConversionResult {
  success: boolean;
  message: string;
  parentId?: string;
}

/**
 * Converts from student to parent: deletes student record in API, then assigns parent role
 * in auth-service (which creates the parent record in beblocky-api).
 */
export async function convertStudentToParent(
  userId: string
): Promise<RoleConversionResult> {
  try {
    let studentInstance;
    try {
      studentInstance = await studentApi.getStudentByUserId(userId);
    } catch {
      // No student instance, proceed to assign parent role
    }

    if (studentInstance?._id) {
      await studentApi.deleteStudent(studentInstance._id);
    }

    const { error } = await assignRole("parent");
    if (error) {
      return {
        success: false,
        message: error.message ?? "Failed to assign parent role",
      };
    }

    return {
      success: true,
      message: "Successfully converted from student to parent role",
      parentId: undefined,
    };
  } catch (error) {
    console.error("❌ [Role Conversion] Conversion failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Try to provide specific error messages
    let userFriendlyMessage =
      "Failed to convert account role. Please try again.";

    if (errorMessage.includes("404")) {
      userFriendlyMessage = "Account not found. Please contact support.";
    } else if (errorMessage.includes("500")) {
      userFriendlyMessage = "Server error. Please try again later.";
    } else if (
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("401")
    ) {
      userFriendlyMessage = "Authentication failed. Please sign in again.";
    }

    const result: RoleConversionResult = {
      success: false,
      message: userFriendlyMessage,
    };

    return result;
  }
}

/**
 * Handles parent sign-up. Pass currentRole from session (e.g. session.user.roles?.[0]).
 * If already parent, assigns role (idempotent). If student, converts then assigns parent role.
 */
export async function handleParentSignUp(
  userId: string,
  currentRole?: string
): Promise<RoleConversionResult> {
  try {
    const role = (currentRole ?? "").toLowerCase();

    if (role === "parent") {
      const { error } = await assignRole("parent");
      if (error) {
        return { success: false, message: error.message ?? "Failed to assign parent role" };
      }
      return { success: true, message: "Parent profile ready", parentId: undefined };
    }

    if (role === "student") {
      return await convertStudentToParent(userId);
    }

    return {
      success: false,
      message: "Invalid user role. Please contact support.",
    };
  } catch (error) {
    console.error("Parent sign-up failed:", error);
    return {
      success: false,
      message: "Failed to set up parent account. Please try again.",
    };
  }
}

/**
 * API function to call the role conversion endpoint
 * This can be used from the sign-in page or anywhere else in the frontend
 */
export async function callRoleConversionAPI(
  targetRole: "parent" | "student"
): Promise<RoleConversionResult> {
  try {
    console.log(
      "🔄 [Role Conversion API] Calling role conversion endpoint for role:",
      targetRole
    );

    const response = await fetch("/api/role-conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ [Role Conversion API] Failed:", data.error);
      return {
        success: false,
        message: data.error || "Failed to convert role",
      };
    }

    console.log("✅ [Role Conversion API] Success:", data);
    return {
      success: true,
      message: data.message,
      parentId: data.parentId,
    };
  } catch (error) {
    console.error("❌ [Role Conversion API] Network error:", error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

/**
 * Function to handle role conversion during sign-in
 * This can be called if a user needs to convert their role after signing in
 */
export async function handleSignInRoleConversion(
  userId: string,
  targetRole: "parent" | "student"
): Promise<RoleConversionResult> {
  console.log(
    "🔐 [SignIn Role Conversion] Handling role conversion during sign-in:",
    { userId, targetRole }
  );

  try {
    if (targetRole === "parent") {
      return await handleParentSignUp(userId);
    } else {
      // For student role conversion, we would implement similar logic
      return {
        success: false,
        message: "Student role conversion not implemented yet",
      };
    }
  } catch (error) {
    console.error("❌ [SignIn Role Conversion] Failed:", error);
    return {
      success: false,
      message: "Failed to convert role during sign-in",
    };
  }
}
