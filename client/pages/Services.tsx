
import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';

const serviceIcons: Record<string, string> = {
  code: '💻',
  layout: '💹',
  video: '🎥',
  cpu: '🤖',
  marketing: '📈',
  design: '🎨',
  brand: '✨',
  software: '🧩',
  integration: '🔗',
  aiVisibility: '🔎',
  performance: '⚡',
  consulting: '🧭',
  collaboration: '🤝',
};

const Services: React.FC = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-8xl font-black mb-6">Our <span className="neon-text">Services</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Beyond templates, we offer premium custom development and creative services to scale your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {SERVICES.map((service) => (
            <div key={service.id} className="glass p-12 rounded-[40px] border-white/5 group hover:neon-glow transition-all">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="text-3xl">
                  {serviceIcons[service.icon] || '✨'}
                </span>
              </div>
              <h3 className="text-3xl font-black mb-4 text-white">{service.title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {service.description}
              </p>
              <Link to="/contact" className="text-blue-400 font-bold hover:underline">
                Request a quote →
              </Link>
            </div>
          ))}
        </div>

        <div className="glass p-12 md:p-20 rounded-[60px] border-blue-500/20 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-600/5 pointer-events-none"></div>
           <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to start your next project?</h2>
           <Link to="/contact" className="inline-block px-12 py-5 rounded-2xl bg-white text-black font-black text-xl hover:bg-slate-200 transition-all shadow-2xl">
              Let's Talk Business
           </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
