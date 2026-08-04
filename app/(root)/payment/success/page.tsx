import { redirect } from "next/navigation";

/**
 * Legacy redirect target. It used to claim a subscription was active based on
 * query parameters alone; activation is now confirmed against the API on
 * `/upgrade/success`, so old bookmarks and gateway URLs land there instead.
 */
export default async function LegacyPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paymentId =
    typeof params.paymentId === "string" ? params.paymentId : undefined;

  redirect(paymentId ? `/upgrade/success?paymentId=${paymentId}` : "/upgrade");
}
