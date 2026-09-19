import React, { useState } from 'react';
import { 
  X, UploadCloud, Trash2, Image as ImageIcon, Star, Sparkles, 
  Layers, Package, ShieldCheck, AlertCircle, Loader2, Tag, Plus 
} from 'lucide-react';
import { api } from '../../lib/api.js';
import type { Product, Category, ProductStatus } from '../../types.js';

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSaved
}) => {
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || 'cat-pokemon');
  const [productType, setProductType] = useState(product?.productType || 'Single Card');
  const [brand, setBrand] = useState(product?.brand || 'Pokémon');
  const [series, setSeries] = useState(product?.series || 'Scarlet & Violet');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [salePrice, setSalePrice] = useState(product?.salePrice?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '1');
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold?.toString() || '2');
  const [sku, setSku] = useState(product?.sku || '');
  const [condition, setCondition] = useState(product?.condition || 'Factory Sealed');
  const [gradingStatus, setGradingStatus] = useState(product?.gradingStatus || 'Raw / Authenticated');
  const [finish, setFinish] = useState(product?.finish || 'Holo / Foil');
  const [rarity, setRarity] = useState(product?.rarity || 'Ultra Rare');
  const [description, setDescription] = useState(product?.description || '');
  const [images, setImages] = useState<string[]>(product?.images && product.images.length > 0 ? product.images : []);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [status, setStatus] = useState<ProductStatus>(product?.status || 'published');
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate a standardized professional SKU if empty
  const generateSku = () => {
    let prefix = 'CV';
    if (productType.includes('Box')) prefix = 'CV-BOX';
    else if (productType.includes('Pack')) prefix = 'CV-PCK';
    else if (productType.includes('Deck')) prefix = 'CV-DCK';
    else if (productType.includes('Tin') || productType.includes('Bundle')) prefix = 'CV-TIN';
    else if (brand.toLowerCase().includes('poke')) prefix = 'CV-PKM';
    else if (brand.toLowerCase().includes('sport') || brand.toLowerCase().includes('topps')) prefix = 'CV-SPT';
    else prefix = 'CV-CRD';

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${randomNum}`);
  };

  // Set default SKU on initial render if creating a new product
  React.useEffect(() => {
    if (!product && !sku) {
      generateSku();
    }
  }, []);

  // Update default condition based on product type
  const handleTypeChange = (newType: string) => {
    setProductType(newType);
    if (!product) {
      if (newType.includes('Box') || newType.includes('Pack') || newType.includes('Deck')) {
        setCondition('Factory Sealed');
        setGradingStatus('Unopened Vault Stock');
      } else if (newType.includes('Single Card')) {
        setCondition('Near Mint / Mint');
        setGradingStatus('PSA 10');
      }
    }
  };

  // Multiple File Upload from Device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const newUploadedImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check file size (cap at 10MB per image)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 10MB limit.`);
        continue;
      }

      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload through the secure server upload endpoint
        const uploadRes = await api.admin.uploadImage(dataUrl, file.name);
        if (uploadRes.url) {
          newUploadedImages.push(uploadRes.url);
        } else {
          // Fallback to dataUrl directly if needed
          newUploadedImages.push(dataUrl);
        }
      } catch (err: any) {
        console.error('Failed to upload image:', err);
        setError(`Upload failed for "${file.name}": ${err.message}`);
      }
    }

    if (newUploadedImages.length > 0) {
      setImages((prev) => [...prev, ...newUploadedImages]);
    }
    setUploading(false);
    // Reset file input
    e.target.value = '';
  };

  // Manual URL image addition
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [item, ...rest];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a product title.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Please enter a valid price greater than ₹0.');
      return;
    }
    if (!sku.trim()) {
      setError('Please provide a unique SKU.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        categoryId,
        productType,
        brand: brand.trim(),
        series: series.trim(),
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        stock: Math.max(0, parseInt(stock, 10) || 0),
        lowStockThreshold: Math.max(1, parseInt(lowStockThreshold, 10) || 2),
        sku: sku.trim().toUpperCase(),
        condition: condition.trim(),
        rarity: rarity.trim(),
        gradingStatus: gradingStatus.trim(),
        finish: finish.trim(),
        description: description.trim(),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80'],
        isFeatured,
        status
      };

      if (product) {
        await api.admin.updateProduct(product.id, payload);
      } else {
        await api.admin.createProduct(payload as any);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error saving product to database');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl text-stone-900 my-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                {product ? 'Catalog Editor' : 'New Listing'}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                {productType}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-950 font-serif tracking-tight mt-1">
              {product ? `Edit Collectible: ${product.name}` : 'List Card, Booster Box, Deck, or Single Pack'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* SECTION 1: Product Title & Type */}
          <div className="space-y-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Product Title / Listing Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 2023 Charizard ex #199 SIR / Pokémon 151 Booster Bundle 6-Pack"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Product Type *
                </label>
                <select
                  value={productType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Single Card">Single Card (Graded / Raw)</option>
                  <option value="Booster Box">Booster Box (Factory Sealed)</option>
                  <option value="Booster Pack">Booster Pack (Single Packet)</option>
                  <option value="Card Deck">Card Deck (Starter / Battle)</option>
                  <option value="Collection Box">Collection Box / ETB</option>
                  <option value="Tin / Bundle">Tin / Blister Bundle</option>
                  <option value="Accessories">Accessories & Sleeves</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Brand / Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Pokémon, Topps, Panini, Bandai"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Pricing & Inventory */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                Commercials & Vault Stock
              </span>
              <span className="text-[11px] text-stone-500">
                INR (₹) pricing
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Regular Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2999"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Sale Price (₹) <span className="text-stone-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Leave blank if none"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Stock Units (Qty) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-700 font-bold">SKU *</label>
                  <button
                    type="button"
                    onClick={generateSku}
                    className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold underline cursor-pointer"
                  >
                    Auto
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Multi-Photo Device Uploader */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-stone-800 font-bold">
                  Product Photos ({images.length} added)
                </label>
                <p className="text-[11px] text-stone-500">
                  Upload multiple photos from your device (front, back, corner angles, holo shine).
                </p>
              </div>
              {images.length > 0 && (
                <span className="text-[11px] font-semibold text-amber-700">
                  First photo is the cover photo
                </span>
              )}
            </div>

            {/* Drag & Drop / Device Upload Area */}
            <div className="border-2 border-dashed border-stone-300 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/20 rounded-2xl p-4 sm:p-6 text-center transition-colors relative cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-11 h-11 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs font-bold text-stone-800">
                  {uploading ? 'Processing & saving photos...' : 'Click or Drag photos from your phone/computer to upload'}
                </p>
                <p className="text-[11px] text-stone-500">
                  Supports JPG, PNG, WEBP • Select multiple files at once
                </p>
              </div>
            </div>

            {/* Manual URL Input Alternative */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste an image web URL (e.g. https://...)"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                disabled={!imageUrlInput.trim()}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer"
              >
                Add URL
              </button>
            </div>

            {/* Uploaded Images Strip */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl border border-stone-200 bg-stone-100 overflow-hidden aspect-square flex items-center justify-center shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product photo ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                      referrerPolicy="no-referrer"
                    />
                    {idx === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-amber-400 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                        Cover
                      </div>
                    )}
                    <div className="absolute inset-0 bg-stone-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          title="Set as Cover"
                          className="p-1.5 bg-white hover:bg-amber-400 text-stone-900 rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove"
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: Collector Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Condition
              </label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Factory Sealed, Gem Mint 10"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Grading Status
              </label>
              <input
                type="text"
                value={gradingStatus}
                onChange={(e) => setGradingStatus(e.target.value)}
                placeholder="PSA 10, Raw, Sealed"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Finish / Foil
              </label>
              <input
                type="text"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                placeholder="Holo, Secret Rare, Factory Shrink"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Series / Set
              </label>
              <input
                type="text"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                placeholder="Scarlet & Violet 151, Topps Chrome"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* SECTION 5: Description */}
          <div>
            <label className="block text-stone-700 font-bold mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe set details, pack counts, card authenticity, tamper seals..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* SECTION 6: Status & Featured */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-stone-100 border border-stone-200">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 border-stone-300 focus:ring-amber-400"
              />
              <span className="font-bold text-stone-900">
                Feature on Vault Homepage & Showcase
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-700">Visibility Status:</span>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="published">Published (Visible to Customers)</option>
                <option value="draft">Draft (Hidden in Admin)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-7 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Listing...
                </>
              ) : (
                'Publish / Save Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
