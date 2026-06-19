# Drone Shoot Images Directory

Place your Marzipano drone shoot tiles in this directory.

## Directory Structure

Each scene should have its own subdirectory following this structure:

```
drone-shoots/
├── scene1/
│   ├── preview.jpg
│   └── {z}/{f}/{y}/{x}.jpg
├── scene2/
│   ├── preview.jpg
│   └── {z}/{f}/{y}/{x}.jpg
└── scene3/
    ├── preview.jpg
    └── {z}/{f}/{y}/{x}.jpg
```

## Example Structure

```
drone-shoots/
├── scene1/
│   ├── 0/
│   │   └── 0/
│   │       ├── 0/
│   │       │   ├── 0_0.jpg
│   │       │   ├── 1_0.jpg
│   │       │   └── 2_0.jpg
│   │       └── 1/
│   │           ├── 0_1.jpg
│   │           ├── 1_1.jpg
│   │           └── 2_1.jpg
│   └── preview.jpg
├── scene2/
│   └── ...
└── scene3/
    └── ...
```

## Creating Marzipano Tiles

Marzipano tiles are created from 360° equirectangular images using the Marzipano tool.

### 1. Install Marzipano Tool

```bash
npm install -g marzipano
```

### 2. Process Your 360° Images

```bash
marzipano-tool process input.jpg --output=./scene1
```

### 3. Upload Tiles

Copy the generated tiles to the corresponding scene directory.

## Image Requirements

**Input Images:**
- Format: Equirectangular 360° panorama
- Resolution: 4096 x 2048 pixels or higher
- Aspect ratio: 2:1
- Format: JPEG

**Output Tiles:**
- Multiple resolution levels for smooth loading
- Cube map format for efficient rendering
- Preview image for fast initial loading

## Drone Scene Configuration

Update the `droneScenes` array in `components/DroneShoot.tsx`:

```typescript
const droneScenes: DroneScene[] = [
  {
    id: "scene1",
    name: "Aerial View 1",
    initialView: {
      yaw: 0,
      pitch: 0,
      fov: (130 * Math.PI) / 180,
    },
  },
  // Add more scenes...
];
```

## Testing

1. Add your processed tiles to the public directory
2. Update the drone scenes configuration
3. Test the navigation and scene switching
4. Verify smooth loading and transitions

## Troubleshooting

**Images not loading:**
- Check file paths match scene IDs
- Verify tiles are in correct directory structure
- Check browser console for errors

**Poor quality rendering:**
- Ensure high-resolution source images
- Check that all tile levels are present
- Verify preview images exist

**Navigation issues:**
- Check scene switching logic
- Verify viewer initialization
- Test control methods (drag, touch)
