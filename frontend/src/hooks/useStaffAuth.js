"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuthContext } from "@/context/StaffAuthContext";

export function useStaffAuth() {
  const { user, loading } = useStaffAuthContext();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push("/cpanel-login");
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