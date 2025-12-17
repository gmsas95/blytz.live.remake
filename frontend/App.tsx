import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, Zap, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Button, Badge } from './components/UI';
import { CATEGORIES, PRODUCTS } from './constants';
import { Product, CartItem, ViewState } from './types';

// Mock AI Service integration placeholder
import { GoogleGenAI } from '@google/genai';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // --- Cart Logic ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Views ---

  const renderProductDetail = () => {
    if (!selectedProduct) return null;

    return (
      <div className="container mx-auto px-4 py-8 animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={() => setView('HOME')} 
          className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
        >
          &larr; Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-blytz-dark rounded-lg overflow-hidden border border-white/10 relative group">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title} 
                className="w-full h-full object-cover"
              />
               {selectedProduct.isFlash && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="flash">Flash Deal Ends {selectedProduct.timeLeft}</Badge>
                  </div>
               )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-blytz-dark rounded border border-white/10 cursor-pointer hover:border-blytz-neon">
                  {/* Placeholder for extra images */}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full">
            <div className="mb-auto">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 italic">
                {selectedProduct.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-blytz-neon">
                  ${selectedProduct.price.toFixed(2)}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${selectedProduct.originalPrice.toFixed(2)}
                  </span>
                )}
                <div className="flex items-center gap-1 text-yellow-400 ml-4">
                  <span className="font-bold">{selectedProduct.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Zap key={i} className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-current' : 'text-gray-700'}`} />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm ml-2">({selectedProduct.reviews} verified)</span>
                </div>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {selectedProduct.description}
              </p>

              <div className="space-y-6 mb-8">
                <div className="p-4 bg-white/5 border border-white/10 rounded">
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blytz-neon" /> 
                    Blytz Speed Delivery
                  </h3>
                  <p className="text-sm text-gray-400">Order in the next 2 hrs for delivery by tomorrow, 10 AM.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-8 border-t border-white/10">
              <Button 
                variant="primary" 
                size="lg" 
                className="flex-1 text-lg"
                onClick={() => addToCart(selectedProduct)}
              >
                Add To Cart
              </Button>
              <Button variant="outline" size="lg" className="px-4">
                <ShieldCheck className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blytz-black border-b border-white/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blytz-neon/20 blur-[100px] rounded-full"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="flash">System Update: Prices Dropped</Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mt-6 mb-6 leading-[0.9] italic">
              SPEED IS THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blytz-neon to-blytz-lime">
                NEW CURRENCY
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-xl">
              The next generation marketplace for instant gratification. 
              Verified sellers. Millisecond transactions. Instant dispatch.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Shop The Drop <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="secondary" size="lg">
                Sell Your Gear
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-blytz-black py-8 border-b border-white/10 sticky top-16 z-40 backdrop-blur-md bg-opacity-90">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 min-w-max">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2 rounded-full border transition-all ${
                activeCategory === 'all' 
                  ? 'bg-white text-black border-white font-bold' 
                  : 'bg-transparent text-gray-400 border-gray-800 hover:border-white hover:text-white'
              }`}
            >
              All Drops
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-6 py-2 rounded-full border flex items-center gap-2 transition-all ${
                  activeCategory === cat.name
                    ? 'bg-blytz-neon text-black border-blytz-neon font-bold' 
                    : 'bg-transparent text-gray-400 border-gray-800 hover:border-blytz-neon hover:text-blytz-neon'
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="py-12 bg-blytz-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS
              .filter(p => activeCategory === 'all' || p.category === activeCategory)
              .map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAdd={addToCart}
                  onClick={(p) => {
                    setSelectedProduct(p);
                    setView('PRODUCT_DETAIL');
                    window.scrollTo(0,0);
                  }}
                />
            ))}
          </div>
          
          {PRODUCTS.filter(p => activeCategory === 'all' || p.category === activeCategory).length === 0 && (
             <div className="text-center py-20">
               <h3 className="text-2xl font-bold text-gray-600">No signals found in this sector.</h3>
               <Button variant="ghost" onClick={() => setActiveCategory('all')} className="mt-4">Reset Signal</Button>
             </div>
          )}
        </div>
      </section>

      {/* Features / Trust */}
      <section className="py-20 border-t border-white/10 bg-blytz-dark">
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-white/5 bg-blytz-black hover:border-blytz-neon/30 transition-colors group">
              <Zap className="w-10 h-10 text-blytz-neon mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Instant Authentication</h3>
              <p className="text-gray-400">Every item is digitally verified in real-time before it leaves the seller.</p>
            </div>
            <div className="p-6 border border-white/5 bg-blytz-black hover:border-blytz-neon/30 transition-colors group">
              <Truck className="w-10 h-10 text-blytz-neon mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Hyper-Local Logistics</h3>
              <p className="text-gray-400">Our decentralized warehouse network ensures same-day delivery in metro areas.</p>
            </div>
            <div className="p-6 border border-white/5 bg-blytz-black hover:border-blytz-neon/30 transition-colors group">
              <RotateCcw className="w-10 h-10 text-blytz-neon mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Zero-Friction Returns</h3>
              <p className="text-gray-400">Don't like it? Scan the QR code and a drone picks it up. Instant refund.</p>
            </div>
         </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-blytz-black text-gray-100 font-sans selection:bg-blytz-neon selection:text-black">
      <Header 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)}
        onHomeClick={() => {
          setView('HOME');
          window.scrollTo(0,0);
        }}
      />
      
      <main>
        {view === 'HOME' && renderHome()}
        {view === 'PRODUCT_DETAIL' && renderProductDetail()}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-2xl font-display font-bold italic text-white">
            BLYTZ<span className="text-gray-600">.LIVE</span>
           </div>
           <div className="flex gap-8 text-gray-500 text-sm">
             <a href="#" className="hover:text-blytz-neon">Terms</a>
             <a href="#" className="hover:text-blytz-neon">Privacy</a>
             <a href="#" className="hover:text-blytz-neon">Careers</a>
             <a href="#" className="hover:text-blytz-neon">Sell</a>
           </div>
           <div className="text-gray-600 text-sm">
             © 2024 Blytz Commerce Protocol.
           </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-blytz-dark border-l border-white/10 z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-blytz-black">
              <h2 className="text-2xl font-display font-bold italic text-white">YOUR HAUL</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg">Your cart is empty.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white/5 p-4 rounded border border-white/5">
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded bg-black" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-blytz-neon font-mono mb-3">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          className="w-6 h-6 rounded bg-black border border-white/20 flex items-center justify-center hover:border-blytz-neon"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 rounded bg-black border border-white/20 flex items-center justify-center hover:border-blytz-neon"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-blytz-black border-t border-white/10">
                <div className="flex justify-between items-center mb-2 text-gray-400">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-gray-400">
                  <span>Shipping</span>
                  <span className="text-blytz-neon">FREE (Blytz Prime)</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-xl font-bold text-white">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full h-14 text-lg">
                  SECURE CHECKOUT
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;