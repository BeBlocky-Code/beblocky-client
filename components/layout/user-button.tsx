"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { LogOut, User, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ProfileDialog } from "@/components/profile/profile-dialog";
import { useSubscription } from "@/hooks/use-subscription";

interface UserButtonProps {
  isCollapsed?: boolean;
}

export function UserButton({ isCollapsed = false }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const { subscription } = useSubscription();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Signed out successfully");
      // Redirect to sign-in page after successful sign-out
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Show loading state while session is loading
  if (isPending) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Show sign in button if not authenticated
  if (!session?.user) {
    return (
      <div className="p-4">
        <div className="text-sm text-muted-foreground">Please sign in</div>
      </div>
    );
  }

  const user = session.user;
  const userRole = user.roles?.[0] ?? "user";

  // Get subscription info from actual subscription data
  const getSubscriptionInfo = () => {
    if (!subscription || subscription.status !== "active") {
      return { name: "Free", variant: "outline" as const, icon: null };
    }

    switch (subscription.planName) {
      case "Pro-Bundle":
        return {
          name: "Pro Bundle",
          variant: "default" as const,
          icon: <Crown className="h-3 w-3" />,
        };
      case "Builder":
        return { name: "Builder", variant: "secondary" as const, icon: null };
      case "Starter":
        return { name: "Starter", variant: "outline" as const, icon: null };
      case "Organization":
        return {
          name: "Organization",
          variant: "default" as const,
          icon: <Crown className="h-3 w-3" />,
        };
      default:
        return {
          name: subscription.planName,
          variant: "outline" as const,
          icon: null,
        };
    }
  };

  const subscriptionInfo = getSubscriptionInfo();

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div
            className={cn(
              "hover:bg-accent/50 transition-colors duration-200 cursor-pointer",
              isCollapsed ? "p-2" : "p-4"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 hover:ring-primary/30 transition-all duration-200 hover:scale-105">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold shadow-lg text-lg">
                    {(user.name ?? "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || (user.email?.[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge
                    variant={subscriptionInfo.variant}
                    className="text-xs px-1.5 py-0.5 flex items-center gap-1"
                  >
                    {subscriptionInfo.icon}
                    {subscriptionInfo.name === "Pro Bundle"
                      ? "Pro"
                      : subscriptionInfo.name}
                  </Badge>
                </div>
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground capitalize">
                      {userRole}
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 p-2 max-h-[80vh] overflow-y-auto scrollbar-hide"
          align="end"
          side="top"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage
                  src={user.image || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white shadow-md text-base">
                  {(user.name ?? "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || (user.email?.[0] ?? "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => setProfileDialogOpen(true)}
          >
            <User className="h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>

          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => router.push("/upgrade")}
          >
            <Crown className="h-4 w-4" />
            Upgrade Plan
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </>
  );
}
