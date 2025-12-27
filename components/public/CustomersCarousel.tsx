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

  // Show carousel if more than 5 customers, otherwise show grid
  const showCarousel = customers.length > 5;
  const itemsPerSlide = 5;

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || !showCarousel || customers.length <= itemsPerSlide) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + itemsPerSlide) % customers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, showCarousel, customers.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerSlide;
      return newIndex < 0 ? customers.length - itemsPerSlide : newIndex;
    });
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + itemsPerSlide) % customers.length);
  };

  if (customers.length === 0) return null;

  // Get visible customers for carousel
  const getVisibleCustomers = () => {
    if (!showCarousel) return customers;
    
    const visible = [];
    for (let i = 0; i < itemsPerSlide; i++) {
      const index = (currentIndex + i) % customers.length;
      visible.push(customers[index]);
    }
    return visible;
  };

  const visibleCustomers = getVisibleCustomers();

  return (
    <div className="relative">
      {/* Grid Layout (5 or fewer customers) */}
      {!showCarousel ? (
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto">
          {customers.map((customer) => (
            <div
              key={customer._id}
              className="flex items-center justify-center h-24 w-48 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
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
      ) : (
        <>
          {/* Carousel Layout (5 or more customers) */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="grid grid-cols-5 gap-8 max-w-6xl mx-auto justify-items-center">
              {visibleCustomers.map((customer, index) => (
                <div
                  key={`${customer._id}-${currentIndex}-${index}`}
                  className="flex items-center justify-center h-24 w-48 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
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
                  className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 ${
                    isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  aria-label="Previous customers"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 ${
                    isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}
                  aria-label="Next customers"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Dots Navigation */}
            {customers.length > itemsPerSlide && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(customers.length / itemsPerSlide) }).map((_, index) => {
                  const slideIndex = index * itemsPerSlide;
                  const isActive = currentIndex === slideIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(slideIndex);
                        setIsAutoPlaying(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        isActive
                          ? 'bg-blue-600 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

