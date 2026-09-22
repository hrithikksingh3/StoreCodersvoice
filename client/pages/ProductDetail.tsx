
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";
import { api } from '../api';



const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  const [showEmailModal, setShowEmailModal] = useState(false);
const [selectedProduct, setSelectedProduct] = useState<any>(null);
const [email, setEmail] = useState("");
const [customerName, setCustomerName] = useState("");
const [phone, setPhone] = useState("");


const [isProcessing, setIsProcessing] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [claimedGift, setClaimedGift] = useState(false);


  useEffect(() => {
    if (!slug) return;
    api<{ item: Product }>(`/api/products/${encodeURIComponent(slug)}`).then(({ item }) => { setProduct(item); setActiveImage(item.thumbnail); window.scrollTo(0, 0); document.title = item.seoTitle || `${item.title} | CodersVoice`; }).catch(() => navigate('/store'));
  }, [slug, navigate]);

  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  useEffect(() => { if (product) api<{ items: Product[] }>(`/api/products?category=${encodeURIComponent(product.category)}&limit=4`).then(({ items }) => setSimilarProducts(items.filter((item) => item.id !== product.id).slice(0, 3))).catch(() => setSimilarProducts([])); }, [product]);
  useEffect(() => { if (!product) return; document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index,follow'); return () => document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index,follow'); }, [product]);

  if (!product) return <div className="pt-32 text-center text-slate-400">Loading product…</div>;

  //handle buy now click

const handleCheckout = (product: any) => {
  setSelectedProduct(product);
  setClaimedGift(false);
  setShowEmailModal(true);
};


const confirmCheckout = async () => {
  if (!selectedProduct) return;
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    toast.error("Enter a valid email address for delivery.");
    return;
  }
  setIsProcessing(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: selectedProduct.id,
        email: email.trim(),
        customerName: customerName.trim(),
        phone: phone.trim(),
      }),
    });

    const data = await response.json();
    if (!data.success) {
      toast.error(data.message || "Unable to start checkout.");
      return;
    }

    if (data.free) {
      setClaimedGift(true);
      setShowEmailModal(false);
      setShowSuccessModal(true);
      setSelectedProduct(null);
      setEmail("");
      setCustomerName("");
      setPhone("");
      toast.success(data.alreadyClaimed ? "This gift was already claimed. We are preparing the delivery email again." : "Your CodersVoice gift is being prepared.");
      return;
    }

    // 🔥 Open Razorpay
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "CodersVoice",
      description: data.productName,
      order_id: data.orderId,
      prefill: {
        email: email.trim(),
        name: customerName.trim() || undefined,
        contact: phone.trim() || undefined,
      },
      theme: {
        color: "#2563eb",
      },
  handler: async function (response) {
     setIsProcessing(true);
  try {
    const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    const result = await verifyRes.json();
    if (result.success) {
        setClaimedGift(false);
        setShowSuccessModal(true);
      toast.success("Payment successful. Your delivery email is being prepared.");
    } else {
      toast.error("Payment verification failed ❌");
    }
  } catch (err) {
    toast.error("Something went wrong 😓");
  } finally {
    setIsProcessing(false);
  }
},
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();

    setShowEmailModal(false);
    setEmail("");
    setCustomerName("");
    setPhone("");
    setSelectedProduct(null);

  } catch (error) {
    console.error("Checkout error:", error);
    toast.error("Unable to start checkout. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};


  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-8 uppercase font-bold tracking-widest">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/store" className="hover:text-white">Marketplace</Link>
          <span>/</span>
          <span className="text-blue-400">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Gallery */}
          <div>
            <div className="glass aspect-video rounded-3xl overflow-hidden mb-4 border-white/5">
              <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[product.thumbnail, ...product.galleryImages].map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden glass border-2 transition-all ${activeImage === img ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.title} view ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
              {product.isFree && <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">CodersVoice gift</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">{product.title}</h1>
            <div className={`text-3xl font-black mb-8 ${product.isFree ? "text-emerald-300" : "text-white"}`}>{product.isFree ? "Free gift" : `₹${product.price}`}</div>
            
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              {product.fullDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <a 
                href={product.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl glass border-white/10 text-white font-bold hover:bg-slate-800 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Live Demo
              </a>
           <button
           type="button"
  onClick={() => handleCheckout(product)}
  className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
>
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
  {product.isFree ? "Get Free Gift" : "Buy Now"}
</button>

            </div>

            <div className="space-y-6 pt-8 border-t border-slate-900">
              <div>
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {product.techStack.map(tech => (
                    <span key={tech} className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">What's Included</h4>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {['Full Source Code', 'Documentation', '1 Year Updates', 'Assets & Fonts', 'Setup Guide'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-slate-400 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-8">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

{/* email prompt modal  */}
{showEmailModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="glass rounded-2xl p-8 w-full max-w-md border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-4">{selectedProduct?.isFree ? "Claim your free gift" : "Checkout details"}</h2>

      <p className="text-slate-400 text-sm mb-6">
        {selectedProduct?.isFree ? "Enter your valid email address. Your CodersVoice gift and access details will be sent only to this email." : "Enter your valid email address. You will receive the product and details in this email only after payment."}
      </p>

      <label className="mb-4 block text-sm font-medium text-slate-200">Email address <span className="text-red-400">*</span>
        <input autoFocus type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-200">Name <span className="font-normal text-slate-500">(optional)</span>
          <input type="text" autoComplete="name" maxLength={100} placeholder="Your name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="block text-sm font-medium text-slate-200">Phone number <span className="font-normal text-slate-500">(optional)</span>
          <input type="tel" autoComplete="tel" maxLength={32} placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => { setShowEmailModal(false); setEmail(""); setCustomerName(""); setPhone(""); }}
          className="flex-1 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmCheckout}
          className="flex-1 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
        >
          {selectedProduct?.isFree ? "Get free product" : "Continue to payment"}
        </button>
      </div>
    </div>
  </div>
)}


{/* processing modal  */}
{isProcessing && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="glass rounded-2xl p-8 flex flex-col items-center gap-6 border border-white/10">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white font-medium">
        {selectedProduct?.isFree ? "Preparing your free delivery..." : "Processing payment..."}
      </p>
    </div>
  </div>
)}

{/* success modal  */}
{showSuccessModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="glass rounded-3xl p-10 w-full max-w-md text-center border border-green-500/20">

      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        {claimedGift ? "Gift claimed 🎁" : "Payment successful 🎉"}
      </h2>

      <p className="text-slate-400 mb-6">
        {claimedGift ? "Your CodersVoice gift is being prepared. Please check this email address shortly for your secure delivery link." : "Your payment is confirmed. Your delivery email is now being prepared; please check your inbox shortly."}
      </p>

      <button
        onClick={() => {
          setShowSuccessModal(false);
          navigate("/store");
        }}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition"
      >
        Continue Shopping
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default ProductDetail;
