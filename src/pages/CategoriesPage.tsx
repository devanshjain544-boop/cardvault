import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import type { Category } from '../types.js';
import { api } from '../lib/api.js';

interface CategoriesPageProps {
  navigate: (path: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-stone-950 font-serif">Vault Categories</h1>
        <p className="text-sm text-stone-600 mt-1">
          Explore curated card collections, from world-class Pokémon sets to limited Japanese anime prints.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/shop?category=${c.id}`)}
            className="p-6 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors font-serif">
                {c.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                {c.description}
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Browse Category</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
