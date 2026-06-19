"use client";

import { useParams } from "next/navigation";
import VirtualTourViewer from "@/components/VirtualTourViewer";

export default function TourPage() {
  const params = useParams();
  const scene = typeof params.scene === "string" ? params.scene : "entrance";

  return <VirtualTourViewer sceneId={scene} />;
}
