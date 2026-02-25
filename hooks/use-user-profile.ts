import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import type { UserRole } from "@/types/user";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  subscription?: string;
}

export function useUserProfile() {
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!session?.user) return;
        // TODO: Replace with actual API call to fetch user profile
        // For now, return a mock profile
        const mockProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.name ?? "",
          role: "parent" as UserRole, // Default role
          image: session.user.image || undefined,
          subscription: "Free",
        };

        setProfile(mockProfile);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  return {
    profile,
    loading: isPending || loading,
    error,
  };
}
