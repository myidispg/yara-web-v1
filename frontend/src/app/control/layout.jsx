"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStaffAuth } from "@/context/StaffAuthContext";
import ControlLayout from "@/components/control/ControlLayout";

export default function ControlPanelLayout({ children }) {
  const { user, loading } = useStaffAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { document.title = "Control Panel | YA-RA"; }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/cpanel-login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#1A2536]/60">Checking authorization...</p>
      </div>
    );
  }

  return <ControlLayout>{children}</ControlLayout>;
}