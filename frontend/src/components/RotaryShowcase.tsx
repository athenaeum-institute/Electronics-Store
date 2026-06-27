import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../lib/supabase';

const DEFAULT_CATEGORIES = [
  { name: 'Inverter ACs', slug: 'air-conditioners', icon: 'ac_unit', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt7VV7blG8cFGDDNlxgQaS3fRiJ_cyCOxB7t58YRRU3tLtfgvNag8_bBfiLoU8f01ybtiNiP7dw3dwD5kbwlTX7qVtLsZhToT8ecHGhEFx71QSsRWJ1YfRJsTcc4grrH2ww11e8F_VPlfnZuMPaC1pOueC3jvewRDHxcdxZsX9MtJwUCPxAb7pW72zB7CnY0V8h9FtsIweZclKI1qYnC87LosQUD4P8UCyQevwq9cu7gw0MHWhJH2A9bcjRKMGHjLLZsK8NZ9H6xof' },
  { name: 'Smart Refrigerators', slug: 'refrigerators', icon: 'kitchen', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRORX1nuj6i2rixPISpU8rQy67b0NiuNSlpOTUIrZUw2TMRSZtIfnbtfWRDbOj83G4-MmZ-6do_vxYq8xdBWT3Q64mbo0qP2us49-0g5RJeLYgImTNoZgMBQ40e32liSi2izjGPGNhzPu5qAQVtZRcEJVNUwadAAXLuSIQ0LV3FCs7nrtl1ZN-J2T_bPFKUaeThDWxEE0QYO2FnPf2W9my0r_A5jLrIoxJRyOnJHHR84IUdRu6OEIN7lzpjkC_OL1kE0lLW76HAP3T' },
  { name: 'OLED Entertainment', slug: 'led-tvs', icon: 'tv', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6-MTESjnBFTQVznftG6eSLEw55QZMiFNMWayiAU_RVXjrKhNAOg7jd8m4vQLCCEQfBP6tQCRUPDwsFKZzDwCGS--ClCKLkdmbuygceg3MckxFE1LXasKsRtRaPbGG_upFn59VolMVmAItiwdLk5-RJgxHdO7-kwzqIPZqsR71xrr31UeUoD3o2yONovWKsiQUOIxu2ganXIDJmr6zw6iYzvG_OQsi3vYC3f86Hcv-fPUErL0RCAD1EOhYHtlyz07J2eYFWO0UfZj' },
  { name: 'Precision Washing', slug: 'washing-machines', icon: 'local_laundry_service', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRqHiq8a98Xd6mLLKvAuZ4yHOF96OWhrk9ccsEhQy-CAjjrABbeMLTNLxTtG_75j2RTg-pq_sc6yoSnWyl6-sDu9-x2d6j-kqg8qk7ZGjlG5vIccdU5SJaM3rsnSugXWqaUTOfuVR-kLVKqItFcbmcGjxZtRipHTsRMUeYiO6bX-m4GFwcMID8HZofNwDuKo_QJubUDpZ1feDHbpx17fppwNY64AEyX10r27_sbt4ZO6DaDRQ9psYnukgznkILN_GauAbdo6jCrsVO' }
];

export default function RotaryShowcase() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeState, setFadeState] = useState(true);
  
  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const startRotation = useRef(0);

  useEffect(() => {
    async function fetchCats() {
      try {
        const data = await getCategories();
        if (data && data.length > 0) {
          const newCats = DEFAULT_CATEGORIES.map((defCat, i) => {
            const dbCat = data[i];
            if (dbCat) {
              return {
                name: dbCat.name,
                slug: dbCat.slug || defCat.slug,
                icon: defCat.icon,
                image: dbCat.image_url || defCat.image,
              };
            }
            return defCat;
          });
          setCategories(newCats);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchCats();
  }, []);

  // Helper to handle showcasing update logic with transition
  const updateShowcase = (index: number) => {
    setFadeState(false);
    setTimeout(() => {
      setActiveIndex(index);
      setFadeState(true);
    }, 300);
  };

  const rotateTo = (index: number) => {
    const diff = index - activeIndex;
    let rotationChange = diff * -90;
    
    // Shortest path logic
    if (rotationChange < -180) rotationChange += 360;
    if (rotationChange > 180) rotationChange -= 360;
    
    setCurrentRotation(prev => prev + rotationChange);
    updateShowcase(index);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!dialRef.current) return;
    isDragging.current = true;
    // Set pointer capture to ensure we get events even if mouse leaves the dial
    dialRef.current.setPointerCapture(e.pointerId);
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    startAngle.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    startRotation.current = currentRotation;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const delta = angle - startAngle.current;
    
    setCurrentRotation(startRotation.current + delta);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || !dialRef.current) return;
    isDragging.current = false;
    dialRef.current.releasePointerCapture(e.pointerId);
    
    // Snap to nearest 90deg
    const normalizedRotation = Math.round(currentRotation / 90) * 90;
    setCurrentRotation(normalizedRotation);
    
    // Calculate active index from rotation (0, -90, -180, -270...)
    let index = Math.round(-normalizedRotation / 90) % 4;
    if (index < 0) index += 4;
    
    if (index !== activeIndex) {
      updateShowcase(index);
    }
  };

  return (
    <section className="pt-8 pb-8 sm:pt-16 md:py-section-gap px-container-margin max-w-[1440px] mx-auto overflow-hidden" id="rotary-showcase">
      <div className="mb-6 md:mb-12 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-left sm:text-3xl md:text-4xl lg:text-[40px]">Seamless Selection</h2>
        <p className="text-xs sm:text-sm md:text-base text-neutral-500 text-left mt-1 md:mt-2 max-w-[290px] md:max-w-[600px] leading-relaxed">Experience an intuitive way to explore our premium product categories. Rotate the dial to discover the future of living.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center min-h-[600px]">
        
        {/* Left Column: Showcase */}
        <div className="relative h-full min-h-[280px] sm:min-h-[350px] lg:min-h-[600px] rounded-[32px] overflow-hidden bento-card-shadow group">
          <div className="absolute inset-0 w-full h-full">
            <img 
              className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${fadeState ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              alt="Showcase Category"
              src={categories[activeIndex].image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            <div className={`absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 text-left z-10 transition-all duration-500 ease-in-out ${fadeState ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h3 className="font-display-lg font-bold tracking-tight text-2xl md:text-[48px] text-white mb-1 md:mb-4">
                {categories[activeIndex].name}
              </h3>
              <a
                className="inline-flex items-center gap-2 text-white font-label-md text-sm md:text-base hover:gap-4 transition-all cursor-pointer"
                onClick={() => navigate(`/category/${categories[activeIndex].slug || encodeURIComponent(categories[activeIndex].name)}`)}
              >
                Explore Category <span className="material-symbols-outlined text-sm md:text-base">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Dial */}
        <div className="flex items-center justify-center relative py-8 md:py-12">
          <div className="relative w-[300px] h-[300px] md:w-[480px] md:h-[480px]">
            {/* Outer Decorative Bezel */}
            <div className="absolute inset-0 rounded-full bezel-texture border-[8px] border-surface-container-highest"></div>
            
            {/* Inner Rotating Dial */}
            <div 
              ref={dialRef}
              className="absolute inset-0 rounded-full cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `rotate(${currentRotation}deg)`,
                touchAction: 'none' // prevent scrolling on mobile while dragging
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Category Icons */}
              {categories.map((cat, i) => {
                const isSelected = i === activeIndex;
                const positions = [
                  "top-4 left-1/2 -translate-x-1/2", // 0deg (AC)
                  "right-4 top-1/2 -translate-y-1/2", // 90deg (Fridge)
                  "bottom-4 left-1/2 -translate-x-1/2", // 180deg (TV)
                  "left-4 top-1/2 -translate-y-1/2" // 270deg (Washing Machine)
                ];

                return (
                  <div 
                    key={i} 
                    className={`absolute ${positions[i]}`}
                    style={{
                      transform: `rotate(${-currentRotation}deg)`,
                    }}
                  >
                    <button 
                      className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group overflow-hidden border-4 ${isSelected ? 'border-primary' : 'border-surface-container-highest/50 border-2'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateTo(i);
                      }}
                    >
                      <span className={`material-symbols-outlined transition-colors group-hover:scale-110 ${isSelected ? 'text-primary' : 'text-secondary group-hover:text-primary'} ${isSelected ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
                        {cat.icon}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Center Detail / Logo */}
            <div className="absolute inset-[30%] md:inset-[35%] rounded-full bg-gradient-to-br from-surface-container-lowest to-surface-container-low flex items-center justify-center shadow-[inset_0_4px_15px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.05)] border border-surface-container-highest pointer-events-none z-10">
              <div className="text-center px-2">
                <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-secondary mb-0.5 md:mb-1 font-medium">Precision</div>
                <div className="font-bold text-sm sm:text-base md:text-lg tracking-tight leading-tight text-primary">Ali Electronics</div>
              </div>
            </div>

            {/* Focal Point Indicator */}
            <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
