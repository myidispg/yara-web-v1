"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import controlApi from "@/api/controlClient";

export function useStaffAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await controlApi.getStaffProfile();
        if (isMounted) setUser(data);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (pathname === "/cpanel/login") return; // Don't redirect if already on login page
    if (!user) {
      router.replace("/cpanel/login");
      return;
    }
    if (!user.is_staff) {
      router.replace("/");
      return;
    }
    setAuthorized(true);
  }, [user, loading, router, pathname]);

  return { authorized, user, loading };
}