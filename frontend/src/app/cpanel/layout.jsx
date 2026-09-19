"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import ControlLayout from "@/components/control/ControlLayout";


export default function CPanelLayout({ children }) {
  const { authorized, loading } = useStaffAuth();
  const pathname = usePathname();

  useEffect(() => { document.title = "cPanel | YA-RA"; }, [pathname]);

  // Login page bypasses the auth guard
  if (pathname === "/cpanel/login") {
    return children;
  }

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#1A2536]/60">Checking authorization...</p>
      </div>
    );
  }

  return <ControlLayout>{children}</ControlLayout>;
}