
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h1 className="text-5xl md:text-7xl font-black mb-8">Build. Learn. <br /><span className="neon-text">Stay Relevant.</span></h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              CodersVoice was born out of a simple need: quality web development resources that don't just work, but look premium. Founded by Hrithik Singh, we've grown into a community of over 1,00,000+ developers and creators.
            </p>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Our mission is to bridge the gap between "learning code" and "shipping products." We provide the building blocks you need to launch your next big idea faster.
            </p>
            <div className="flex gap-4">
               <div className="text-center">
                 <div className="text-3xl font-black text-white">100k+</div>
                 <div className="text-slate-500 text-xs font-bold uppercase">Followers</div>
               </div>
               <div className="w-px h-10 bg-slate-800 self-center"></div>
               <div className="text-center">
                 <div className="text-3xl font-black text-white">5000+</div>
                 <div className="text-slate-500 text-xs font-bold uppercase">Students we guided</div>
               </div>
               <div className="w-px h-10 bg-slate-800 self-center"></div>
               <div className="text-center">
                 <div className="text-3xl font-black text-white">1000+</div>
                 <div className="text-slate-500 text-xs font-bold uppercase">Product sold</div>
               </div>
            </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-purple-600/10 rounded-full blur-[100px]"></div>
             <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85" alt="A team collaborating around a table" className="relative aspect-[4/5] w-full object-cover rounded-[40px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Quality First', desc: 'Every line of code is handwritten and optimized for performance.' },
            { title: 'Community Driven', desc: 'We build what you ask for. Your feedback shapes our product map.' },
            { title: 'Future Proof', desc: 'Always using the latest tech like Next.js, TypeScript, and AI tools.' }
          ].map((val, idx) => (
            <div key={idx} className="glass p-10 rounded-[40px] border-white/5">
              <h3 className="text-2xl font-bold mb-4 text-white">{val.title}</h3>
              <p className="text-slate-400 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
