import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '../types.js';
import { api } from '../lib/api.js';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, navigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const prods = await api.getProducts({ search: query.trim() });
        setResults(prods.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (product: Product) => {
    onClose();
    navigate(`/product/${product.slug || product.id}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-20">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Vault Catalog Quick Search
          </span>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            autoFocus
            placeholder="Search cards, sets, booster boxes, PSA grades, SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
          {loading ? (
            <p className="text-xs text-stone-500 py-6 text-center">Searching vault archives...</p>
          ) : results.length > 0 ? (
            results.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelect(p)}
                className="py-3 px-2 flex items-center justify-between hover:bg-stone-50 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=100&q=80'}
                    alt=""
                    className="w-10 h-12 object-contain bg-stone-50 rounded border border-stone-200 p-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-900 line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-stone-500">
                      {p.brand} • <span className="text-amber-700 font-semibold">{p.condition}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-950 font-serif">
                  ₹{(p.salePrice || p.price).toLocaleString('en-IN')}
                </span>
              </div>
            ))
          ) : query.trim() ? (
            <p className="text-xs text-stone-500 py-6 text-center">No collectibles found matching "{query}".</p>
          ) : (
            <div className="py-6 text-center space-y-1 text-xs text-stone-500">
              <p>Try searching: "Charizard", "One Piece", "Booster Box", "Cricket", "PSA 10"</p>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <button
            onClick={handleViewAll}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            View all results in Shop <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
