"use client";
import { createContext, useContext, useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <StaffAuthContext.Provider value={{ user, loading }}>
      {children}
    </StaffAuthContext.Provider>
  );
}
export const useStaffAuth = () => useContext(StaffAuthContext);