import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "@/types/db";

export function useAuth() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSessionUserId(data.session?.user.id ?? null);
      setSessionLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUserId(session?.user.id ?? null);
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const profileQuery = useQuery({
    queryKey: ["profile", sessionUserId],
    enabled: !!sessionUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,name,country,bio,profile_image_url,role,is_admin,is_active,deactivated_reason,created_at")
        .eq("id", sessionUserId!)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const loading = sessionLoading || profileQuery.isLoading;
  const profile = profileQuery.data ?? null;
  const isAuthenticated = !!sessionUserId;

  return useMemo(
    () => ({ isAuthenticated, userId: sessionUserId, profile, loading }),
    [isAuthenticated, sessionUserId, profile, loading]
  );
}


