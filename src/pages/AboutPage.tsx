import React from 'react';
import { ShieldCheck, PackageCheck, Award, Lock, Sparkles, Building, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> CARDVAULT COLLECTIBLES
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-950 font-serif tracking-tight">
          Built By Collectors, For Collectors.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          CardVault was founded in Mumbai, India with a singular commitment: solving the trust deficit in the collectible cards ecosystem.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-stone-200 space-y-6 shadow-xs">
        <h2 className="text-xl font-bold text-stone-950 font-serif">The CardVault Standard</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          For years, card enthusiasts in India had to navigate unreliable grey market imports, risks of factory resealed booster boxes, and uninspected singles sent in flimsy standard envelopes that arrived creased and damaged.
        </p>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          CardVault redefines the entire journey: from guaranteed authentic sourcing and professional optical grading inspections to armored rigid shipping that guarantees your collectible arrives in pristine gem-mint condition.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Counterfeit-Zero Verification</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every card undergoes forensic checks for rosette dot patterns, card stock density, UV luminescence, and surface holo foil texture before listing.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Armored Packaging</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Cards are double-sleeved in penny sleeves and rigid magnetic top-loaders, sandwiched between reinforced corrugated buffers inside custom-molded boxes.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-stone-950 font-serif">Explore The Vault</h3>
          <p className="text-xs text-stone-600 mt-1">Discover freshly cataloged booster boxes and rare graded cards.</p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          View Collection
        </button>
      </div>
    </div>
  );
};
