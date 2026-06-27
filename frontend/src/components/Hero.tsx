import { useState, useEffect } from 'react';
import { getSiteSetting } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [heroImage, setHeroImage] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuArAnYFnRG9AuBnIfZ5aMZTkaYXMC2y6vzgGcNplXeW_GuKhewTBKpun_jl7juaZug9dYMTAzU2BY82sCKDcrZm03e4looBPySqERlALS1FITinGr6Jtz3u1Ywn8fmULcOjxyJhvJKj2YyAbDamf8TgW_2qM6tIlhfIsbQdtA6q0jGF9PionEvfITkFD2NFbJ5sXZwWjPt15KIb9tl-zmLUeFQ00-HMC39-YajtvDkMJfHPcsLsln6CBfPSqO7oAnqVaTHot7NCWMR8");
  const [heroTitle, setHeroTitle] = useState("Smart Appliances for a Smarter Home");
  const [heroSubtitle, setHeroSubtitle] = useState("Experience the pinnacle of engineering and minimalist design. Precision-crafted for those who demand excellence.");

  useEffect(() => {
    async function fetchHeroData() {
      try {
        const [img, title, subtitle] = await Promise.all([
          getSiteSetting('hero_image_url'),
          getSiteSetting('hero_title'),
          getSiteSetting('hero_subtitle')
        ]);
        if (img) setHeroImage(img);
        if (title) setHeroTitle(title);
        if (subtitle) setHeroSubtitle(subtitle);
      } catch (error) {
        console.error(error);
      }
    }
    fetchHeroData();
  }, []);

  return (
    <>
      {/* ─── MOBILE HERO (hidden on md+) ─── */}
      <section className="relative w-full min-h-[500px] flex items-center overflow-hidden bg-[#f5f5f7] md:hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover object-[60%_center]"
            alt="Modern minimalist living room"
            src={heroImage}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 px-6 sm:px-10 w-full py-16">
          <div className="max-w-[480px]">
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-neutral-500 uppercase mb-3">
              Ali Electronics
            </p>
            <h1 className="font-bold tracking-tight text-3xl sm:text-4xl text-neutral-900 mb-4 leading-[1.1]">
              {heroTitle}
            </h1>
            <p className="text-sm text-neutral-600 mb-8 max-w-sm leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-row gap-3">
              <Link to="/categories" className="bg-neutral-900 text-white px-7 py-3 rounded-xl font-semibold text-sm hover:bg-neutral-700 active:scale-95 transition-all">
                Shop Now
              </Link>
              <Link to="/categories" className="border border-neutral-300 text-neutral-900 px-7 py-3 rounded-xl font-semibold text-sm hover:bg-neutral-100 active:scale-95 transition-all bg-white/50 backdrop-blur-sm">
                View Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DESKTOP HERO (hidden on mobile, shown on md+) ─── */}
      <section className="hidden md:block relative w-full min-h-[620px] bg-[#f5f5f7] overflow-hidden">
        {/* Absolute Image: occupies the right side and bleeds to the viewport edge */}
        <img
          className="absolute top-0 right-0 w-[55%] lg:w-[58%] h-full object-cover object-top z-0"
          alt="Modern minimalist living room"
          src={heroImage}
        />
        {/* Gradient Overlay: fades the image background into the solid color on the left */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none" 
          style={{
            background: 'linear-gradient(to right, #f5f5f7 35%, rgba(245, 245, 247, 0.9) 50%, rgba(245, 245, 247, 0) 80%)'
          }}
        />
        {/* Content Container: full width, aligned with header padding */}
        <div className="relative z-20 w-full px-6 md:px-12 min-h-[620px] flex items-center pt-24">
          <div className="max-w-[520px] py-16">
            <p className="text-sm font-semibold tracking-widest text-neutral-400 uppercase mb-4">
              Ali Electronics
            </p>
            <h1 className="font-bold tracking-tight text-5xl lg:text-[56px] xl:text-[64px] text-neutral-900 mb-6 leading-[1.05]">
              {heroTitle}
            </h1>
            <p className="text-base text-neutral-600 mb-10 max-w-md leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-row gap-4">
              <Link
                to="/categories"
                className="bg-neutral-900 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-neutral-700 active:scale-95 transition-all"
              >
                Shop Now
              </Link>
              <Link
                to="/categories"
                className="border border-neutral-300 text-neutral-900 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-neutral-100 active:scale-95 transition-all"
              >
                View Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
