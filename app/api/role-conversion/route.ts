import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-client";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const { data: session } = await getSession();

    if (session?.user?.id) {
      const user = session.user;
      if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userId = user.id;
      const { targetRole } = await request.json();

      if (!targetRole || !["parent", "student"].includes(targetRole)) {
        return NextResponse.json(
          { error: "Invalid target role. Must be 'parent' or 'student'" },
          { status: 400 }
        );
      }

      console.log("🔄 [API] Role conversion request:", { userId, targetRole });

      // Import the role conversion function
      const { handleParentSignUp } = await import("@/lib/api/role-conversion");

      if (targetRole === "parent") {
        const currentRole = user.roles?.[0];
        const result = await handleParentSignUp(userId, currentRole);

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: result.message,
            parentId: result.parentId,
          });
        } else {
          return NextResponse.json({ error: result.message }, { status: 400 });
        }
      } else {
        // For student role, we would need to implement a similar function
        return NextResponse.json(
          { error: "Student role conversion not implemented yet" },
          { status: 501 }
        );
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("❌ [API] Role conversion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
