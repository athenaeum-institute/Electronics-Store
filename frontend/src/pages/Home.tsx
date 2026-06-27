import Hero from '../components/Hero';
import CuratedCollections from '../components/CuratedCollections';
import RotaryShowcase from '../components/RotaryShowcase';
import FeaturedProducts from '../components/FeaturedProducts';

const Divider = () => (
  <div className="w-full max-w-[1440px] mx-auto px-container-margin-mobile md:px-container-margin">
    <div className="w-full h-[1px] bg-surface-container-highest/60"></div>
  </div>
);

const TrustStrip = () => (
  <div className="w-full border-b border-surface-container-highest/60 bg-surface-container-lowest">
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 md:py-6">
      <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-12 gap-y-4 text-xs md:text-sm font-semibold text-neutral-600">
        <div className="flex items-center gap-2"><span className="text-base leading-none">✅</span> Official Haier Dealer</div>
        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-neutral-200"></div>
        <div className="flex items-center gap-2"><span className="text-base leading-none">🛡️</span> Brand Warranty</div>
        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-neutral-200"></div>
        <div className="flex items-center gap-2"><span className="text-base leading-none">📦</span> 100% Genuine</div>
        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-neutral-200"></div>
        <div className="flex items-center gap-2"><span className="text-base leading-none">🔄</span> 7-Day Return</div>
      </div>
    </div>
  </div>
);

export default function Home() {

  return (
    <main>
      <Hero />
      <TrustStrip />
      <CuratedCollections />
      <Divider />
      <RotaryShowcase />
      <Divider />
      <FeaturedProducts />
    </main>
  );
}
