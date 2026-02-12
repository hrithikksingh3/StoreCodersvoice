
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('Form data:', formState);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              Let's <span className="neon-text">Connect.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-lg">
              Have a question about a product? Or want to discuss a custom project? We're usually responding within 24 hours.
            </p>
            
            <div className="space-y-8 mb-12">
              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl glass border-blue-500/20 flex items-center justify-center text-blue-400">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Email Us</h4>
                  <p className="text-white font-bold text-lg">codersvoice1@gmail.com</p>
                </div>
              </div>
              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl glass border-purple-500/20 flex items-center justify-center text-purple-400">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
                </div>
                <div>
                  <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Instagram</h4>
                  <a href="https://instagram.com/codersvoice" target="_blank" rel="noreferrer" className="text-white font-bold text-lg hover:text-purple-400 transition-colors">@codersvoice</a>
                </div>
              </div>
              {/* <div className="flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl glass border-green-500/20 flex items-center justify-center text-green-400">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">WhatsApp</h4>
                  <p className="text-white font-bold text-lg">+91 999 999 9999</p>
                </div>
              </div> */}
              <div className="flex gap-6 items-center">
  <div className="w-14 h-14 rounded-2xl glass border-green-500/20 flex items-center justify-center text-green-400">
    {/* Link Icon */}
    <svg
      className="w-7 h-7"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 5.656l-1.414 1.414"
      />
    </svg>
  </div>

  <div>
    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
      Connects
    </h4>

    <a
      href="https://heylink.me/codersvoicehrithik/"
      target="_blank"
      rel="noreferrer"
      className="text-white font-bold text-lg hover:text-green-400 transition"
    >
      heylink.me/codersvoicehrithik
    </a>
  </div>
</div>

            </div>
          </div>

          <div className="relative">
             <div className="absolute inset-0 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
             <div className="relative glass p-8 md:p-12 rounded-[40px] border-white/5">
                <h3 className="text-2xl font-black mb-8">Send a Message</h3>
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
                    <p className="text-slate-400">We'll get back to you shortly.</p>
                  </div>
                ) : (
                  // <form onSubmit={handleSubmit} className="space-y-6">
                  //   <div>
                  //     <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">Full Name</label>
                  //     <input 
                  //       type="text" 
                  //       required
                  //       className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  //       placeholder="John Doe"
                  //       value={formState.name}
                  //       onChange={e => setFormState({...formState, name: e.target.value})}
                  //     />
                  //   </div>
                  //   <div>
                  //     <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">Email Address</label>
                  //     <input 
                  //       type="email" 
                  //       required
                  //       className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  //       placeholder="john@example.com"
                  //       value={formState.email}
                  //       onChange={e => setFormState({...formState, email: e.target.value})}
                  //     />
                  //   </div>
                  //   <div>
                  //     <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">Message</label>
                  //     <textarea 
                  //       required
                  //       rows={4}
                  //       className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  //       placeholder="Tell us about your project or query..."
                  //       value={formState.message}
                  //       onChange={e => setFormState({...formState, message: e.target.value})}
                  //     ></textarea>
                  //   </div>
                  //   <button type="submit" className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                  //     Send Message
                  //   </button>
                  // </form>

                  <form
  action="https://formsubmit.co/codersvoice1@gmail.com"
  method="POST"
  className="space-y-6"
>
  <div>
    <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">
      Full Name
    </label>
    <input
      type="text"
      name="name"
      required
      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
      placeholder="Enter your name"
    />
  </div>

  <div>
    <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">
      Email Address
    </label>
    <input
      type="email"
      name="email"
      required
      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
      placeholder="Enter your best Email"
    />
  </div>

  <div>
    <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">
      Message
    </label>
    <textarea
      name="message"
      required
      rows={4}
      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
      placeholder="Tell us about your project or query..."
    />
  </div>

  {/* Optional hidden fields */}
  <input type="hidden" name="source" value="codersvoice-store" />

  <button
    type="submit"
    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95"
  >
    Send Message
  </button>
</form>

                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
