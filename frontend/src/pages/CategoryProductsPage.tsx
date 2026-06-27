import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getProductsByCategory, getCategories } from '../lib/supabase';
import { useStore } from '../store/useStore';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

// Product Card Skeleton — identical dimensions to real cards
function ProductCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-3 rounded-[24px] bento-card-shadow animate-pulse">
      <div className="h-40 bg-surface-container rounded-xl mb-3" />
      <div className="flex gap-1.5 mb-2 flex-wrap">
        <div className="h-4 w-12 bg-surface-container rounded-full" />
      </div>
      <div className="h-4 bg-surface-container rounded-md w-3/4 mb-1" />
      <div className="h-5 bg-surface-container rounded-md w-1/2 mb-3" />
      <div className="h-8 bg-surface-container rounded-xl" />
    </div>
  );
}

// Product card — exact same style as FeaturedProducts
function ProductCard({ product }: { product: any }) {
  const addToCart = useStore(s => s.addToCart);
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="bg-surface-container-lowest p-3 rounded-[24px] bento-card-shadow group transition-all hover:scale-[1.01] flex flex-col h-full">
      <Link to={product.slug ? `/product/${product.slug}` : '#'} className="block flex-grow">
        <div className="h-40 bg-surface-container rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3">
          <img
            className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
            alt={product.name}
            src={product.thumbnail_url || 'https://placehold.co/400x400?text=No+Image'}
          />
        </div>
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {product.category?.name && (
            <span className="px-2 py-0.5 border border-primary/10 rounded-full font-label-sm text-xs text-neutral-500">
              {product.category.name}
            </span>
          )}
          {product.model_number && (
            <span className="px-2 py-0.5 border border-primary/10 rounded-full font-label-sm text-xs text-neutral-500 truncate max-w-[100px] inline-block align-bottom">
              {product.model_number}
            </span>
          )}
        </div>
        <h4 className="font-semibold text-sm text-primary mb-1 leading-snug line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
          <p className="text-primary font-bold text-base">
            Rs. {product.price?.toLocaleString()}
          </p>
          {product.original_price && (
            <>
              <span className="text-xs text-neutral-400 line-through font-normal">
                Rs. {product.original_price.toLocaleString()}
              </span>
              <span className="bg-red-100 text-red-600 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
        {product.warranty && (
          <div className="flex items-center gap-1 mt-1.5 mb-1">
            <Shield className="w-3 h-3 text-neutral-400 flex-shrink-0" />
            <span className="text-xs text-neutral-400 truncate max-w-full block">{product.warranty}</span>
          </div>
        )}
      </Link>
      <div className="mt-3 mt-auto">
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
          className="w-full bg-primary text-on-primary py-1.5 rounded-xl font-label-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

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
      } catch (err) {
        console.error(err);
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
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-neutral-900 transition-colors font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link to="/categories" className="hover:text-neutral-900 transition-colors font-medium">Categories</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-neutral-900 font-semibold capitalize">{displayName}</span>
        </nav>

        {/* Heading + Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-[36px] font-bold tracking-tight text-neutral-900 leading-tight capitalize">
              {displayName}
              {!loading && (
                <span className="text-neutral-400 font-normal text-xl ml-2">
                  ({products.length})
                </span>
              )}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Official Haier products — genuine warranty</p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-grid-gutter">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-grid-gutter">
            {sorted.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
