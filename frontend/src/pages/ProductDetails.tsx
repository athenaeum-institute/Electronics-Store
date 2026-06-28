import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, Truck, BadgeCheck, Star, Minus, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getProductBySlug, getProductsByCategory, supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

interface ProductColor {
  name: string;
  hex_code: string;
  images: string[];
}

interface Product {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  category?: { name: string; slug: string | null } | null;
  images: string[] | null;
  thumbnail_url: string | null;
  model_number: string | null;
  specifications: Record<string, any> | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  warranty: string | null;
  colors: ProductColor[] | null;
  created_at: string | null;
}

// ── Skeleton ──────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin pt-24 pb-16 animate-pulse">
      <div className="flex gap-2 mb-8">
        <div className="h-4 w-10 bg-surface-container rounded" />
        <div className="h-4 w-4 bg-surface-container rounded" />
        <div className="h-4 w-24 bg-surface-container rounded" />
        <div className="h-4 w-4 bg-surface-container rounded" />
        <div className="h-4 w-40 bg-surface-container rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-square bg-surface-container rounded-[24px]" />
          <div className="flex gap-3">
            {[1, 2, 3].map(n => <div key={n} className="w-20 h-20 bg-surface-container rounded-xl flex-shrink-0" />)}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-6 w-24 bg-surface-container rounded-full" />
          <div className="h-10 w-3/4 bg-surface-container rounded-lg" />
          <div className="h-4 w-40 bg-surface-container rounded" />
          <div className="h-8 w-1/2 bg-surface-container rounded-lg" />
          <div className="h-12 w-full bg-surface-container rounded-xl" />
          <div className="h-12 w-full bg-surface-container rounded-xl" />
        </div>
      </div>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────
export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addToCart = useStore(s => s.addToCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specifications' | 'description' | 'warranty'>('specifications');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [activeImage]);

  useEffect(() => {
    if (!slug) return;
    setTimeout(() => {
      setLoading(true);
      setNotFound(false);
      setQuantity(1);
      setActiveTab('specifications');
    }, 0);

    async function fetchData() {
      try {
        const data = await getProductBySlug(slug as string);
        if (!data) { setNotFound(true); return; }
        const p = data as unknown as Product;
        setProduct(p);

        const colors: ProductColor[] = Array.isArray(p.colors) ? p.colors : [];
        if (colors.length > 0) {
          setSelectedColor(colors[0]);
          setActiveImage(colors[0].images?.[0] || p.thumbnail_url || '');
        } else {
          setActiveImage(p.thumbnail_url || p.images?.[0] || '');
        }

        let catSlug = p.category?.slug;
        if (!catSlug && p.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('slug')
            .eq('id', p.category_id)
            .single();
          const slug = (catData as { slug: string | null } | null)?.slug;
          if (slug) catSlug = slug;
        }

        if (catSlug) {
          const related = await getProductsByCategory(catSlug);
          setRelatedProducts((related as any[]).filter((r: any) => r.id !== p.id).slice(0, 4));
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const handleColorSelect = (color: ProductColor) => {
    setSelectedColor(color);
    setImageLoaded(false);
    setTimeout(() => {
      setActiveImage(color.images?.[0] || product?.thumbnail_url || '');
      setImageLoaded(true);
    }, 200);
  };

  const handleThumbnailClick = (url: string) => {
    setImageLoaded(false);
    setTimeout(() => {
      setActiveImage(url);
      setImageLoaded(true);
    }, 150);
  };

  const currentImages: string[] = selectedColor?.images?.length
    ? selectedColor.images
    : (product?.images?.length ? product.images : (product?.thumbnail_url ? [product.thumbnail_url] : []));

  const discountPercent = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in: ${product?.name || ''} (${product?.model_number || ''}) - Color: ${selectedColor?.name || 'Default'}`
  );
  const whatsappUrl = `https://wa.me/923286715408?text=${whatsappText}`;

  if (loading) return <ProductSkeleton />;

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-24">
        <span className="material-symbols-outlined text-5xl text-neutral-300 mb-4">search_off</span>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Product Not Found</h2>
        <p className="text-neutral-500 mb-6 text-center">We couldn't find the product you're looking for.</p>
        <Link to="/" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <main className="bg-surface-container-lowest min-h-screen pt-20 md:pt-24">

      {/* ── SECTION 1: Breadcrumb ─────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin pt-6 pb-4">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 flex-wrap">
          <Link to="/" className="hover:text-neutral-900 transition-colors font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          {product.category?.name && (
            <>
              <span className="font-medium cursor-pointer hover:text-neutral-900 transition-colors">
                {product.category.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            </>
          )}
          <span className="text-neutral-900 font-semibold line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* ── SECTION 2: Main Product Area ─────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* LEFT: Image Gallery */}
          <div className="lg:sticky lg:top-28">
            {/* Main Image */}
            <div className="relative aspect-square bg-surface-container-low rounded-[24px] overflow-hidden bento-card-shadow mb-4">
              {/* Warranty Badge */}
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 bento-card-shadow">
                <Shield className="w-3.5 h-3.5 text-neutral-700" />
                <span className="text-xs font-semibold text-neutral-700">Official Haier Warranty</span>
              </div>

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                  <span className="bg-neutral-900 text-white text-sm font-bold px-6 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}

              {imgError || !activeImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-2xl">
                  <span className="text-6xl font-bold text-gray-300">
                    {product.name ? product.name.charAt(0).toUpperCase() : 'P'}
                  </span>
                  <span className="text-sm text-gray-400 mt-2">{product.model_number}</span>
                </div>
              ) : (
                <img
                  src={activeImage}
                  alt={product.name}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-contain p-8 transition-all duration-300 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'}`}
                />
              )}
            </div>

            {/* Thumbnails */}
            {currentImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {currentImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => handleThumbnailClick(url)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-surface-container border-2 transition-all duration-200 ${
                      activeImage === url ? 'border-primary scale-95' : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}

            {/* Color Selector (Gallery side) */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-600 mb-3">
                  Color: <span className="font-semibold text-neutral-900">{selectedColor?.name}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      title={color.name}
                      onClick={() => handleColorSelect(color)}
                      className={`w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 ${
                        selectedColor?.name === color.name
                          ? 'ring-2 ring-offset-2 ring-primary scale-105'
                          : 'ring-1 ring-neutral-200'
                      }`}
                      style={{ backgroundColor: color.hex_code }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col gap-5">
            {/* Category Badge */}
            {product.category?.name && (
              <span className="inline-flex items-center self-start px-3 py-1 bg-surface-container border border-primary/10 rounded-full text-xs font-semibold text-neutral-600 tracking-wide uppercase">
                {product.category.name}
              </span>
            )}

            {/* Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight text-neutral-900 leading-tight">
                {product.name}
              </h1>
              {product.model_number && (
                <p className="text-sm text-neutral-500 mt-1.5 font-medium">Model: {product.model_number}</p>
              )}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm text-neutral-500 font-medium">(Official Haier Product)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-neutral-900">
                Rs. {product.price?.toLocaleString()}
              </span>
              {product.original_price && (
                <>
                  <span className="text-lg text-neutral-400 line-through font-normal">
                    Rs. {product.original_price.toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Color Selector (Info side — synced) */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-3">
                  Color: <span className="font-semibold text-neutral-900">{selectedColor?.name}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      title={color.name}
                      onClick={() => handleColorSelect(color)}
                      className={`w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 ${
                        selectedColor?.name === color.name
                          ? 'ring-2 ring-offset-2 ring-primary scale-105'
                          : 'ring-1 ring-neutral-200'
                      }`}
                      style={{ backgroundColor: color.hex_code }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 flex items-center justify-center text-neutral-600 hover:bg-surface-container transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity || 99, q + 1))}
                    disabled={isOutOfStock || quantity >= product.stock_quantity}
                    className="w-11 h-11 flex items-center justify-center text-neutral-600 hover:bg-surface-container transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                  <span className="text-sm text-amber-600 font-medium">Only {product.stock_quantity} left!</span>
                )}
                {isOutOfStock && (
                  <span className="text-sm text-red-500 font-medium">Out of stock</span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <button
                disabled={isOutOfStock}
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    thumbnail_url: selectedColor?.images?.[0] || product.thumbnail_url,
                    model_number: product.model_number,
                  }, quantity);
                  toast.success(`${product.name} added to bag`);
                }}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-sm hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-white"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.54 5.875L0 24l6.31-1.516A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.028-1.38l-.36-.214-3.742.899.942-3.636-.234-.375A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
                </svg>
                Inquire on WhatsApp
              </a>
            </div>

            {/* Trust Info Rows */}
            <div className="border-t border-surface-container-highest pt-5 flex flex-col gap-3.5">
              {product.warranty && (
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-neutral-700" />
                  </div>
                  <span>{product.warranty}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-neutral-700" />
                </div>
                <span>Free Delivery in Lahore</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-4 h-4 text-neutral-700" />
                </div>
                <span>Haier Official Store — Saddar Cantt, Lahore</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Tabs ─────────────────────────────────────────── */}
      <div className="border-t border-surface-container-highest bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin">
          {/* Tab Bar */}
          <div className="flex gap-0 overflow-x-auto border-b border-surface-container-highest">
            {(['specifications', 'description', 'warranty'] as const).map((tab) => {
              const labels: Record<string, string> = {
                specifications: 'Specifications',
                description: 'Description',
                warranty: 'Warranty & Support',
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all -mb-px ${
                    activeTab === tab
                      ? 'border-primary text-neutral-900'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {/* Specifications */}
            {activeTab === 'specifications' && (
              <div>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="rounded-[16px] overflow-hidden border border-surface-container-highest max-w-2xl">
                    {Object.entries(product.specifications).map(([key, value], i) => (
                      <div
                        key={key}
                        className={`grid grid-cols-2 gap-4 px-5 py-3.5 text-sm ${
                          i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'
                        }`}
                      >
                        <span className="font-medium text-neutral-600">{key}</span>
                        <span className="text-neutral-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-sm">Specifications coming soon.</p>
                )}
              </div>
            )}

            {/* Description */}
            {activeTab === 'description' && (
              <div className="max-w-2xl">
                {product.description ? (
                  <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-sm">Description coming soon.</p>
                )}
              </div>
            )}

            {/* Warranty & Support */}
            {activeTab === 'warranty' && (
              <div className="max-w-2xl space-y-4">
                {product.warranty && (
                  <div className="bg-surface-container-lowest border border-surface-container-highest rounded-[16px] p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-4 h-4 text-neutral-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1">Warranty Coverage</h4>
                        <p className="text-sm text-neutral-600">{product.warranty}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-surface-container-lowest border border-surface-container-highest rounded-[16px] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BadgeCheck className="w-4 h-4 text-neutral-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">Official Service Center</h4>
                      <p className="text-sm text-neutral-600">Official Haier Warranty — Saddar Cantt Service Center, Lahore, Pakistan</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest border border-surface-container-highest rounded-[16px] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.54 5.875L0 24l6.31-1.516A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.028-1.38l-.36-.214-3.742.899.942-3.636-.234-.375A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">Book a Service Appointment</h4>
                      <p className="text-sm text-neutral-600 mb-3">Get support or book a service appointment directly via WhatsApp.</p>
                      <a
                        href="https://wa.me/923286715408?text=Hi, I need to book a service appointment for my Haier product."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.54 5.875L0 24l6.31-1.516A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.028-1.38l-.36-.214-3.742.899.942-3.636-.234-.375A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
                        </svg>
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Related Products ─────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin">
          <div className="mt-12 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.map((related) => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/product/${related.slug}`)}
                  className="cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center p-4 relative">
                    {related.thumbnail_url ? (
                      <img
                        src={related.thumbnail_url}
                        alt={related.name}
                        className="w-full h-full object-contain relative z-10"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span className="text-4xl font-bold text-gray-200 absolute">
                      {related.name ? related.name.charAt(0).toUpperCase() : ''}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{related.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{related.model_number}</p>
                    <p className="text-base font-bold text-gray-900 mt-2">
                      Rs. {related.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
