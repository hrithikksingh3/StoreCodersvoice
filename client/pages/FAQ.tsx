
import React, { useState } from 'react';
import { FAQS } from '../constants';

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-6">Frequently Asked <br /><span className="neon-text">Questions</span></h1>
          <p className="text-slate-400 text-lg">Everything you need to know about our products and services.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className={`glass rounded-[32px] border-white/5 transition-all duration-300 overflow-hidden ${activeIndex === index ? 'border-blue-500/30 neon-glow' : 'hover:bg-slate-900/40'}`}
            >
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full px-8 py-8 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-xl font-bold text-white">{faq.question}</span>
                <span className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 bg-blue-600 border-blue-500' : ''}`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${activeIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-8 pb-8 pt-0">
                  <p className="text-slate-400 text-lg leading-relaxed border-t border-white/5 pt-6">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 glass p-12 rounded-[40px] border-white/5 text-center">
          <h3 className="text-2xl font-black mb-4">Still have questions?</h3>
          <p className="text-slate-400 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <a 
            href="/#/contact" 
            className="inline-block px-10 py-4 rounded-2xl bg-white text-black font-black text-lg hover:bg-slate-200 transition-all shadow-xl"
          >
            Get in touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
