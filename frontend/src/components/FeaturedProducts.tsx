import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import { getFeaturedProducts } from '../lib/supabase';

export default function FeaturedProducts() {
  const addToCart = useStore((state) => state.addToCart);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  return (
    <section className="pt-8 pb-8 sm:pt-16 md:py-section-gap bg-surface-container-low">
      <div className="px-6 md:px-container-margin max-w-[1440px] mx-auto">
        {/* Section Header — unchanged */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
          <div className="mb-4 md:mb-0 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-left sm:text-3xl md:text-4xl lg:text-[40px]">Signature Products</h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 text-left mt-1 md:mt-2 max-w-[290px] md:max-w-[600px] leading-relaxed">The pinnacle of our design philosophy. Uncompromising performance wrapped in minimalist aesthetics.</p>
          </div>
          <Link to="/categories" className="flex items-center gap-2 text-primary font-label-md hover:gap-4 transition-all group">
            View All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative">
          {/* Left Arrow — desktop only */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary text-on-primary items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll left"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          {/* Right Arrow — desktop only */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary text-on-primary items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll right"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>

          {/* Right fade gradient — mobile only */}
          <div
            className="md:hidden pointer-events-none absolute right-0 top-0 h-full w-12 z-10"
            style={{ background: 'linear-gradient(to right, transparent, #f9f9fb)' }}
          />

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-2"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {loading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="flex-shrink-0 w-48 sm:w-56 md:w-64 bg-surface-container-lowest p-3 rounded-[24px] bento-card-shadow animate-pulse"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="h-36 bg-surface-container rounded-xl mb-3"></div>
                    <div className="h-4 w-12 bg-surface-container rounded-full mb-2"></div>
                    <div className="h-4 bg-surface-container rounded-md w-3/4 mb-1"></div>
                    <div className="h-5 bg-surface-container rounded-md w-1/2 mb-3"></div>
                    <div className="w-full h-8 bg-surface-container rounded-xl"></div>
                  </div>
                ))}
              </>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-12 w-full">
                <p className="text-neutral-500 font-label-md">More signature products coming soon.</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-48 sm:w-56 md:w-64 bg-surface-container-lowest p-3 rounded-[24px] bento-card-shadow group transition-all hover:scale-[1.01] flex flex-col"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <Link to={product.slug ? `/product/${product.slug}` : '#'} className="block flex-grow">
                    <div className="h-36 bg-surface-container rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3">
                      <img
                        className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        alt={product.name}
                        src={product.thumbnail_url || 'https://placehold.co/400x400?text=No+Image'}
                      />
                    </div>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {product.category?.name && (
                        <span className="px-2 py-0.5 border border-primary/10 rounded-full font-label-sm text-xs text-neutral-500">{product.category.name}</span>
                      )}
                      {product.model_number && (
                        <span className="px-2 py-0.5 border border-primary/10 rounded-full font-label-sm text-xs text-neutral-500 truncate max-w-[100px] inline-block align-bottom">{product.model_number}</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-primary mb-1 line-clamp-2 leading-snug">{product.name}</h4>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-primary font-bold text-base">
                        Rs. {product.price?.toLocaleString()}
                      </p>
                      {product.original_price && (
                        <span className="text-xs text-neutral-400 line-through">Rs. {product.original_price.toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          thumbnail_url: product.thumbnail_url,
                          model_number: product.model_number
                        });
                        toast.success(`Added ${product.name} to bag`);
                      }}
                      className="w-full bg-primary text-on-primary py-1.5 rounded-xl font-label-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
