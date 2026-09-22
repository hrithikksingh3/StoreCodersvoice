
import React, { useEffect } from 'react';

const ABOUT_TITLE = 'About CodersVoice | Digital Products, Web Development & Creator Resources';
const ABOUT_DESCRIPTION = 'CodersVoice, founded by Hrithik Singh, creates digital products, website source code, web development resources, AI automation, SEO and creator tools for builders and businesses.';

const setMeta = (selector: string, attribute: 'name' | 'property', value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  const created = !element;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, selector.match(/="([^"]+)"/)?.[1] || '');
    document.head.appendChild(element);
  }
  const previous = element.content;
  element.content = value;
  return () => {
    if (created) element?.remove();
    else if (element) element.content = previous;
  };
};

const About: React.FC = () => {
  useEffect(() => {
    document.title = ABOUT_TITLE;
    const restoreMeta = [
      setMeta('meta[name="description"]', 'name', ABOUT_DESCRIPTION),
      setMeta('meta[property="og:title"]', 'property', ABOUT_TITLE),
      setMeta('meta[property="og:description"]', 'property', ABOUT_DESCRIPTION),
    ];
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = !canonical;
    const previousCanonical = canonical?.href;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://store.codersvoice.me/about';
    return () => {
      document.title = 'CodersVoice Store | Digital Products & Projects';
      restoreMeta.forEach((restore) => restore());
      if (createdCanonical) canonical?.remove();
      else if (canonical && previousCanonical) canonical.href = previousCanonical;
    };
  }, []);

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-blue-400">The official CodersVoice store</p>
            <h1 className="text-5xl md:text-7xl font-black mb-8">CodersVoice: digital products, <br /><span className="neon-text">built for people who ship.</span></h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Founded by Hrithik Singh, CodersVoice is a digital products and technology brand for developers, creators, students and growing businesses. We turn practical ideas into useful website source code, web development projects, landing pages, creator bundles and tools that help people build with more confidence.
            </p>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              This is the official CodersVoice marketplace: a place to discover ready-to-use digital products, learn from real project structures, and access resources designed for launching faster. Beyond the store, CodersVoice also works across custom web development, AI automation, digital marketing and SEO, video editing, and brochure or pamphlet design.
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
             <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85" alt="CodersVoice collaborators planning digital products and web development projects" className="relative aspect-[4/5] w-full object-cover rounded-[40px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>

        <section className="mb-24 rounded-[40px] border border-blue-500/20 bg-slate-900/70 p-8 md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">What CodersVoice does</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">From learning code to launching real digital experiences.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3 text-slate-400 leading-relaxed">
            <p><b className="text-white">Digital products and source code.</b> CodersVoice publishes projects, templates, bundles and learning-friendly resources that are ready to explore, customise and ship.</p>
            <p><b className="text-white">Web, AI and growth services.</b> We help businesses with custom websites, AI automation, search engine optimisation and digital marketing that support clear goals.</p>
            <p><b className="text-white">Creator-focused support.</b> Video editing, editing bundles and print-ready design services help creators and brands present their work consistently across channels.</p>
          </div>
        </section>

        <section aria-labelledby="codersvoice-values" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <h2 id="codersvoice-values" className="sr-only">CodersVoice values</h2>
          {[
            { title: 'Useful by design', desc: 'We focus on practical digital products and services that solve real launch, learning and growth problems.' },
            { title: 'Built around the community', desc: 'Feedback from developers, creators and businesses helps shape what CodersVoice makes next.' },
            { title: 'Ready for what is next', desc: 'We combine modern web development, AI workflows and discoverability-focused thinking without losing clarity.' }
          ].map((val, idx) => (
            <div key={idx} className="glass p-10 rounded-[40px] border-white/5">
              <h3 className="text-2xl font-bold mb-4 text-white">{val.title}</h3>
              <p className="text-slate-400 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default About;
