"use client";

import { useRouter } from "next/navigation";
import DroneShoot from "@/components/DroneShoot";

export default function DronePage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "drone") return;
    router.push(`/${view}`);
  };

  return <DroneShoot onNavigate={handleNavigate} />;
}
