"use client";

import { useRouter } from "next/navigation";
import LocationExplorer from "@/components/LocationExplorer";

export default function LocationPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "location") return;
    router.push(`/${view}`);
  };

  return <LocationExplorer onNavigate={handleNavigate} />;
}
