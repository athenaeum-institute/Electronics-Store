import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSearchResults } from '../lib/supabase';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        setQuery('');
        setResults([]);
      }, 0);
    }
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const data = await getSearchResults(query.trim());
      setResults(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Search Products</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Haier products..."
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-surface-container-highest rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400 font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : query.trim().length >= 2 && results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500 font-medium">No products found for '{query}'</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center p-2 flex-shrink-0">
                    <img 
                      src={product.thumbnail_url || 'https://placehold.co/40x40?text=No+Image'} 
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">{product.name}</h4>
                    {product.model_number && (
                      <p className="text-xs text-neutral-500 truncate">{product.model_number}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
