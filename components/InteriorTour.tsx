"use client";

import { Pannellum } from "pannellum-react";

interface HotspotConfig {
  pitch: number;
  yaw: number;
  targetScene: string;
  label: string;
}

interface SceneConfig {
  name: string;
  image: string;
  yaw: number;
  pitch: number;
  hotspots: HotspotConfig[];
}

interface InteriorTourProps {
  scene: SceneConfig;
  onSceneChange: (targetScene: string) => void;
}

export default function InteriorTour({ scene, onSceneChange }: InteriorTourProps) {
  return (
    <Pannellum
      width="100%"
      height="100%"
      image={scene.image}
      pitch={scene.pitch}
      yaw={scene.yaw}
      hfov={110}
      autoLoad
      showControls={true}
      showFullscreenCtrl={false}
      showZoomCtrl={true}
    >
      {scene.hotspots.map((hotspot, idx) => (
        <Pannellum.Hotspot
          key={idx}
          type="custom"
          pitch={hotspot.pitch}
          yaw={hotspot.yaw}
          handleClick={() => onSceneChange(hotspot.targetScene)}
          tooltip={() => {
            const el = document.createElement("div");
            el.className = "bg-black/80 backdrop-blur border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg pointer-events-none whitespace-nowrap";
            el.innerText = hotspot.label;
            return el;
          }}
        />
      ))}
    </Pannellum>
  );
}
