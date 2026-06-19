'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Image {
  id: number;
  src: string;
  title: string;
  description: string;
  category: string;
}

const images: Image[] = [
  {
    id: 1,
    src: '/gallery/entrance.jpg',
    title: 'Main Entrance',
    description: 'Grand entrance with elegant marble flooring',
    category: 'Interior'
  },
  {
    id: 2,
    src: '/gallery/living-room.jpg',
    title: 'Living Room',
    description: 'Spacious living area with natural lighting',
    category: 'Interior'
  },
  {
    id: 3,
    src: '/gallery/kitchen.jpg',
    title: 'Modern Kitchen',
    description: 'State-of-the-art kitchen with premium appliances',
    category: 'Interior'
  },
  {
    id: 4,
    src: '/gallery/bedroom.jpg',
    title: 'Master Bedroom',
    description: 'Luxurious master suite with panoramic views',
    category: 'Interior'
  },
  {
    id: 5,
    src: '/gallery/balcony.jpg',
    title: 'Private Balcony',
    description: 'Scenic balcony overlooking the city',
    category: 'Exterior'
  },
  {
    id: 6,
    src: '/gallery/building.jpg',
    title: 'Building Exterior',
    description: 'Modern architectural design with premium finishes',
    category: 'Exterior'
  },
  {
    id: 7,
    src: '/gallery/lobby.jpg',
    title: 'Lobby Area',
    description: 'Elegant lobby with 24-hour security',
    category: 'Amenities'
  },
  {
    id: 8,
    src: '/gallery/pool.jpg',
    title: 'Swimming Pool',
    description: 'Rooftop infinity pool with city views',
    category: 'Amenities'
  },
];

const categories = ['All', 'Interior', 'Exterior', 'Amenities'];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(img => img.category === selectedCategory);

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <div className="h-full w-full bg-gray-900 relative">
      {/* Category Filter */}
      <div className="absolute top-24 left-0 right-0 z-10 px-4">
        <div className="flex justify-center gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      <div className="h-full w-full overflow-y-auto pt-36 pb-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => {
                setSelectedImage(image);
                setCurrentIndex(index);
              }}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-200"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image.src})` }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-semibold text-sm">{image.title}</h3>
                <p className="text-white/80 text-xs">{image.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X size={32} />
          </button>

          {/* Navigation */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
          >
            <ChevronRight size={32} />
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh] w-full">
            <div
              className="relative rounded-lg overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: `url(${selectedImage.src})`,
                aspectRatio: '16/9'
              }}
            />
            <div className="mt-4 text-center">
              <h2 className="text-white text-2xl font-bold">{selectedImage.title}</h2>
              <p className="text-gray-300 mt-2">{selectedImage.description}</p>
              <p className="text-gray-400 text-sm mt-1">{selectedImage.category}</p>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
