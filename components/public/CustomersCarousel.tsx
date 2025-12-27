'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  logo: string;
  website?: string;
}

interface CustomersCarouselProps {
  customers: Customer[];
  heading: string;
  description: string;
}

export default function CustomersCarousel({ customers, heading, description }: CustomersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const itemsPerSlide = 5;

  // Auto-advance carousel continuously every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying || customers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % customers.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, customers.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + customers.length) % customers.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % customers.length);
  };

  if (customers.length === 0) return null;

  // Create duplicated array for seamless infinite loop (3 copies)
  const duplicatedCustomers = [...customers, ...customers, ...customers];
  
  // Calculate the translateX for smooth sliding
  // Each item is 192px (w-48) + 32px gap = 224px total per item
  const itemWidth = 224; // w-48 (192px) + gap-8 (32px)
  
  // Start from the first copy (translateX = 0 shows first items)
  // translateX moves the container: positive = move right (items appear from right)
  // negative = move left (items appear from left)
  // To slide items left (reveal next items), we need negative translateX
  const translateX = -(currentIndex * itemWidth);

  return (
    <div className="relative">
      {/* Continuous Carousel Layout */}
      <div
        className="relative overflow-hidden"
        style={{ 
          maxWidth: `${itemsPerSlide * itemWidth}px`,
          margin: '0 auto'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsAutoPlaying(true);
        }}
      >
        <div 
          className="flex gap-8 transition-transform duration-700 ease-in-out will-change-transform"
          style={{
            transform: `translateX(${translateX}px)`,
          }}
        >
          {duplicatedCustomers.map((customer, index) => (
            <div
              key={`${customer._id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-24 w-48 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300"
            >
              {customer.logo ? (
                customer.website ? (
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={customer.logo}
                      alt={customer.name}
                      width={150}
                      height={80}
                      className="object-contain max-w-full max-h-full"
                    />
                  </a>
                ) : (
                  <Image
                    src={customer.logo}
                    alt={customer.name}
                    width={150}
                    height={80}
                    className="object-contain max-w-full max-h-full"
                  />
                )
              ) : (
                <span className="text-gray-400 text-sm">{customer.name}</span>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {customers.length > itemsPerSlide && (
          <>
            <button
              onClick={goToPrevious}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 z-10 ${
                isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
              aria-label="Previous customers"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 z-10 ${
                isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
              aria-label="Next customers"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

