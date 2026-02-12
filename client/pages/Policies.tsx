
import React from 'react';
import { useLocation } from 'react-router-dom';

const Policies: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);
  
  const getContent = () => {
    switch(path) {
      case 'terms':
        return {
          title: 'Terms & Conditions',
          content: `
            By using CodersVoice Store, you agree to the following terms. All digital products are sold on an "as-is" basis. 
            Once purchased, you are granted a non-exclusive license to use the product for personal or commercial projects. 
            Redistribution or reselling of the source code is strictly prohibited.
          `
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: `
            We respect your privacy. We collect minimal information required to provide our services. 
            We do not share your personal data with third parties except as necessary to fulfill your requests (like SuperProfile for payments).
          `
        };
      case 'refund':
        return {
          title: 'Refund Policy',
          content: `
            Due to the digital nature of our products, all sales are final. Once you have access to the source code or digital assets, 
            refunds cannot be issued. If you face technical issues, we provide 100% support to resolve them.
          `
        };
      default:
        return { title: 'Legal', content: 'Information not found.' };
    }
  };

  const { title, content } = getContent();

  return (
    <div className="pt-40 pb-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass p-12 rounded-[40px] border-white/5">
          <h1 className="text-4xl font-black mb-8 text-white">{title}</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line">
              {content}
            </p>
            <p className="text-slate-400 mt-8">
              Last updated: October 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;
