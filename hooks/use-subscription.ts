/**
 * Thin re-export so existing `@/hooks/use-subscription` imports share the
 * TanStack Query cache in `lib/hooks/use-subscription`.
 */
export {
  useMySubscription,
  useSubscription,
} from "@/lib/hooks/use-subscription";
