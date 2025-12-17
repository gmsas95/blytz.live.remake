import React from 'react';
import { Product } from '../types';
import { Star, Zap, Clock } from 'lucide-react';
import { Badge, Button } from './UI';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onClick }) => {
  return (
    <div 
      className="group bg-blytz-dark border border-white/5 hover:border-blytz-neon/50 transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={() => onClick(product)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {product.isFlash && <Badge variant="flash">Flash Sale</Badge>}
        {product.isHot && <Badge variant="hot">High Demand</Badge>}
      </div>

      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-blytz-black">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        {/* Overlay Action */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
           <Button 
             variant="outline" 
             onClick={(e) => {
               e.stopPropagation();
               onAdd(product);
             }}
           >
             Quick Add
           </Button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center text-blytz-neon text-xs gap-1">
            <Star className="w-3 h-3 fill-current" />
            <span>{product.rating}</span>
          </div>
        </div>

        <h3 className="text-white font-medium text-lg leading-tight mb-2 group-hover:text-blytz-neon transition-colors line-clamp-2">
          {product.title}
        </h3>

        {/* Flash Sale Timer Mini */}
        {product.isFlash && (
          <div className="flex items-center gap-1 text-xs text-red-500 font-mono mb-2">
            <Clock className="w-3 h-3" />
            <span>Ends in {product.timeLeft}</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-gray-600 text-xs line-through font-mono decoration-red-500">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-display font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <button 
            className="md:hidden w-8 h-8 rounded-full bg-blytz-neon text-black flex items-center justify-center active:scale-90 transition-transform"
            onClick={(e) => {
               e.stopPropagation();
               onAdd(product);
             }}
          >
            <Zap className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};