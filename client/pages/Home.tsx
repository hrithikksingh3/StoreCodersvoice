
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS, SERVICES, FAQS } from '../constants';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { api } from '../api';


const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  useEffect(() => { api<{items: Product[]}>('/api/products?limit=100&sort=featured').then((data) => { setProducts(data.items); setFeaturedProducts(data.items.slice(0, 3)); }).catch(() => { setProducts([]); setFeaturedProducts([]); }); }, []);

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full glass border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
            New Products Dropped
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">
            CodersVoice — Digital <br />
            <span className="neon-text">Products & Projects</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
            Ready-made projects, high-converting templates, and viral-ready bundles to build faster and grow your developer career.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/store" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
              Open Marketplace
            </Link>
            <Link to="/services" className="w-full sm:w-auto px-8 py-4 rounded-xl glass hover:bg-slate-800 text-white font-bold text-lg transition-all">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative border-y border-slate-900/50 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { label: 'Community Members', value: '100k+' },
              { label: 'Products Delivered', value: '1000+' },
              { label: 'Brand Collabs', value: '200+' }
            ].map((stat, idx) => (
              <div key={idx} className="glass p-8 rounded-3xl text-center border-white/5 transition-transform hover:-translate-y-1">
                <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Explore Categories</h2>
            <p className="text-slate-400">Find exactly what you need to scale your project.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* {[
              { name: 'Web Dev Projects', icon: '🚀', count: '12 Items', color: 'from-blue-600/20 to-cyan-500/20' },
              { name: 'Landing Pages', icon: '🎨', count: '8 Items', color: 'from-purple-600/20 to-pink-500/20' },
              { name: 'Fun Websites', icon: '✨', count: '6 Items', color: 'from-orange-600/20 to-yellow-500/20' },
              { name: 'Creator Bundles', icon: '📹', count: '5 Items', color: 'from-green-600/20 to-emerald-500/20' }
            ].map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/store?category=${encodeURIComponent(cat.name)}`} 
                className={`group relative overflow-hidden glass p-8 rounded-3xl border-white/5 bg-gradient-to-br ${cat.color} transition-all hover:scale-[1.02] active:scale-95`}
              >
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{cat.count}</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))} */}
            {[
  { name: 'Web Dev Projects', icon: '🚀', color: 'from-blue-600/20 to-cyan-500/20' },
  { name: 'Landing Pages', icon: '🎨', color: 'from-purple-600/20 to-pink-500/20' },
  { name: 'Fun Websites', icon: '✨', color: 'from-orange-600/20 to-yellow-500/20' },
  { name: 'Creator Bundles', icon: '📹', color: 'from-green-600/20 to-emerald-500/20' }
].map((cat, idx) => {
  const count = products.filter((p) => p.category === cat.name).length;

  return (
    <Link
      key={idx}
      to={`/store?category=${encodeURIComponent(cat.name)}`}
      className={`group relative overflow-hidden glass p-8 rounded-3xl border-white/5 bg-gradient-to-br ${cat.color} transition-all hover:scale-[1.02] active:scale-95`}
    >
      <div className="text-4xl mb-4">{cat.icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {count} {count === 1 ? "Item" : "Items"}
        </span>

        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
})}

          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-4">Trending Now</h2>
              <p className="text-slate-400">Our most loved digital assets this month.</p>
            </div>
            <Link to="/store" className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center">
              View Entire Marketplace <span className="ml-2">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Want Something <br />
                <span className="neon-text">Custom Built?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                We don't just sell templates. Our team of expert developers and designers can build your dream project from scratch. From complex web apps to viral marketing tools.
              </p>
              <div className="space-y-6 mb-10">
                {SERVICES.map(service => (
                  <div key={service.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl glass border-blue-500/20 flex items-center justify-center text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{service.title}</h4>
                      <p className="text-slate-500 text-sm">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/contact" className="inline-block px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all">
                Work With Us
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[80px]"></div>
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85"
                alt="Creative and technology team collaborating on a client project"
                className="relative aspect-square w-full object-cover rounded-3xl glass border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">Trusted by 1000+ Customers</h2>
            <div className="flex justify-center items-center space-x-1 mb-8">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
              <div key={t.id} className="glass p-8 rounded-3xl border-white/5 italic">
                <p className="text-slate-300 mb-8 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-blue-500/30" />
                  <div>
                    <h4 className="text-white font-bold not-italic">{t.name}</h4>
                    <p className="text-slate-500 text-xs not-italic">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Common Questions</h2>
            <p className="text-slate-400">Everything you need to know about our products.</p>
          </div>
          <div className="space-y-4">
            {FAQS.slice(0, 4).map((faq, index) => (
              <div 
                key={index} 
                className={`glass rounded-2xl border-white/5 transition-all duration-300 overflow-hidden ${activeFaqIndex === index ? 'border-blue-500/30' : ''}`}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-white">{faq.question}</span>
                  <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeFaqIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${activeFaqIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/faq" className="text-blue-400 font-bold hover:underline">View all FAQs →</Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass p-12 md:p-16 rounded-[40px] border-blue-500/20 text-center relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1.5c-5.8 0-10.5 4.7-10.5 10.5s4.7 10.5 10.5 10.5 10.5-4.7 10.5-10.5-4.7-10.5-10.5-10.5zm0 18.75c-4.55 0-8.25-3.7-8.25-8.25s3.7-8.25 8.25-8.25 8.25 3.7 8.25 8.25-3.7 8.25-8.25 8.25z"/></svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6">Build Faster Today.</h2>
            <p className="text-slate-400 text-lg mb-10">
              Subscribe to get notified about new free resources, early-bird pricing, and exclusive tutorials.
            </p>
            {/* <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input 
                type="email" 
                placeholder="Enter your best email" 
                className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                Join Community
              </button>
            </form> */}
            {/* Beehiiv Subscribe Form (Embed) */}
<div className="max-w-xl mx-auto flex justify-center">
  <iframe
    src="https://subscribe-forms.beehiiv.com/fb3d78e1-bcaa-4d3a-b9fc-a361ee001ad2"
    className="beehiiv-embed"
    data-test-id="beehiiv-embed"
    frameBorder={0}
    scrolling="no"
    style={{
      width: "463px",
      height: "109px",
      margin: 0,
      borderRadius: "0px",
      backgroundColor: "transparent",
      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      maxWidth: "100%",
    }}
  />
</div>


          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
