
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Category, Product } from '../types';
import { api } from '../api';

const WARMUP_PREFERENCE_KEY = 'codersvoice:marketplace-warmup-enabled';
const MARKETPLACE_FILTERS = ['All', 'Web Dev Projects', 'Creator Bundle', 'Digital Products', 'Landing Pages', 'Software', 'SaaS Product', 'Fun Websites'] as const;
const FREE_GIFT_FILTER = 'Free Gift';
const normalizeCategory = (category: string) => {
  const normalized = String(category || '').trim().replace(/\s+/g, ' ');
  const key = normalized.toLowerCase();
  const aliases: Record<string, string> = {
    'creator bundle': 'Creator Bundle',
    'creator bundles': 'Creator Bundle',
    'saas product': 'SaaS Product',
    'saas products': 'SaaS Product',
  };

  return aliases[key] || MARKETPLACE_FILTERS.find((item) => item.toLowerCase() === key) || normalized;
};
const getCachedWarmupPreference = () => {
  try {
    return window.localStorage.getItem(WARMUP_PREFERENCE_KEY) !== 'false';
  } catch {
    return true;
  }
};

const MarketplaceWarmupOverlay: React.FC<{ finishing: boolean }> = ({ finishing }) => {
  const messages = [
    'Waking up the marketplace',
    'Curating trending developer assets',
    'Preparing secure product details',
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setMessageIndex((current) => (current + 1) % messages.length), 2400);
    return () => window.clearInterval(interval);
  }, [messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preparing the CodersVoice marketplace"
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-slate-950/80 px-5 py-10 backdrop-blur-xl transition-all duration-300 ${finishing ? 'pointer-events-none scale-[1.02] opacity-0' : 'opacity-100'}`}
    >
      <div aria-hidden="true" className="cv-warmup-orbit cv-warmup-orbit-one" />
      <div aria-hidden="true" className="cv-warmup-orbit cv-warmup-orbit-two" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-blue-300/20 bg-slate-950/80 p-7 text-center shadow-2xl shadow-blue-950/60 sm:p-10">
        <div aria-hidden="true" className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="mx-auto flex h-44 w-52 items-center justify-center">
          <svg viewBox="0 0 240 180" className="h-full w-full overflow-visible" fill="none">
            <path className="cv-warmup-road" d="M20 144h200" />
            <path className="cv-warmup-cart-stroke" d="M44 44h23l15 67h86l17-45H76" />
            <path className="cv-warmup-cart-stroke cv-warmup-cart-detail" d="M92 83h83M111 111l-5 15m45-15 5 15" />
            <circle className="cv-warmup-wheel cv-warmup-wheel-left" cx="104" cy="135" r="12" />
            <circle className="cv-warmup-wheel cv-warmup-wheel-right" cx="158" cy="135" r="12" />
            <rect className="cv-warmup-package" x="113" y="37" width="42" height="38" rx="6" />
            <path className="cv-warmup-package-mark" d="M134 37v38m-21-19h42" />
            <path className="cv-warmup-spark cv-warmup-spark-one" d="m178 42 5 5 8-10" />
            <path className="cv-warmup-spark cv-warmup-spark-two" d="m64 73 4 4 7-9" />
          </svg>
        </div>
        <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">CodersVoice marketplace</p>
        <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Finding the good stuff…</h2>
        <p className="mt-3 min-h-6 text-sm font-medium text-slate-300 transition-opacity">{messages[messageIndex]}</p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-400">Please wait while we arrange today’s trending projects, tools, and creator bundles for you.</p>
        <div className="mx-auto mt-7 flex w-32 justify-between" aria-hidden="true">
          <span className="cv-warmup-dot" />
          <span className="cv-warmup-dot cv-warmup-dot-delay-one" />
          <span className="cv-warmup-dot cv-warmup-dot-delay-two" />
        </div>
      </div>
    </div>
  );
};

const Store: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') as Category | null;
  const warmupPreview = import.meta.env.DEV && queryParams.get('warmupPreview') === '1';

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [warmupVisible, setWarmupVisible] = useState(false);
  const [warmupFinishing, setWarmupFinishing] = useState(false);
  const [warmupEnabled] = useState(getCachedWarmupPreference);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>(initialCategory || 'All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popularity'>('newest');

  const categories = [
    ...MARKETPLACE_FILTERS,
    FREE_GIFT_FILTER,
    ...products
      .map((product) => normalizeCategory(product.category))
      .filter((category, index, all) => !MARKETPLACE_FILTERS.includes(category as typeof MARKETPLACE_FILTERS[number]) && category !== FREE_GIFT_FILTER && all.indexOf(category) === index),
  ] as (Category | 'All')[];

  useEffect(() => {
    let active = true;
    let awaitingCatalogue = true;
    const startedAt = Date.now();
    const warmupDelay = window.setTimeout(() => {
      if (active && awaitingCatalogue && warmupEnabled) setWarmupVisible(true);
    }, 1250);
    if (warmupPreview) setWarmupVisible(true);

    api<{ items: Product[]; marketplaceWarmupEnabled?: boolean }>('/api/products?limit=100&sort=featured')
      .then((data) => {
        if (!active) return;
        setProducts(data.items);
        try {
          window.localStorage.setItem(WARMUP_PREFERENCE_KEY, data.marketplaceWarmupEnabled === false ? 'false' : 'true');
        } catch {
          // Storage can be unavailable in private browsing; the loader still works.
        }
      })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => {
        awaitingCatalogue = false;
        window.clearTimeout(warmupDelay);
        if (!active) return;
        const remainingPreviewTime = warmupPreview ? Math.max(0, 2800 - (Date.now() - startedAt)) : 0;
        window.setTimeout(() => {
          if (!active) return;
          setLoading(false);
          setWarmupFinishing(true);
          window.setTimeout(() => {
            if (!active) return;
            setWarmupVisible(false);
            setWarmupFinishing(false);
          }, 340);
        }, remainingPreviewTime);
      });

    return () => {
      active = false;
      window.clearTimeout(warmupDelay);
    };
  }, [warmupEnabled, warmupPreview]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All'
        || (activeCategory === FREE_GIFT_FILTER ? p.isFree === true : normalizeCategory(p.category) === activeCategory);
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, activeCategory, sortBy]);

  return (
    <>
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-4">The <span className="neon-text">Marketplace</span></h1>
          <p className="text-slate-400">High-quality assets for high-quality builders.</p>
        </div>

        {/* Filters Bar */}
        <div className="glass p-6 rounded-3xl mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between border-white/5">
          <div className="relative w-full lg:w-96">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-blue-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-48">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? <div className="text-center py-24 text-slate-400">Loading products…</div> : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass rounded-[40px]">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
            <p className="text-slate-500">Try adjusting your filters or search keywords.</p>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('All');}}
              className="mt-6 text-blue-400 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
    {warmupVisible && <MarketplaceWarmupOverlay finishing={warmupFinishing} />}
    </>
  );
};

export default Store;
