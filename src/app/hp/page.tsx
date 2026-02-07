"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HpRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/wizard-idle");
  }, [router]);
  return null;
}
