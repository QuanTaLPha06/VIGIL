"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // While checking auth, show nothing briefly
  if (loading) return null;

  // Logged-in users get redirected above
  // Unauthenticated users see the landing page via iframe
  if (user) return null;

  return (
    <iframe
      src="/landing.html"
      className="w-full h-screen border-0"
      title="VIGIL — Cyber Risk & Capital Platform"
    />
  );
}
