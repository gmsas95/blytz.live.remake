import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, Zap, ShieldCheck, Truck, RotateCcw, CreditCard, MapPin, Upload, Camera, CheckCircle, Package, User, MessageSquare, Send, Sparkles, Bot, LayoutDashboard, FileSpreadsheet, MoreVertical, Edit, Copy, BarChart3, Search, TrendingUp, Map, Users, Bell, Megaphone, Settings, Globe, DollarSign } from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Button, Badge, Input } from './components/UI';
import { CATEGORIES } from './constants';
import { Product, CartItem, ViewState } from './types';
import { apiService } from './src/api';

// --- AI Chat Assistant Component ---
const ChatAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "SYSTEM ONLINE. I am Blytz AI. searching inventory... How can I assist your acquisition today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // Get current products for context
      const products = await apiService.getProducts();
      const inventoryContext = products.map(p => `${p.title} ($${p.price}, ${p.category})`).join(', ');
      
      // Check if we have Gemini API key
      const apiKey = process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
      
      if (apiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: `User: ${userMsg}`,
            systemInstruction: `You are AI interface for Blytz.live, a high-speed cyberpunk marketplace. 
            Your tone is concise, robotic but helpful, and energetic. 
            Current Inventory: ${inventoryContext}.
            If user asks for recommendations, suggest items from our inventory.
            Keep responses under 50 words. Use terminology like "Affirmative", "Scanning", "Uplink established".`,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100
            }
          })
        });

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Connection interrupted.";
        setMessages(prev => [...prev, { role: 'model', text: aiText }]);
      } else {
        // Fallback response without API
        setTimeout(() => {
          const responses = [
            "Affirmative. Item available. Processing your request.",
            "Scanning inventory... Match found. Ready for acquisition.",
            "Access granted. Product located. Proceed to checkout.",
            "Negative. Item not in inventory. Try different search terms.",
            "Uplink established. System ready to assist."
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          setMessages(prev => [...prev, { role: 'model', text: randomResponse }]);
        }, 1000);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "ERR: Uplink failed. Try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-blytz-dark border border-blytz-neon/30 rounded-none flex flex-col z-50 shadow-lg shadow-blytz-neon/20">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blytz-neon" />
          <span className="font-display text-sm text-white font-bold">BLYTZ AI</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 text-xs ${msg.role === 'user' ? 'bg-blytz-neon text-black' : 'bg-black border border-blytz-neon/30 text-blytz-neon font-mono'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-black border border-blytz-neon/30 text-blytz-neon font-mono px-3 py-2 text-xs">
              <span className="inline-flex">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse delay-75">.</span>
                <span className="animate-pulse delay-150">.</span>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query inventory..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Load data from API on mount
  useEffect(() => {
    apiService.getProducts()
      .then(setProducts)
      .catch(err => console.error('Failed to load products:', err));

    // Check if user has API key for AI
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      process.env.GEMINI_API_KEY = apiKey;
    }
  }, []);

  // Update filtered products when category changes
  useEffect(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase()));
    }
  }, [products, selectedCategory]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      await apiService.addToCart(product.id, quantity);
      
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prev, { ...product, quantity }];
        }
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Fallback to local state
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prev, { ...product, quantity }];
        }
      });
    }
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Render based on view state
  return (
    <div className="min-h-screen bg-blytz-black text-white">
      <Header 
        cartCount={cartCount} 
        onCartClick={() => setIsCheckingOut(true)}
        onNavClick={setViewState}
      />
      
      {viewState === 'HOME' && (
        <>
          {/* Hero Section */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blytz-accent/20 to-transparent"></div>
            <div className="relative container mx-auto text-center">
              <div className="animate-float">
                <div className="w-16 h-16 bg-blytz-neon text-black flex items-center justify-center mx-auto mb-6 -skew-x-12">
                  <Zap className="w-10 h-10 fill-current" />
                </div>
              </div>
              <h1 className="font-display text-6xl md:text-8xl font-black mb-4 tracking-tighter">
                BLYTZ<span className="text-blytz-neon">.LIVE</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
                The future is now. Instant access to cutting-edge tech, cyberdeck upgrades, and neural interfaces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" className="text-lg">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  SHOP NOW
                </Button>
                <Button variant="outline" className="text-lg" onClick={() => setIsSelling(true)}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  SELL GEAR
                </Button>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <h2 className="font-display text-4xl text-blytz-neon font-bold text-center mb-8">
                SHOP BY CATEGORY
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-6 border rounded-none flex flex-col items-center gap-3 transition-all ${
                      selectedCategory === category.id
                        ? 'border-blytz-neon bg-blytz-accent/10'
                        : 'border-white/10 hover:border-blytz-neon/50'
                    }`}
                  >
                    <div className="text-blytz-neon">{category.icon}</div>
                    <span className="font-display text-white font-bold">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <h2 className="font-display text-4xl text-blytz-neon font-bold text-center mb-4">
                FEATURED GEAR
              </h2>
              <p className="text-center text-gray-400 mb-8">
                Handpicked upgrades for your tech arsenal
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => addToCart(product)}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blytz-neon text-black rounded-none flex items-center justify-center z-30 animate-glow"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Modals */}
      {isChatOpen && <ChatAssistant onClose={() => setIsChatOpen(false)} />}
      
      {isCheckingOut && (
        <div className="fixed inset-0 bg-blytz-black/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-blytz-dark border border-blytz-neon/30 rounded-none p-8 max-w-md mx-4">
            <h2 className="font-display text-2xl text-blytz-neon font-bold mb-4">CHECKOUT</h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-black border border-white/10 p-3 rounded-none">
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-blytz-neon font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-blytz-neon">TOTAL</span>
                  <span className="text-blytz-neon">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setIsCheckingOut(false)}>CANCEL</Button>
              <Button onClick={() => alert('Order placed! Thank you for shopping at Blytz.live')}>
                COMPLETE ORDER
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSelling && (
        <div className="fixed inset-0 bg-blytz-black/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-blytz-dark border border-blytz-neon/30 rounded-none p-8 max-w-2xl mx-4 w-full">
            <h2 className="font-display text-2xl text-blytz-neon font-bold mb-6">LIST ITEM</h2>
            <div className="space-y-6">
              <Input placeholder="Product Title" />
              <Input placeholder="Price" prefix="$" />
              <select className="w-full bg-blytz-dark border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blytz-neon">
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <textarea 
                placeholder="Description" 
                className="w-full bg-blytz-dark border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blytz-neon h-32"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={() => setIsSelling(false)}>CANCEL</Button>
              <Button onClick={() => alert('Product listed successfully!')}>PUBLISH LISTING</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}