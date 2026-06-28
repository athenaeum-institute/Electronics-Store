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
                    className="flex-shrink-0 w-48 sm:w-56 md:w-64 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col animate-pulse"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="h-52 md:h-56 bg-[#f8f8f8] rounded-t-2xl" />
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-1" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
                      <div className="h-5 w-24 bg-gray-200 rounded mt-2" />
                    </div>
                    <div className="px-3 pb-3 mt-auto">
                      <div className="h-9 w-full bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-12 w-full">
                <p className="text-neutral-500 font-label-md">More signature products coming soon.</p>
              </div>
            ) : (
              products.map((product) => {
                const discountPercent = product.original_price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-48 sm:w-56 md:w-64 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <Link to={product.slug ? `/product/${product.slug}` : '#'} className="block flex-grow">
                      <div className="h-52 md:h-56 bg-[#f8f8f8] rounded-t-2xl flex items-center justify-center p-4 relative">
                        {product.thumbnail_url ? (
                          <img
                            className="w-full h-full object-contain"
                            alt={product.name}
                            src={product.thumbnail_url}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`fallback flex items-center justify-center w-full h-full text-6xl text-gray-300 font-bold ${product.thumbnail_url ? 'hidden' : ''}`}>
                          {product.name ? product.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                      </div>
                      <div className="p-3 flex flex-col flex-grow">
                        {product.category?.name && (
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                            {product.category.name}
                          </span>
                        )}
                        <h4 className="text-sm font-semibold text-gray-900 leading-snug mt-1 line-clamp-2">
                          {product.name}
                        </h4>
                        {product.model_number && (
                          <span className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {product.model_number}
                          </span>
                        )}
                        <div className="flex items-baseline mt-2 flex-wrap">
                          <span className="text-base font-bold text-gray-900">
                            Rs. {product.price?.toLocaleString()}
                          </span>
                          {product.original_price && (
                            <>
                              <span className="text-xs text-gray-400 line-through ml-2">
                                Rs. {product.original_price.toLocaleString()}
                              </span>
                              <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full ml-1 font-medium">
                                {discountPercent}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="px-3 pb-3 mt-auto">
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
                        className="w-full bg-black text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
