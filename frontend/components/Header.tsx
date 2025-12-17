import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, Zap, X } from 'lucide-react';
import { Button } from './UI';
import { AuthHeader } from './Auth';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick, onHomeClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-blytz-black/90 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={onHomeClick}
        >
          <div className="w-8 h-8 bg-blytz-neon text-black flex items-center justify-center -skew-x-12 group-hover:rotate-12 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-display font-bold text-2xl italic tracking-tighter text-white">
            BLYTZ<span className="text-blytz-neon">.LIVE</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <input 
              type="text" 
              placeholder="Search for gear..." 
              className="w-full bg-blytz-dark border border-white/10 rounded-none px-4 py-2 text-white focus:outline-none focus:border-blytz-neon transition-colors placeholder:text-gray-600 font-sans"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blytz-neon" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <AuthHeader />
          </div>

          <button 
            onClick={onCartClick}
            className="relative p-2 text-white hover:text-blytz-neon transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blytz-neon text-black text-[10px] font-bold flex items-center justify-center rounded-none skew-x-[-10deg]">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blytz-black border-t border-white/10 p-4 absolute w-full left-0 animate-in slide-in-from-top-5">
           <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-blytz-dark border border-white/10 p-3 text-white mb-4 focus:border-blytz-neon outline-none"
            />
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-lg font-display text-white hover:text-blytz-neon">New Drops</a>
              <a href="#" className="text-lg font-display text-white hover:text-blytz-neon">Trending</a>
              <a href="#" className="text-lg font-display text-white hover:text-blytz-neon">Sell Item</a>
              <div className="h-px bg-white/10 my-2" />
              <div className="pt-2">
                <AuthHeader />
              </div>
            </nav>
        </div>
      )}
    </header>
  );
};