"use client"; // This is crucial! It tells Next.js this file runs in the browser.

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleProvider({ children }) {
  // Ensure the environment variable is loaded
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing in .env.local");
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}