"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useStaffAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push("/auth?next=/control");
      return;
    }
    
    if (!user.is_staff) {
      router.push("/");
      return;
    }
    
    setAuthorized(true);
  }, [user, loading, router]);

  return { authorized, user };
}