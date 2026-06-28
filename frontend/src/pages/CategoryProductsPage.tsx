import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getProductsByCategory, getCategories } from '../lib/supabase';
import { useStore } from '../store/useStore';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

// Product Card Skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-64 md:h-72 bg-[#f8f8f8] rounded-t-2xl" />
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
  );
}

// Product card
function ProductCard({ product }: { product: any }) {
  const addToCart = useStore(s => s.addToCart);
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <Link to={product.slug ? `/product/${product.slug}` : '#'} className="block flex-grow">
        <div className="h-64 md:h-72 bg-[#f8f8f8] rounded-t-2xl flex items-center justify-center p-4 relative">
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
              model_number: product.model_number,
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
}

const getCategoryMeta = (slug?: string) => {
  switch (slug) {
    case 'air-conditioners': return { subtitle: "Beat Pakistan's heat with Haier T3 inverter technology", icon: "❄️" };
    case 'refrigerators': return { subtitle: "Keep fresh longer with Haier's advanced cooling", icon: "🧊" };
    case 'washing-machines': return { subtitle: "Superior laundry care for every Pakistani home", icon: "👕" };
    case 'led-tvs': return { subtitle: "Cinematic experience with Haier QLED & Google TV", icon: "📺" };
    case 'freezers': return { subtitle: "Reliable freezing solution for homes & businesses", icon: "🧊" };
    case 'water-dispensers': return { subtitle: "Pure, clean water — hot & cold at your convenience", icon: "💧" };
    case 'microwave-ovens': return { subtitle: "Smart cooking made simple with Haier", icon: "🍽️" };
    case 'kitchen-appliances': return { subtitle: "Elevate your kitchen with Haier appliances", icon: "🍳" };
    case 'small-appliances': return { subtitle: "Smart solutions for everyday living", icon: "⚡" };
    case 'laptops': return { subtitle: "Powerful performance, slim design", icon: "💻" };
    default: return { subtitle: "Genuine Haier products with official warranty", icon: "✨" };
  }
};

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('featured');

  useEffect(() => {
    if (!slug) return;
    setTimeout(() => {
      setLoading(true);
      setProducts([]);
    }, 0);

    async function fetchData() {
      try {
        // Fetch products and category name in parallel
        const [prods, cats] = await Promise.all([
          getProductsByCategory(slug as string),
          getCategories(),
        ]);
        setProducts(prods as any[]);
        const found = (cats as any[]).find(
          c => c.slug === slug || encodeURIComponent(c.name) === slug
        );
        if (found) setCategoryName(found.name);
      } catch {
        // fetch failed silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Client-side sorting
  const sorted = useMemo(() => {
    const copy = [...products];
    if (sort === 'price-asc') return copy.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return copy.sort((a, b) => b.price - a.price);
    if (sort === 'newest') return copy.sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    // 'featured' — featured first
    return copy.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }, [products, sort]);

  const displayName = categoryName || slug?.replace(/-/g, ' ') || 'Category';

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];

  return (
    <main className="bg-surface-container-lowest min-h-screen pt-20 md:pt-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin pt-6 pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-neutral-900 transition-colors font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link to="/categories" className="hover:text-neutral-900 transition-colors font-medium">Categories</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-neutral-900 font-semibold capitalize">{displayName}</span>
        </nav>

        {/* Banner */}
        <div className="w-full h-40 md:h-56 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl mb-8 p-6 md:p-10 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-white/70 text-xs font-semibold tracking-wider mb-3 backdrop-blur-sm">
              Official Haier Store
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 capitalize leading-tight">
              {displayName}
            </h1>
            <p className="text-sm md:text-lg text-white/80 leading-relaxed max-w-md">
              {getCategoryMeta(slug).subtitle}
            </p>
          </div>
          <div className="relative z-10 text-4xl md:text-6xl flex-shrink-0 ml-4">
            {getCategoryMeta(slug).icon}
          </div>
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="text-neutral-500 font-medium text-sm">
            {!loading && `${products.length} products found`}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-neutral-500 flex-shrink-0" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="text-sm font-medium text-neutral-700 bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-surface-container-highest mb-8" />

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-5xl text-neutral-300 mb-4">inventory_2</span>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">No products available yet</h2>
            <p className="text-neutral-500 text-sm mb-6 max-w-xs">
              This category is being stocked. Check back soon or inquire directly.
            </p>
            <a
              href={`https://wa.me/923286715408?text=Hi, I'm looking for products in the ${displayName} category.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.54 5.875L0 24l6.31-1.516A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.028-1.38l-.36-.214-3.742.899.942-3.636-.234-.375A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
              </svg>
              Inquire on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {sorted.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
