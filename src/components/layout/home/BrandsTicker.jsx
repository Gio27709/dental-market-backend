import React, { useRef, useEffect } from "react";
import "../../../styles/layout/_brands-ticker.scss";

// Original list
const BRAND_LIST = [
  {
    id: 1,
    name: "VIVO",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vivo_mobile_logo.png/640px-Vivo_mobile_logo.png",
  },
  {
    id: 2,
    name: "SONY",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sony_logo.svg/1200px-Sony_logo.svg.png",
  },
  {
    id: 3,
    name: "SAMSUNG",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1280px-Samsung_Logo.svg.png",
  },
  {
    id: 4,
    name: "ASUS",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/1280px-ASUS_Logo.svg.png",
  },
  {
    id: 5,
    name: "LENOVO",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/1280px-Lenovo_logo_2015.svg.png",
  },
  {
    id: 6,
    name: "DELL",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/1200px-Dell_Logo.svg.png",
  },
  {
    id: 7,
    name: "HP",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/1024px-HP_logo_2012.svg.png",
  },
  {
    id: 8,
    name: "MSI",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/MSI_Logo_2011.svg/1200px-MSI_Logo_2011.svg.png",
  },
];

// Duplicate for infinite scroll (2 sets)
const BRANDS = [...BRAND_LIST, ...BRAND_LIST];

const BrandsTicker = () => {
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  // Physics State
  const state = useRef({
    isDragging: false,
    currentX: 0,
    startX: 0,
    lastX: 0,
    velocity: -0.5, // Initial velocity
    rafId: null,
  });

  useEffect(() => {
    const track = trackRef.current;

    // Animation loop defined INSIDE effect to prevent reference errors and dependency warnings
    const animate = () => {
      if (!track) return;

      const { isDragging, velocity } = state.current;

      // Apply velocity if not dragging
      if (!isDragging) {
        state.current.currentX += velocity;

        // Friction logic
        if (Math.abs(velocity) > 0.1) {
          state.current.velocity *= 0.95;
        } else {
          // Maintain minimal scroll speed for infinite loop effect
          if (state.current.velocity > -0.5 && state.current.velocity < 0.5) {
            state.current.velocity = -0.5;
          }
        }
      }

      // Infinite Loop Logic using 2 sets of items
      const trackWidth = track.scrollWidth;
      const itemSetWidth = trackWidth / 2;

      if (state.current.currentX <= -itemSetWidth) {
        // Wrap around to start seamlessly
        state.current.currentX += itemSetWidth;
      } else if (state.current.currentX >= 0) {
        // Wrap around to end seamlessly
        state.current.currentX -= itemSetWidth;
      }

      // Apply transform
      track.style.transform = `translateX(${state.current.currentX}px)`;

      state.current.rafId = requestAnimationFrame(animate);
    };

    // Start loop
    state.current.rafId = requestAnimationFrame(animate);

    // Copy ref value to a variable for cleanup
    // This ensures we reference the same object even if ref.current changes (though unlikely here)
    const stateCurrent = state.current;

    return () => {
      if (stateCurrent.rafId) cancelAnimationFrame(stateCurrent.rafId);
    };
  }, []); // Empty dependency array is now truly correct and safe

  const handlePointerDown = (e) => {
    state.current.isDragging = true;
    state.current.startX = e.clientX - state.current.currentX;
    state.current.lastX = e.clientX;
    state.current.velocity = 0;
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!state.current.isDragging) return;
    e.preventDefault();
    const x = e.clientX;
    const delta = x - state.current.lastX;

    state.current.currentX = x - state.current.startX;
    state.current.velocity = delta;
    state.current.lastX = x;
  };

  const handlePointerUp = (e) => {
    state.current.isDragging = false;
    e.target.releasePointerCapture?.(e.pointerId);
  };

  return (
    <section className="brands-ticker-section">
      <div
        className="ticker-container"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="ticker-track" ref={trackRef}>
          {BRANDS.map((brand, index) => (
            <div key={`${brand.id}-${index}`} className="brand-item">
              <img src={brand.img} alt={brand.name} draggable="false" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsTicker;
