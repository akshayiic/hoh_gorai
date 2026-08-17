import { Smartphone } from "lucide-react";

export default function RotateDeviceOverlay() {
  return (
    <div className="rotate-overlay fixed inset-0 z-[9999] hidden flex-col items-center justify-center gap-5 bg-black px-8 text-center text-white">
      <Smartphone className="rotate-overlay-icon h-16 w-16" />
      <p className="text-lg font-medium">Please rotate your device</p>
      <p className="text-sm text-white/60">
        This experience is best viewed in landscape mode
      </p>
    </div>
  );
}
