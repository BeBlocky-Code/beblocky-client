import { CourseSubscriptionType } from "@/types/course";
import { SubscriptionPlan } from "@/types/subscription";

// Define the subscription hierarchy (lower index = lower tier)
const subscriptionHierarchy = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.STARTER]: 1,
  [SubscriptionPlan.BUILDER]: 2,
  [SubscriptionPlan.PRO_BUNDLE]: 3,
  [SubscriptionPlan.ORGANIZATION]: 4,
};

// Map CourseSubscriptionType to SubscriptionPlan for comparison
const courseToSubscriptionMap = {
  [CourseSubscriptionType.FREE]: SubscriptionPlan.FREE,
  [CourseSubscriptionType.STARTER]: SubscriptionPlan.STARTER,
  [CourseSubscriptionType.BUILDER]: SubscriptionPlan.BUILDER,
  [CourseSubscriptionType.PRO]: SubscriptionPlan.PRO_BUNDLE,
  [CourseSubscriptionType.ORGANIZATION]: SubscriptionPlan.ORGANIZATION,
};

/**
 * Check if a user can access a course based on their subscription plan
 * @param userPlan - The user's current subscription plan
 * @param coursePlan - The course's required subscription plan
 * @returns boolean - Whether the user can access the course
 */
export function canAccessCourse(
  userPlan: SubscriptionPlan | null,
  coursePlan: CourseSubscriptionType
): boolean {
  // If user has no subscription, they can only access free courses
  if (!userPlan || userPlan === SubscriptionPlan.FREE) {
    return coursePlan === CourseSubscriptionType.FREE;
  }

  const userPlanLevel = subscriptionHierarchy[userPlan] || 0;
  const coursePlanLevel =
    subscriptionHierarchy[courseToSubscriptionMap[coursePlan]] || 0;

  // User can access courses at their level and below
  return userPlanLevel >= coursePlanLevel;
}

/**
 * Filter courses based on user's subscription plan
 * @param courses - Array of courses to filter
 * @param userPlan - The user's current subscription plan
 * @returns Array of courses the user can access
 */
export function filterCoursesBySubscription<
  T extends { subType: CourseSubscriptionType },
>(courses: T[], userPlan: SubscriptionPlan | null): T[] {
  return courses.filter((course) => canAccessCourse(userPlan, course.subType));
}

/**
 * Get the user's current plan as a string
 * @param subscription - The user's subscription object
 * @returns string - The current plan name
 */
export function getCurrentPlanName(subscription: any): string {
  if (!isEffectiveEntitlement(subscription)) {
    return "Free";
  }
  return subscription.planName || "Free";
}

/**
 * A plan only grants access while it is active *and* inside its paid period.
 * Checking the end date here means a missed expiry run cannot leak access.
 */
export function isEffectiveEntitlement(
  subscription?: { status?: string; endDate?: string | Date } | null
): boolean {
  if (!subscription || subscription.status !== "active") return false;
  if (!subscription.endDate) return false;
  return new Date(subscription.endDate).getTime() > Date.now();
}

/**
 * Get accessible course types for a given subscription plan
 * @param userPlan - The user's current subscription plan
 * @returns Array of CourseSubscriptionType that the user can access
 */
export function getAccessibleCourseTypes(
  userPlan: SubscriptionPlan | null
): CourseSubscriptionType[] {
  if (!userPlan || userPlan === SubscriptionPlan.FREE) {
    return [CourseSubscriptionType.FREE];
  }

  const userPlanLevel = subscriptionHierarchy[userPlan] || 0;

  return Object.entries(courseToSubscriptionMap)
    .filter(([_, subscriptionPlan]) => {
      const coursePlanLevel = subscriptionHierarchy[subscriptionPlan] || 0;
      return userPlanLevel >= coursePlanLevel;
    })
    .map(([courseType, _]) => courseType as CourseSubscriptionType);
}

// ----- New shared helpers for UI plan IDs -----

// Map backend plan names to lowercase UI plan IDs
export function mapPlanNameToId(
  planName?: string | null
): "free" | "starter" | "builder" | "pro" | "organization" {
  const normalized = (planName || "Free").toLowerCase();
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("builder")) return "builder";
  if (normalized.includes("starter")) return "starter";
  if (normalized.includes("org")) return "organization";
  return "free";
}

// Get current plan ID from subscription object (safe)
export function getCurrentPlanIdFromSubscription(
  subscription?:
    | { status?: string; planName?: string; endDate?: string | Date }
    | null
): "free" | "starter" | "builder" | "pro" | "organization" {
  if (!isEffectiveEntitlement(subscription)) return "free";
  return mapPlanNameToId(subscription?.planName);
}

// Compare UI plan IDs by rank (returns positive if a > b)
export function comparePlanIds(
  a: "free" | "starter" | "builder" | "pro" | "organization",
  b: "free" | "starter" | "builder" | "pro" | "organization"
): number {
  const order = ["free", "starter", "builder", "pro", "organization"];
  return order.indexOf(a) - order.indexOf(b);
}
