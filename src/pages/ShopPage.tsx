import React, { useState, useEffect } from 'react';
import { 
  Filter, Search, SlidersHorizontal, X, Sparkles, 
  RotateCcw, ChevronDown, Check 
} from 'lucide-react';
import type { Product, Category } from '../types.js';
import { api } from '../lib/api.js';
import { ProductCard } from '../components/ProductCard.js';

interface ShopPageProps {
  navigate: (path: string) => void;
  initialCategory?: string;
  initialSort?: string;
  initialSearch?: string;
  initialFeatured?: boolean;
}

export const ShopPage: React.FC<ShopPageProps> = ({ 
  navigate, 
  initialCategory, 
  initialSort, 
  initialSearch,
  initialFeatured 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialFeatured || false);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<string>(initialSort || 'newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProductTypes()
    ]).then(([cats, types]) => {
      setCategories(cats);
      setProductTypes(types);
    }).catch(console.error);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        categoryId: selectedCategory || undefined,
        productType: selectedType || undefined,
        brand: selectedBrand || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStockOnly,
        isFeatured: isFeatured ? true : undefined,
        search: searchQuery || undefined,
        sort: sortBy
      });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedType, selectedBrand, inStockOnly, isFeatured, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleApplyPrice = () => {
    fetchProducts();
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedType('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setIsFeatured(false);
    setSearchQuery('');
    setSortBy('newest');
  };

  // Distinct Brands from products
  const availableBrands = ['Pokémon', 'Topps', 'Panini', 'Bandai', 'Konami', 'Upper Deck', 'Weiss Schwarz'];

  const hasActiveFilters = Boolean(
    selectedCategory || selectedType || selectedBrand || minPrice || maxPrice || inStockOnly || isFeatured || searchQuery
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-950 font-serif tracking-tight">
            Vault Collection
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Browse genuine singles, sealed booster boxes, and collector decks priced in INR (₹).
          </p>
        </div>

        {/* Search and Sort Tool Bar */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3 py-2 bg-white border border-stone-300 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Filter className="w-4 h-4 text-amber-600" />
            Filters {hasActiveFilters && '•'}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-stone-300 text-stone-900 text-xs font-semibold py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
            >
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="price-low-to-high">Price: Low to High</option>
              <option value="price-high-to-low">Price: High to Low</option>
              <option value="popular">Popularity & Featured</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2 text-sm font-bold text-stone-900 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" /> Filters
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Search filter input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Search</label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Name, SKU, Series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </form>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Category</label>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  !selectedCategory 
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Type Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Product Type</label>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedType('')}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  !selectedType 
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                All Product Types
              </button>
              {productTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    selectedType === t
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Brand</label>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedBrand('')}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  !selectedBrand
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                All Brands
              </button>
              {availableBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    selectedBrand === b
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Price Range (₹)</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <span className="text-stone-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleApplyPrice}
              className="w-full py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Apply Price
            </button>
          </div>

          {/* Availability & Flags */}
          <div className="pt-2 border-t border-stone-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-amber-500 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-stone-300 text-amber-500 focus:ring-0"
              />
              <span>Featured Vault Grails</span>
            </label>
          </div>
        </aside>

        {/* Products Grid Column */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] bg-stone-100 rounded-2xl animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                {hasActiveFilters ? 'No cards match your filter criteria.' : 'Products are coming soon.'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {hasActiveFilters 
                  ? 'Try broadening your filters or clearing search queries to discover available inventory.' 
                  : 'Our curators are currently inspecting and cataloging fresh authentic collectibles.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 text-xs text-stone-500 flex items-center justify-between">
                <span>Showing <strong className="text-stone-900">{products.length}</strong> collectible items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} navigate={navigate} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-sm font-bold text-stone-900">Filters</span>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory(''); setMobileFilterOpen(false); }}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded ${!selectedCategory ? 'text-amber-700 font-bold bg-amber-50' : 'text-stone-600'}`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategory(c.id); setMobileFilterOpen(false); }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded ${selectedCategory === c.id ? 'text-amber-700 font-bold bg-amber-50' : 'text-stone-600'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <label className="flex items-center gap-2 text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-2">
              <button
                onClick={() => { resetFilters(); setMobileFilterOpen(false); }}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs rounded-lg font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 bg-amber-400 text-stone-950 font-bold text-xs rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
