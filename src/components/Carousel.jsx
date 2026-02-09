import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

export default function Carousel({ slides, rightContent, navigationPosition = "content", autoPlay = true, autoPlayInterval = 4000, height = "h-auto md:h-[90vh]" }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const nextSlide = useCallback(() => setCurrent((prev) => (prev + 1) % slides.length), [slides.length]);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrent(index);

  // Autoplay effect
  useEffect(() => {
    if (!autoPlay) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearTimeout(timeoutRef.current);
  }, [current, autoPlay, autoPlayInterval, slides.length, nextSlide]);

  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      <div
        className="flex transition-transform duration-700 ease-in-out h-full will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative h-auto md:h-full"
          >
            {/* Image Container */}
            <div className="relative w-full md:absolute md:inset-0 md:h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-auto md:h-full md:object-cover"
                style={{
                  objectPosition: slide.backgroundPosition || 'right center'
                }}
                loading="lazy"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-10" />

            {/* Content Container - Positioned at BOTTOM */}
            <div className="absolute inset-0 z-20 flex items-end md:items-center">
              <div className="max-w-7xl w-full mx-auto px-6 md:px-24 lg:px-32 pb-8 md:pb-0">
                <div className="flex items-center h-full">
                  {/* Kiri: Teks */}
                  <div className="w-full md:w-1/2 text-white">
                    {/* Title - Hidden on mobile */}
                    <h2 className="hidden md:block text-3xl font-semibold font-poppins whitespace-pre-line">
                      {slide.title}
                    </h2>
                    {/* Description - Hidden on mobile */}
                    <p className="hidden md:block text-base max-w-md text-white font-montserrat font-light mt-5">
                      {slide.description}
                    </p>
                    {/* Button - Visible on all devices */}
                    {slide.cta && (
                      <button className="mt-0 md:mt-6 font-montserrat text-sm inline-block px-6 py-3 bg-primaryColor hover:bg-secondaryColor text-white rounded-full shadow-lg md:font-semibold">
                        {slide.cta}
                      </button>
                    )}
                    {/* Bullet navigation di bawah CTA */}
                    {navigationPosition !== "center" && (
                      <div className="flex gap-3 mt-4 md:mt-6">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            className={clsx(
                              "h-[4px] rounded-full transition-all duration-300",
                              current === i ? "w-6 bg-secondaryColor" : "w-3 bg-white/70"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Kanan: Custom Content */}
                  {rightContent && (
                    <div className="hidden md:flex flex-col items-center justify-center w-1/2 h-full">
                      {rightContent(slide, idx)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows - Positioned at edges, well outside content area */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-[30%] md:top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full text-gray-800 shadow-lg transition-all z-30"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-[30%] md:top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full text-gray-800 shadow-lg transition-all z-30"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Bullet navigation di tengah bawah jika navigationPosition === 'center' */}
      {navigationPosition === "center" && (
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-3 bottom-8 md:bottom-12 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={clsx(
                "h-[4px] rounded-full transition-all duration-300",
                current === i ? "w-6 bg-secondaryColor" : "w-3 bg-white/70"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
