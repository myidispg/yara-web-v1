"use client";
import { createContext, useContext, useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await controlApi.getStaffProfile();
        setUser(data);
      } catch {
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <StaffAuthContext.Provider value={{ user, loading }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export const useStaffAuthContext = () => useContext(StaffAuthContext);