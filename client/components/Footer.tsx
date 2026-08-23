
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-extrabold text-white mb-6 block group">
              Coders<span className="neon-text">Voice</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering developers and creators with premium digital assets, ready-made projects, and templates to build faster.
            </p>
            {/* <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="https://www.instagram.com/codersvoice" className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div> */}

<div className="flex space-x-4">

  {/* Instagram */}
  <a
    href="https://www.instagram.com/codersvoice"
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    aria-label="Instagram"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  </a>

   {/* YouTube */}
  <a
    href="https://www.youtube.com/channel/UCgVFnSkvmtPs3y3HvUJU7ig"
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    aria-label="YouTube"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.02 3.02 0 0 0-2.123-2.14C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.375.5A3.02 3.02 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.02 3.02 0 0 0 2.123 2.14c1.87.5 9.375.5 9.375.5s7.505 0 9.375-.5a3.02 3.02 0 0 0 2.123-2.14C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  </a> 

  {/* Medium */}
  <a
    href="https://medium.com/@hrithikkumarsingh"
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    aria-label="Medium"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.54 12c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6zm6.38 0c0 3.12-1.34 5.65-3 5.65s-3-2.53-3-5.65 1.34-5.65 3-5.65 3 2.53 3 5.65zM24 12c0 2.8-.48 5.07-1.07 5.07-.6 0-1.08-2.27-1.08-5.07s.48-5.07 1.08-5.07c.59 0 1.07 2.27 1.07 5.07z" />
    </svg>
  </a>

  {/* Facebook */}
  <a
    href="https://www.facebook.com/people/Coders-Voice/100086181562620"
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    aria-label="Facebook"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.41c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
    </svg>
  </a>

    {/* LinkedIn */}
  {/* <a
    href="#"
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    aria-label="LinkedIn"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.23 0H1.77C.79 0 0 .774 0 1.727v20.545C0 23.227.79 24 1.77 24h20.46c.98 0 1.77-.773 1.77-1.728V1.727C24 .774 23.21 0 22.23 0zM7.09 20.452H3.56V9h3.53v11.452zM5.325 7.433c-1.13 0-2.04-.915-2.04-2.04 0-1.124.91-2.04 2.04-2.04 1.124 0 2.04.916 2.04 2.04 0 1.125-.916 2.04-2.04 2.04zM20.452 20.452h-3.53v-5.57c0-1.33-.027-3.04-1.852-3.04-1.853 0-2.136 1.445-2.136 2.94v5.67H9.404V9h3.39v1.56h.048c.47-.89 1.62-1.85 3.33-1.85 3.56 0 4.22 2.34 4.22 5.38v6.36z" />
    </svg>
  </a> */}

  {/* Twitter / X */}
  <a
    href="https://x.com/Codersvoice_"
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    aria-label="Twitter"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
    </svg>
  </a>

</div>


          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Marketplace</h4>
            <ul className="space-y-4">
              <li><Link to="/store" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Browse Store</Link></li>
              <li><Link to="/store" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Featured Projects</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Custom Services</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Our Story</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">FAQs</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Get the latest drops and resources.</p>
            {/* <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-slate-900 border border-slate-800 rounded-l-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors">
                Join
              </button>
            </div> */}

{/* Beehiiv Subscribe Embed */}
<div className="max-w-xl mx-auto flex justify-center">
  <iframe
    src="https://subscribe-forms.beehiiv.com/3a2d393c-40a9-4a69-880b-1e0fad638811"
    className="beehiiv-embed"
    data-test-id="beehiiv-embed"
    frameBorder={0}
    scrolling="no"
    style={{
      width: "254px",
      height: "40px",
      margin: 0,
      borderRadius: "0px",
      backgroundColor: "transparent",
      boxShadow: "0 0 #0000",
      maxWidth: "100%",
    }}
  />
</div>



          </div>
        </div>

        <section className="mb-12 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-5 py-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">CodersVoice Network</p>
            <p className="mt-1 text-sm text-slate-400">Explore more from CodersVoice.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
            <a href="https://business.codersvoice.me" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-blue-600">Visit Business <span aria-hidden="true">↗</span></a>
            <a href="https://resources.codersvoice.me" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-blue-600">Browse Resources <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} CodersVoice Store. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/refund" className="hover:text-slate-300">Refund Policy</Link>
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
