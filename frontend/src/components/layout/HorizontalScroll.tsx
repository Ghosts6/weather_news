import React, { useEffect, useRef, useState } from 'react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  onScroll: (scrollLeft: number) => void;
  currentSection: number;
  onSectionChange: (index: number) => void;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ 
  children, 
  onScroll, 
  currentSection,
  onSectionChange 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDeltaY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const now = Date.now();
      const timeDelta = now - lastScrollTime.current;
      lastScrollTime.current = now;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        container.scrollLeft += e.deltaX * 2;
        accumulatedDeltaY.current = 0;
        return;
      }

      // Handle vertical scrolling for section navigation
      if (Math.abs(e.deltaY) > 5) {
        e.preventDefault();

        accumulatedDeltaY.current += e.deltaY;

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          const threshold = 50;
          
          if (Math.abs(accumulatedDeltaY.current) >= threshold) {
            const numSections = React.Children.count(children);
            
            if (accumulatedDeltaY.current > 0 && currentSection < numSections - 1) {
              onSectionChange(currentSection + 1);
            } else if (accumulatedDeltaY.current < 0 && currentSection > 0) {
              onSectionChange(currentSection - 1);
            }
          }
          
          accumulatedDeltaY.current = 0;
        }, 150);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [children, currentSection, onSectionChange]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      onScroll(scrollContainerRef.current.scrollLeft);
    }
  };

  const numChildren = React.Children.count(children);
  const sectionWidth = 80 * 16;
  const gapWidth = 2 * 16;
  const totalWidth = (numChildren * sectionWidth) + ((numChildren - 1) * gapWidth);

  return (
    <div
      ref={scrollContainerRef}
      className="horizontal-scroll-container"
      onScroll={handleScroll}
    >
      <div className="flex h-full items-center" style={{ width: `${totalWidth}px` }}>
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroll;