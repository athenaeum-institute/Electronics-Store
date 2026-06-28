import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getCategories } from '../lib/supabase';
import type { Category } from '../lib/supabase';

// Skeleton card
function CategoryCardSkeleton() {
  return (
    <div className="aspect-[4/3] rounded-[20px] bg-surface-container animate-pulse" />
  );
}

// Category card
function CategoryCard({ cat }: { cat: Category }) {
  const initial = cat.name.charAt(0).toUpperCase();
  return (
    <Link
      to={`/category/${cat.slug || encodeURIComponent(cat.name)}`}
      className="group block relative aspect-[4/3] rounded-[20px] overflow-hidden bento-card-shadow hover:scale-[1.02] transition-all duration-300"
    >
      {/* Background Image or Placeholder */}
      {cat.image_url ? (
        <img
          src={cat.image_url}
          alt={cat.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
          <span className="text-6xl font-bold text-white/10">{initial}</span>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-lg leading-tight">{cat.name}</h3>
        {cat.description && (
          <p className="text-white/70 text-xs mt-1 line-clamp-1">{cat.description}</p>
        )}
        <div className="flex items-center gap-1 mt-2 text-white/60 text-xs font-medium group-hover:text-white/90 transition-colors">
          Shop now
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCategories();
        setCategories(data as Category[]);
      } catch {
        // fetch failed silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="bg-surface-container-lowest min-h-screen pt-20 md:pt-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin pt-6 pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-neutral-900 transition-colors font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-neutral-900 font-semibold">All Categories</span>
        </nav>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold tracking-tight text-neutral-900 leading-tight">
            Shop by Category
          </h1>
          <p className="text-neutral-500 mt-2 text-sm md:text-base max-w-lg leading-relaxed">
            Explore Pakistan's finest Haier collection — genuine products, official warranty.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-5xl text-neutral-300 mb-4">category</span>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">No categories yet</h2>
            <p className="text-neutral-500 text-sm mb-6">Categories will appear here once they're added.</p>
            <a
              href="https://wa.me/923286715408?text=Hi, I'd like to know more about your product categories."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              Ask on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map(cat => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
