"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { StaffAuthProvider } from "@/context/StaffAuthContext";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import ControlLayout from "@/components/control/ControlLayout";

function ControlPanelGuard({ children }) {
  const { authorized } = useStaffAuth();
  const pathname = usePathname();

  useEffect(() => {
    document.title = "Control Panel | YA-RA";
  }, [pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#1A2536]/60">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return <ControlLayout>{children}</ControlLayout>;
}

export default function ControlPanelLayoutWrapper({ children }) {
  return (
    <StaffAuthProvider>
      <ControlPanelGuard>{children}</ControlPanelGuard>
    </StaffAuthProvider>
  );
}