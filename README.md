# Maitri Park Virtual Tour

A Next.js virtual tour application for Maitri Park, featuring 360° panoramic views, interactive floor plans, and image gallery.

## Features

- **360° Virtual Tour**: Interactive panoramic viewer with drag navigation
- **Interactive Floor Plan**: Clickable floor plan with room details
- **Image Gallery**: Categorized image gallery with lightbox view
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Built with Tailwind CSS for a sleek, contemporary look

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm 11.x or higher

### Installation

1. Navigate to the project directory:
```bash
cd hoh_gorai
```

2. Install dependencies (already done):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
hoh_gorai/
├── app/
│   ├── page.tsx          # Main page with navigation
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/
│   ├── VirtualTourViewer.tsx  # 360° panoramic viewer
│   ├── FloorPlan.tsx          # Interactive floor plan
│   └── Gallery.tsx            # Image gallery
├── public/
│   ├── panoramas/        # 360° panoramic images
│   │   ├── entrance.jpg
│   │   ├── living-room.jpg
│   │   ├── kitchen.jpg
│   │   ├── bedroom.jpg
│   │   └── balcony.jpg
│   └── gallery/          # Standard gallery images
│       ├── entrance.jpg
│       ├── living-room.jpg
│       ├── kitchen.jpg
│       ├── bedroom.jpg
│       ├── balcony.jpg
│       ├── building.jpg
│       ├── lobby.jpg
│       └── pool.jpg
└── package.json
```

## Adding Your Images

### Panoramic Images (360° Tour)

Place your equirectangular panoramic images in the `public/panoramas/` directory:

- `entrance.jpg` - Main entrance area
- `living-room.jpg` - Living room space
- `kitchen.jpg` - Kitchen area
- `bedroom.jpg` - Master bedroom
- `balcony.jpg` - Private balcony

**Recommended specifications:**
- Resolution: 4096 x 2048 pixels or higher
- Format: JPEG (quality 80-90%)
- Aspect ratio: 2:1 (equirectangular projection)

### Gallery Images

Place standard images in the `public/gallery/` directory:

- Interior shots
- Exterior views
- Amenities photos
- Building photos

**Recommended specifications:**
- Resolution: 1920 x 1080 pixels or higher
- Format: JPEG or PNG
- Optimized for web

## Customization

### Adding More Scenes

Edit `components/VirtualTourViewer.tsx`:

```typescript
const scenes = [
  {
    id: 1,
    name: 'Scene Name',
    image: '/panoramas/your-image.jpg',
    hotspots: [
      { x: 50, y: 50, targetScene: 2, label: 'Next Scene' },
      { x: 30, y: 40, info: 'Description text' }
    ]
  },
  // Add more scenes...
];
```

### Updating Floor Plan

Edit the `rooms` array in `components/FloorPlan.tsx`:

```typescript
const rooms: Room[] = [
  {
    id: 1,
    name: 'Room Name',
    x: 10,      // X position (0-100)
    y: 40,      // Y position (0-100)
    width: 20,  // Width (0-100)
    height: 20, // Height (0-100)
    color: '#3b82f6',
    targetScene: 1 // Links to tour scene
  },
  // Add more rooms...
];
```

### Adding Gallery Images

Edit the `images` array in `components/Gallery.tsx`:

```typescript
const images: Image[] = [
  {
    id: 1,
    src: '/gallery/your-image.jpg',
    title: 'Image Title',
    description: 'Image description',
    category: 'Interior' // 'Interior', 'Exterior', or 'Amenities'
  },
  // Add more images...
];
```

## Features Breakdown

### 360° Tour Viewer

- **Drag Navigation**: Click and drag to look around the panoramic image
- **Hotspots**: Interactive points that link to other scenes or show information
- **Scene Navigation**: Use arrows or dots to switch between scenes
- **Mobile Support**: Touch gestures for mobile devices

### Floor Plan

- **Interactive Rooms**: Click on rooms to view details
- **Zoom Controls**: Zoom in/out for better visibility
- **Rotation**: Rotate the floor plan for different orientations
- **Color-coded**: Each room has a distinct color

### Gallery

- **Category Filter**: Filter by Interior, Exterior, or Amenities
- **Lightbox View**: Click images to view full-screen
- **Navigation**: Navigate between images with arrow keys
- **Responsive Grid**: Adapts to different screen sizes

## Performance Tips

1. **Optimize Images**: Use WebP format for better compression
2. **Lazy Loading**: Consider implementing lazy loading for gallery images
3. **CDN**: Host images on a CDN for faster loading
4. **Image Compression**: Use tools like ImageOptim or TinyPNG

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is proprietary and confidential.

## Support

For questions or issues, please contact the development team.
