
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";



interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

  //handle buy now click
const navigate = useNavigate();

  return (
    <div className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:neon-glow hover:border-blue-500/50 flex flex-col h-full">
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={product.thumbnail} 
          alt={product.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isFree && <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-black text-slate-950 uppercase tracking-wider">Free gift</span>}
          {product.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60 pointer-events-none"></div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.slug}`} className="text-lg font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
            {product.title}
          </Link>
        </div>
        
        <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xl font-extrabold ${product.isFree ? "text-emerald-300" : "text-white"}`}>{product.isFree ? "Free gift" : `₹${product.price}`}</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase">{product.category}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <a 
              href={product.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="py-2 text-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Live Demo
            </a>
     <button
  type="button"
  onClick={() => navigate(`/product/${product.slug}`)}
  className="py-2 text-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
>
  {product.isFree ? "Get Free" : "Buy Now"}
</button>


          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
