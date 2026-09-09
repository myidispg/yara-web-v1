"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import ControlLayout from "@/components/control/ControlLayout";

export default function ControlPanelLayout({ children }) {
  const { authorized } = useStaffAuth();
  const pathname = usePathname();

  // Force a consistent tab title on every control panel page
  useEffect(() => {
    document.title = "Control Panel | YA-RA";
  }, [pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink/60">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return <ControlLayout>{children}</ControlLayout>;
}