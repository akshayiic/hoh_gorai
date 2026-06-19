'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface Room {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  targetScene?: number;
}

const rooms: Room[] = [
  { id: 1, name: 'Entrance', x: 10, y: 40, width: 20, height: 20, color: '#3b82f6', targetScene: 1 },
  { id: 2, name: 'Living Room', x: 30, y: 40, width: 30, height: 20, color: '#10b981', targetScene: 2 },
  { id: 3, name: 'Kitchen', x: 60, y: 40, width: 20, height: 20, color: '#f59e0b', targetScene: 3 },
  { id: 4, name: 'Master Bedroom', x: 30, y: 10, width: 30, height: 25, color: '#8b5cf6', targetScene: 4 },
  { id: 5, name: 'Balcony', x: 60, y: 10, width: 25, height: 20, color: '#ec4899', targetScene: 5 },
];

export default function FloorPlan() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleRoomClick = (room: Room) => {
    if (room.targetScene) {
      // Will be connected to tour navigation
      setSelectedRoom(room);
    }
  };

  return (
    <div className="h-full w-full bg-gray-100 relative overflow-hidden">
      {/* Controls */}
      <div className="absolute top-24 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setScale(s => Math.min(s + 0.1, 2))}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={() => setRotation(r => (r + 90) % 360)}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg"
          title="Rotate"
        >
          <RotateCw size={20} />
        </button>
      </div>

      {/* Floor Plan Container */}
      <div className="h-full w-full flex items-center justify-center p-8">
        <div
          className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: '80%',
            maxWidth: '800px',
            aspectRatio: '4/3',
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Floor Plan SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background */}
            <rect width="100" height="100" fill="#f8fafc" />

            {/* Grid */}
            <defs>
              <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Walls */}
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="#334155" strokeWidth="2" />

            {/* Rooms */}
            {rooms.map(room => (
              <g key={room.id} onClick={() => handleRoomClick(room)} className="cursor-pointer">
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill={room.color}
                  opacity={selectedRoom?.id === room.id ? '1' : '0.6'}
                  stroke="#334155"
                  strokeWidth="1"
                  className="transition-opacity hover:opacity-100"
                />
                <text
                  x={room.x + room.width / 2}
                  y={room.y + room.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="3"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {room.name}
                </text>
              </g>
            ))}

            {/* Doors */}
            <rect x="29" y="48" width="2" height="4" fill="#fff" stroke="#334155" strokeWidth="0.5" />
            <rect x="59" y="48" width="2" height="4" fill="#fff" stroke="#334155" strokeWidth="0.5" />
            <rect x="44" y="33" width="4" height="2" fill="#fff" stroke="#334155" strokeWidth="0.5" />
            <rect x="59" y="18" width="4" height="2" fill="#fff" stroke="#334155" strokeWidth="0.5" />
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h3 className="font-bold text-sm mb-2">Rooms</h3>
            <div className="flex flex-col gap-1 text-xs">
              {rooms.map(room => (
                <div key={room.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: room.color }}
                  />
                  <span>{room.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div
          className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-20"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedRoom.name}</h3>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedRoom.color }}
                />
                <span className="text-gray-700">
                  Area: {selectedRoom.width * selectedRoom.height} sq ft
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Click on rooms to explore in 360° view
              </p>
              {selectedRoom.targetScene && (
                <button 
                  onClick={() => {
                    const sceneMapping: Record<number, string> = {
                      1: "entrance",
                      2: "living-room",
                      3: "kitchen",
                      4: "bedroom",
                      5: "balcony"
                    };
                    const scene = sceneMapping[selectedRoom.targetScene!];
                    if (scene) {
                      router.push(`/tour/${scene}`);
                    }
                  }}
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  View 360° Tour
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-24 left-28 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
        Click on rooms to view details
      </div>
    </div>
  );
}
