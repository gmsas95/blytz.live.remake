import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, Zap, ShieldCheck, Truck, RotateCcw, CreditCard, MapPin, Upload, Camera, CheckCircle, Package, User, MessageSquare, Send, Sparkles, Bot, LayoutDashboard, FileSpreadsheet, MoreVertical, Edit, Copy, BarChart3, Search, TrendingUp, Map, Users, Bell, Megaphone, Settings, Globe, DollarSign } from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Button, Badge, Input } from './components/UI';
import { CATEGORIES, PRODUCTS, DROPS } from './constants';
import { Product, CartItem, ViewState } from './types';
import { GoogleGenAI } from '@google/genai';

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inventoryContext = PRODUCTS.map(p => `${p.title} ($${p.price}, ${p.category})`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `User: ${userMsg}`,
        config: {
          systemInstruction: `You are the AI interface for Blytz.live, a high-speed cyberpunk marketplace. 
          Your tone is concise, robotic but helpful, and energetic. 
          Current Inventory: ${inventoryContext}.
          If the user asks for recommendations, suggest items from the inventory.
          Keep responses under 50 words. Use terminology like "Affirmative", "Scanning", "Uplink established".`,
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "Connection interrupted." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "ERR: Uplink failed. Try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:right-8 w-80 md:w-96 bg-blytz-dark border border-blytz-neon/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-lg flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 z-50">
      <div className="bg-blytz-neon/10 border-b border-blytz-neon/20 p-3 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blytz-neon" />
          <span className="font-display font-bold text-white tracking-wider">BLYTZ AI</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      
      <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3 bg-black/80 backdrop-blur-sm">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              m.role === 'user' 
                ? 'bg-white/10 text-white rounded-br-none' 
                : 'bg-blytz-neon/10 text-blytz-neon border border-blytz-neon/20 rounded-bl-none font-mono'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
            <div className="bg-blytz-neon/10 border border-blytz-neon/20 px-3 py-2 rounded-lg rounded-bl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blytz-neon rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blytz-neon rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-blytz-neon rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-blytz-dark border-t border-white/10 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Query inventory..."
          className="flex-1 bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blytz-neon outline-none font-mono"
        />
        <button 
          onClick={handleSend}
          className="bg-blytz-neon text-black p-2 rounded hover:bg-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Dashboard State
  const [dashboardTab, setDashboardTab] = useState<'OVERVIEW' | 'INVENTORY' | 'BULK' | 'ORDERS' | 'ANALYTICS' | 'MARKETING' | 'MESSAGES' | 'SETTINGS'>('OVERVIEW');
  
  // Sell Form State (For Bulk/Single)
  const [sellForm, setSellForm] = useState({
    title: '',
    category: '',
    condition: '',
    description: '',
    price: ''
  });
  const [aiLoading, setAiLoading] = useState({ price: false, desc: false });

  // Marketing AI State
  const [adPrompt, setAdPrompt] = useState('');
  const [generatedAd, setGeneratedAd] = useState('');
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);

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

  // --- AI Handlers ---
  const handleEstimatePrice = async () => {
    if (!sellForm.title || !sellForm.condition) return;
    setAiLoading(prev => ({ ...prev, price: true }));
    try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Estimate the market price in USD for a used "${sellForm.title}" in "${sellForm.condition}" condition. 
        Return ONLY a single number (e.g. 150.00). No text symbols or currency signs.`,
      });
      const price = response.text?.trim() || '---.--';
      setSellForm(prev => ({ ...prev, price }));
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(prev => ({ ...prev, price: false }));
    }
  };

  const handleGenerateDesc = async () => {
    if (!sellForm.title) return;
    setAiLoading(prev => ({ ...prev, desc: true }));
    try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a high-energy, futuristic, exciting 2-sentence sales description for a "${sellForm.title}" in category "${sellForm.category}". 
        Use words like 'cyber', 'velocity', 'premium', 'grade-A'.`,
      });
      setSellForm(prev => ({ ...prev, description: response.text?.trim() || '' }));
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(prev => ({ ...prev, desc: false }));
    }
  };

  const handleGenerateAd = async () => {
    if (!adPrompt) return;
    setIsGeneratingAd(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a short, professional social media ad for a product described as: "${adPrompt}". 
        Focus on value, quality, and features. Include hashtags.`,
      });
      setGeneratedAd(response.text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAd(false);
    }
  };

  // --- Nav Handler ---
  const handleNavClick = (newView: ViewState) => {
    setView(newView);
    window.scrollTo(0, 0);
    setIsCartOpen(false);
  };

  // --- Render Views ---

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

  const renderCheckout = () => (
    <div className="container mx-auto px-4 py-12 animate-in slide-in-from-bottom-8">
      <h1 className="text-4xl font-display font-bold text-white mb-8 italic">SECURE CHECKOUT</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Step 1: Shipping */}
          <div className={`border ${checkoutStep >= 1 ? 'border-blytz-neon/50 bg-blytz-dark/50' : 'border-white/10 bg-transparent'} p-6 rounded transition-all`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${checkoutStep >= 1 ? 'bg-blytz-neon text-black' : 'bg-gray-800 text-gray-500'}`}>1</div>
              <h2 className="text-xl font-bold text-white">SHIPPING DATA</h2>
            </div>
            
            {checkoutStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="First Name" />
                <Input placeholder="Last Name" />
                <Input placeholder="Address Line 1" className="md:col-span-2" />
                <Input placeholder="City" />
                <Input placeholder="Zip Code" />
                <div className="md:col-span-2 mt-4">
                   <Button onClick={() => setCheckoutStep(2)} className="w-full">Proceed to Payment</Button>
                </div>
              </div>
            )}
            {checkoutStep > 1 && <div className="text-green-400 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Data Secured</div>}
          </div>

          {/* Step 2: Payment */}
          <div className={`border ${checkoutStep >= 2 ? 'border-blytz-neon/50 bg-blytz-dark/50' : 'border-white/10 bg-transparent'} p-6 rounded transition-all`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${checkoutStep >= 2 ? 'bg-blytz-neon text-black' : 'bg-gray-800 text-gray-500'}`}>2</div>
              <h2 className="text-xl font-bold text-white">PAYMENT UPLINK</h2>
            </div>

             {checkoutStep === 2 && (
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-4 mb-4">
                   <button className="border border-blytz-neon bg-blytz-neon/10 text-blytz-neon p-4 rounded flex flex-col items-center gap-2 hover:bg-blytz-neon/20">
                     <CreditCard />
                     <span className="text-xs font-bold">Credit Card</span>
                   </button>
                    <button className="border border-white/10 text-gray-400 p-4 rounded flex flex-col items-center gap-2 hover:border-white hover:text-white">
                     <Zap />
                     <span className="text-xs font-bold">Crypto</span>
                   </button>
                    <button className="border border-white/10 text-gray-400 p-4 rounded flex flex-col items-center gap-2 hover:border-white hover:text-white">
                     <ShoppingBag />
                     <span className="text-xs font-bold">Pay Later</span>
                   </button>
                 </div>
                 <Input placeholder="Card Number" />
                 <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVC" />
                 </div>
                 <Button onClick={() => setCheckoutStep(3)} className="w-full mt-4">Establish Uplink (Pay ${cartTotal.toFixed(2)})</Button>
              </div>
             )}
             {checkoutStep > 2 && <div className="text-green-400 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Transaction Verified</div>}
          </div>
          
           {/* Step 3: Confirmation */}
           {checkoutStep === 3 && (
             <div className="bg-blytz-neon/10 border border-blytz-neon p-8 rounded text-center animate-pulse-fast">
               <Zap className="w-16 h-16 text-blytz-neon mx-auto mb-4" />
               <h2 className="text-3xl font-display font-bold text-white mb-2">ORDER CONFIRMED</h2>
               <p className="text-gray-400 mb-6">Dispatch drones are spooling up. Estimated arrival: <span className="text-blytz-neon font-mono">T-minus 2 hours</span>.</p>
               <Button onClick={() => { setCart([]); setView('HOME'); setCheckoutStep(1); }}>Return to Base</Button>
             </div>
           )}

        </div>

        {/* Order Summary */}
        <div className="bg-blytz-dark border border-white/10 p-6 h-fit rounded sticky top-24">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">ORDER MANIFEST</h3>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 bg-blytz-neon text-black font-bold flex items-center justify-center rounded-sm text-xs">{item.quantity}</div>
                   <span className="text-gray-300">{item.title}</span>
                </div>
                <span className="text-white font-mono">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-blytz-neon"><span>Delivery</span><span>0.00</span></div>
            <div className="flex justify-between text-xl font-bold text-white mt-4"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDrops = () => (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Badge variant="flash">INCOMING TRANSMISSIONS</Badge>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mt-4 mb-4 italic">FUTURE DROPS</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Get notified before the masses. These limited run items will sell out in seconds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {DROPS.map(product => (
          <div key={product.id} className="group relative border border-white/10 bg-blytz-dark overflow-hidden hover:border-blytz-neon transition-all">
            <div className="aspect-[4/5] relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-black/80 backdrop-blur border border-white/20 px-6 py-3 transform rotate-[-5deg]">
                    <span className="font-mono text-2xl font-bold text-blytz-neon block text-center">{product.dropDate}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest block text-center">Launch Date</span>
                 </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{product.title}</h3>
              <p className="text-gray-400 mb-6 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono text-gray-300">${product.price}</span>
                <Button variant="outline" size="sm">Notify Me</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- SELLER DASHBOARD COMPONENTS ---

  const DashboardOverview = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-display font-bold text-white mb-6">Dashboard Overview</h2>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden group hover:border-blytz-neon/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white mt-1">$12,450.00</h3>
            </div>
            <Zap className="text-blytz-neon w-6 h-6" />
          </div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% this week
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden group hover:border-blytz-neon/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active Orders</p>
              <h3 className="text-3xl font-bold text-white mt-1">24</h3>
            </div>
            <Package className="text-blue-500 w-6 h-6" />
          </div>
           <div className="text-xs text-gray-400">
            5 items pending dispatch
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden group hover:border-blytz-neon/50 transition-all">
           <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Seller Rating</p>
              <h3 className="text-3xl font-bold text-white mt-1">4.9<span className="text-sm text-gray-500">/5.0</span></h3>
            </div>
            <ShieldCheck className="text-purple-500 w-6 h-6" />
          </div>
          <div className="text-xs text-purple-400">
            Top Rated Seller
          </div>
        </div>
      </div>

      {/* Recent Activity Graph Placeholder */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blytz-neon" /> Sales Performance</h3>
          <select className="bg-black border border-white/10 text-xs text-white p-1 rounded">
             <option>Last 7 Days</option>
             <option>Last 30 Days</option>
          </select>
        </div>
        <div className="h-48 flex items-end gap-2 justify-between px-2">
           {[30, 45, 25, 60, 75, 50, 80, 40, 55, 70, 65, 90].map((h, i) => (
             <div key={i} className="w-full bg-white/5 hover:bg-blytz-neon transition-colors rounded-t" style={{height: `${h}%`}}></div>
           ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
           <span>Mon</span>
           <span>Tue</span>
           <span>Wed</span>
           <span>Thu</span>
           <span>Fri</span>
           <span>Sat</span>
           <span>Sun</span>
        </div>
      </div>
    </div>
  );

  const DashboardInventory = () => (
    <div className="animate-in slide-in-from-bottom-4 h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-display font-bold text-white">Inventory Management</h2>
         <div className="flex gap-2">
            <div className="relative">
              <input type="text" placeholder="Search SKU..." className="bg-black border border-white/10 pl-8 pr-4 py-2 text-sm text-white rounded focus:border-blytz-neon outline-none w-48" />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
            </div>
            <Button size="sm" onClick={() => setDashboardTab('BULK')}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
         </div>
       </div>

       <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden flex-1">
         <table className="w-full text-left border-collapse">
           <thead>
             <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-widest bg-white/5">
               <th className="p-4 font-medium">Product</th>
               <th className="p-4 font-medium">Price</th>
               <th className="p-4 font-medium">Stock Level</th>
               <th className="p-4 font-medium">Status</th>
               <th className="p-4 font-medium text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
             {PRODUCTS.map(p => (
               <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                 <td className="p-4">
                   <div className="flex items-center gap-3">
                     <img src={p.image} className="w-10 h-10 rounded bg-gray-800 object-cover" />
                     <div>
                       <div className="font-bold text-white text-sm">{p.title}</div>
                       <div className="text-xs text-gray-500 font-mono">SKU-{p.id.padStart(4, '0')}</div>
                     </div>
                   </div>
                 </td>
                 <td className="p-4 text-white font-mono text-sm">${p.price}</td>
                 <td className="p-4 text-sm text-gray-400">
                    <div className="w-full bg-gray-800 h-1.5 rounded-full w-24 overflow-hidden mb-1">
                      <div className="bg-blytz-neon h-full" style={{width: `${Math.random() * 100}%`}}></div>
                    </div>
                    {Math.floor(Math.random() * 50)} units
                 </td>
                 <td className="p-4">
                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-500/10 text-green-500 border border-green-500/20">
                     <span className="w-1 h-1 rounded-full bg-green-500"></span> Active
                   </span>
                 </td>
                 <td className="p-4 text-right">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                     <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                     <button className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );

  const DashboardBulkUpload = () => (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4">
       <div className="text-center mb-10">
         <h2 className="text-3xl font-display font-bold text-white mb-2">Bulk Product Upload</h2>
         <p className="text-gray-400">Drag and drop CSV or JSON files to upload multiple products at once.</p>
       </div>

       <div className="border-2 border-dashed border-white/10 rounded-xl p-16 text-center hover:border-blytz-neon hover:bg-blytz-neon/5 transition-all cursor-pointer group mb-8 relative overflow-hidden">
          <Upload className="w-16 h-16 text-gray-600 mx-auto mb-6 group-hover:text-blytz-neon group-hover:scale-110 transition-all" />
          <h3 className="text-xl font-bold text-white mb-2">Drop Files Here</h3>
          <p className="text-sm text-gray-500 mb-8">Supported: .CSV, .JSON, .JPG, .PNG (Max 50MB)</p>
          <Button>Browse Files</Button>
       </div>

       {/* Processing Queue UI simulation */}
       <div className="space-y-4">
         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Upload Queue</h4>
         
         {/* Completed Item */}
         <div className="bg-black/40 border border-green-500/30 p-4 rounded flex items-center gap-4">
           <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-500">CSV</div>
           <div className="flex-1">
             <div className="flex justify-between mb-1">
               <span className="text-white text-sm font-bold">summer_collection_v2.csv</span>
               <span className="text-green-500 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Processed</span>
             </div>
             <div className="h-1 bg-gray-800 rounded-full w-full overflow-hidden">
               <div className="h-full bg-green-500 w-full"></div>
             </div>
           </div>
         </div>

         {/* Processing Item */}
         <div className="bg-black/40 border border-blytz-neon/30 p-4 rounded flex items-center gap-4">
           <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-500">IMG</div>
           <div className="flex-1">
             <div className="flex justify-between mb-1">
               <span className="text-white text-sm font-bold">product_images_batch.zip</span>
               <span className="text-blytz-neon text-xs flex items-center gap-1"><Loader2Icon className="w-3 h-3 animate-spin" /> Processing...</span>
             </div>
             <div className="h-1 bg-gray-800 rounded-full w-full overflow-hidden">
               <div className="h-full bg-blytz-neon w-2/3 animate-pulse"></div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );

  const DashboardOrders = () => (
    <div className="animate-in slide-in-from-bottom-4">
       <h2 className="text-2xl font-display font-bold text-white mb-6">Order Management</h2>
       <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-widest bg-white/5">
               <th className="p-4">Order ID</th>
               <th className="p-4">Customer</th>
               <th className="p-4">Items</th>
               <th className="p-4">Total</th>
               <th className="p-4">Status</th>
               <th className="p-4 text-right">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
             {[1,2,3,4,5].map(i => (
               <tr key={i} className="hover:bg-white/5 transition-colors">
                 <td className="p-4 text-sm font-mono text-blytz-neon">#ORD-{9000+i}</td>
                 <td className="p-4 text-sm text-white">Customer_{i}</td>
                 <td className="p-4 text-sm text-gray-400">{i + 1} items</td>
                 <td className="p-4 text-sm font-bold text-white">${(Math.random() * 500).toFixed(2)}</td>
                 <td className="p-4">
                   {i % 2 === 0 ? (
                     <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 text-xs font-bold border border-yellow-500/30">Pending</span>
                   ) : (
                     <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-bold border border-green-500/30">Shipped</span>
                   )}
                 </td>
                 <td className="p-4 text-right">
                    {i % 2 === 0 && <Button size="sm" variant="outline">Fulfill</Button>}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );

  const DashboardAnalytics = () => (
    <div className="animate-in slide-in-from-bottom-4">
       <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
         Store Analytics
       </h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
             <div className="flex justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase">Traffic Source</h3>
                <Globe className="w-4 h-4 text-blytz-neon" />
             </div>
             <div className="space-y-3">
               <div className="flex justify-between text-sm"><span>Direct</span><span className="text-white">45%</span></div>
               <div className="w-full bg-gray-800 h-1 rounded-full"><div className="w-[45%] bg-blytz-neon h-full rounded-full"></div></div>
               <div className="flex justify-between text-sm"><span>Social Media</span><span className="text-white">30%</span></div>
               <div className="w-full bg-gray-800 h-1 rounded-full"><div className="w-[30%] bg-purple-500 h-full rounded-full"></div></div>
             </div>
          </div>
          
          <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
             <div className="flex justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase">Conversion Rate</h3>
                <TrendingUp className="w-4 h-4 text-green-500" />
             </div>
             <div className="text-4xl font-bold text-white mb-2">4.2%</div>
             <p className="text-xs text-gray-500">+0.8% from last month</p>
          </div>

          <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden">
             <div className="flex justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase">Customer Map</h3>
                <Map className="w-4 h-4 text-blue-500" />
             </div>
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent top-10"></div>
             <div className="relative z-10 flex items-center justify-center h-24 text-gray-600 text-xs">
                [Map Visualization Placeholder]
             </div>
          </div>
       </div>

       <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
         <h3 className="font-bold text-white mb-6">Revenue Over Time</h3>
         <div className="h-64 flex items-end gap-1">
             {[...Array(30)].map((_, i) => {
               const height = Math.random() * 100;
               return (
                 <div key={i} className="flex-1 bg-blytz-neon/20 hover:bg-blytz-neon transition-colors rounded-t relative group" style={{height: `${height}%`}}>
                   <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-xs px-2 py-1 rounded text-white pointer-events-none">
                     ${(height * 100).toFixed(0)}
                   </div>
                 </div>
               )
             })}
         </div>
       </div>
    </div>
  );

  const DashboardMarketing = () => (
    <div className="animate-in slide-in-from-bottom-4">
       <h2 className="text-2xl font-display font-bold text-white mb-6">Marketing & Promotions</h2>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Ad Generator */}
         <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-blytz-neon" /> AI Copy Assistant</h3>
            <p className="text-sm text-gray-400 mb-4">Input product details to generate professional ad copy for social media.</p>
            <textarea 
              className="w-full bg-black border border-white/10 rounded p-4 text-sm text-white focus:border-blytz-neon outline-none h-32 mb-4"
              placeholder="e.g. NeonX Sneakers, 50% off, limited time offer..."
              value={adPrompt}
              onChange={(e) => setAdPrompt(e.target.value)}
            />
            <Button 
              className="w-full mb-6" 
              onClick={handleGenerateAd}
              disabled={isGeneratingAd || !adPrompt}
            >
              {isGeneratingAd ? "Generating..." : "Generate Copy"}
            </Button>
            
            {generatedAd && (
              <div className="bg-white/5 border border-white/10 p-4 rounded relative">
                <p className="text-white text-sm font-mono whitespace-pre-wrap">{generatedAd}</p>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
              </div>
            )}
         </div>

         {/* Active Campaigns */}
         <div className="space-y-4">
            <h3 className="font-bold text-white">Active Campaigns</h3>
            <div className="bg-blytz-neon text-black p-6 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-lg">Flash Sale: Electronics</h3>
                 <Badge variant="flash">LIVE</Badge>
              </div>
              <p className="text-sm font-medium mb-4 opacity-80">50% Off CyberDeck V2</p>
              <div className="w-full bg-black/10 h-2 rounded-full mb-1">
                <div className="bg-black h-full w-[75%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs font-bold">
                 <span>750/1000 Claimed</span>
                 <span>Ends in 2h</span>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 p-6 rounded-lg flex items-center justify-center cursor-pointer hover:border-blytz-neon/50 border-dashed transition-colors">
               <div className="text-center text-gray-500">
                 <Plus className="w-8 h-8 mx-auto mb-2" />
                 <span className="font-bold">Create New Campaign</span>
               </div>
            </div>
         </div>
       </div>
    </div>
  );

  const DashboardMessages = () => (
    <div className="animate-in slide-in-from-bottom-4 h-[600px] flex gap-4">
       {/* Conversation List */}
       <div className="w-1/3 bg-black/40 border border-white/10 rounded-lg overflow-hidden flex flex-col">
         <div className="p-4 border-b border-white/10">
           <h3 className="font-bold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Inbox</h3>
         </div>
         <div className="overflow-y-auto flex-1">
           {[1,2,3].map(i => (
             <div key={i} className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 ${i===1 ? 'bg-white/5 border-l-2 border-l-blytz-neon' : ''}`}>
               <div className="flex justify-between mb-1">
                 <span className="text-white font-bold text-sm">Customer {i}</span>
                 <span className="text-xs text-gray-500">2m ago</span>
               </div>
               <p className="text-xs text-gray-400 truncate">I have a question about my order...</p>
             </div>
           ))}
         </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 bg-black/40 border border-white/10 rounded-lg flex flex-col">
         <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <span className="font-bold text-white">Customer 1</span>
            <span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</span>
         </div>
         <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex justify-start">
               <div className="bg-white/10 text-white p-3 rounded-lg rounded-tl-none max-w-[80%] text-sm">
                 I have a question about the shipping time. Is it really same-day?
               </div>
            </div>
            <div className="flex justify-end">
               <div className="bg-blytz-neon/20 text-blytz-neon border border-blytz-neon/20 p-3 rounded-lg rounded-br-none max-w-[80%] text-sm font-mono">
                 Yes, for metro areas we offer same-day drone delivery if ordered before 2 PM.
               </div>
            </div>
         </div>
         <div className="p-4 border-t border-white/10 flex gap-2">
            <input className="flex-1 bg-black border border-white/10 rounded px-4 py-2 text-sm text-white focus:border-blytz-neon outline-none" placeholder="Type a message..." />
            <button className="bg-blytz-neon text-black p-2 rounded hover:bg-white"><Send className="w-4 h-4" /></button>
         </div>
       </div>
    </div>
  );

  const DashboardSettings = () => (
    <div className="animate-in slide-in-from-bottom-4 max-w-2xl">
       <h2 className="text-2xl font-display font-bold text-white mb-6">Settings</h2>
       <div className="space-y-6">
          <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
             <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">Store Profile</h3>
             <div className="grid grid-cols-2 gap-4">
               <Input label="Display Name" defaultValue="Neon Tech Supply" />
               <Input label="Contact Email" defaultValue="admin@neontech.io" />
               <div className="col-span-2">
                 <Input label="Bio / Description" defaultValue="Premium tech gear for the modern age." />
               </div>
             </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
             <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Payment Methods</h3>
             <div className="flex items-center justify-between bg-white/5 p-4 rounded border border-white/5 mb-2">
                <span className="text-sm text-white font-bold">Stripe Connect</span>
                <span className="text-xs text-green-500 font-mono">CONNECTED</span>
             </div>
             <div className="flex items-center justify-between bg-white/5 p-4 rounded border border-white/5">
                <span className="text-sm text-white font-bold">Crypto Wallet</span>
                <span className="text-xs text-gray-500 font-mono">0x71...9A21</span>
             </div>
          </div>

          <div className="flex justify-end gap-4">
             <Button variant="ghost">Cancel</Button>
             <Button>Save Changes</Button>
          </div>
       </div>
    </div>
  );

  const renderSellerDashboard = () => (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-blytz-dark border border-white/10 rounded-lg p-4 flex flex-col gap-2 h-fit shrink-0">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2 mb-6 pb-6 border-b border-white/10">
             <div className="w-10 h-10 bg-blytz-neon text-black rounded font-bold flex items-center justify-center">AC</div>
             <div className="overflow-hidden">
               <div className="font-bold text-white text-sm truncate">Alex Chen</div>
               <div className="text-[10px] text-blytz-neon font-mono truncate">ID: 8821-X</div>
             </div>
          </div>

          <button 
            onClick={() => setDashboardTab('OVERVIEW')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'OVERVIEW' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          
          <button 
            onClick={() => setDashboardTab('ORDERS')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'ORDERS' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Package className="w-4 h-4" /> Orders
          </button>

          <button 
            onClick={() => setDashboardTab('INVENTORY')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'INVENTORY' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Inventory
          </button>

          <button 
            onClick={() => setDashboardTab('ANALYTICS')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'ANALYTICS' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>

          <button 
            onClick={() => setDashboardTab('MARKETING')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'MARKETING' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Megaphone className="w-4 h-4" /> Marketing
          </button>

          <button 
            onClick={() => setDashboardTab('MESSAGES')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'MESSAGES' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare className="w-4 h-4" /> Messages
          </button>

          <button 
            onClick={() => setDashboardTab('BULK')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'BULK' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>

          <div className="mt-auto pt-6 border-t border-white/10">
             <button 
              onClick={() => setDashboardTab('SETTINGS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-all ${dashboardTab === 'SETTINGS' ? 'bg-blytz-neon text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
             <div className="bg-black/40 p-3 rounded border border-white/5 mt-2">
               <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Storage Usage</div>
               <div className="h-1.5 bg-gray-800 rounded-full w-full overflow-hidden mb-1">
                 <div className="h-full bg-purple-500 w-[75%]"></div>
               </div>
               <div className="text-[10px] text-white text-right">75GB / 100GB</div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-blytz-dark border border-white/10 rounded-lg p-6 overflow-y-auto relative custom-scrollbar">
           {/* Background Pattern */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
           
           <div className="relative z-10">
             {dashboardTab === 'OVERVIEW' && <DashboardOverview />}
             {dashboardTab === 'ORDERS' && <DashboardOrders />}
             {dashboardTab === 'INVENTORY' && <DashboardInventory />}
             {dashboardTab === 'ANALYTICS' && <DashboardAnalytics />}
             {dashboardTab === 'MARKETING' && <DashboardMarketing />}
             {dashboardTab === 'MESSAGES' && <DashboardMessages />}
             {dashboardTab === 'BULK' && <DashboardBulkUpload />}
             {dashboardTab === 'SETTINGS' && <DashboardSettings />}
           </div>
        </main>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <div className="p-6 bg-blytz-dark border border-white/10 rounded mb-6 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden border-2 border-blytz-neon">
               <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" />
            </div>
            <h2 className="text-white font-bold text-lg">Alex Chen</h2>
            <p className="text-blytz-neon text-xs uppercase tracking-widest mt-1">Diamond Member</p>
          </div>
          
          <button className="w-full text-left p-3 bg-blytz-neon text-black font-bold rounded flex items-center gap-3">
            <Package className="w-4 h-4" /> Orders
          </button>
          <button className="w-full text-left p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded flex items-center gap-3">
             <User className="w-4 h-4" /> Profile
          </button>
          <button className="w-full text-left p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded flex items-center gap-3">
             <ShieldCheck className="w-4 h-4" /> Security
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            ACTIVE ORDERS <span className="text-xs bg-blytz-neon text-black px-2 py-1 rounded-full">1</span>
          </h2>

          <div className="bg-blytz-dark border border-white/10 rounded overflow-hidden mb-8">
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-white">Order #BLZ-9928-X</h3>
                 <p className="text-sm text-gray-500">Placed on Oct 24, 2024</p>
               </div>
               <Button variant="outline" size="sm">Track Drone</Button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 items-center">
                <img src="https://picsum.photos/400/400?random=1" className="w-16 h-16 rounded bg-black object-cover" />
                <div>
                  <h4 className="text-white font-bold">NeonX Runner Vapor</h4>
                  <p className="text-gray-400 text-sm">Qty: 1 | $149.99</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-blytz-neon font-bold flex items-center gap-2 justify-end">
                    <Loader2Icon className="w-4 h-4 animate-spin" /> In Transit
                  </span>
                  <span className="text-xs text-gray-500">Arriving 14:00 today</span>
                </div>
              </div>
            </div>
            <div className="bg-black/20 p-4">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blytz-neon w-3/4 shadow-[0_0_10px_#BEF264]"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-6">PAST HAULS</h2>
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-blytz-dark border border-white/5 p-4 rounded flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded"></div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Order #BLZ-8821-{i}</h4>
                      <p className="text-xs text-gray-500">Delivered Sep 12</p>
                    </div>
                 </div>
                 <span className="text-white font-mono">$450.00</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );

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
              <Button variant="secondary" size="lg" onClick={() => setView('SELL')}>
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
        onNavClick={handleNavClick}
      />
      
      <main>
        {view === 'HOME' && renderHome()}
        {view === 'PRODUCT_DETAIL' && renderProductDetail()}
        {view === 'CHECKOUT' && renderCheckout()}
        {view === 'DROPS' && renderDrops()}
        {view === 'SELL' && renderSellerDashboard()}
        {view === 'ACCOUNT' && renderAccount()}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-2xl font-display font-bold italic text-white">
            BLYTZ<span className="text-gray-600">.LIVE</span>
           </div>
           <div className="flex gap-8 text-gray-500 text-sm">
             <button onClick={() => setView('DROPS')} className="hover:text-blytz-neon">Drops</button>
             <button onClick={() => setView('SELL')} className="hover:text-blytz-neon">Sell</button>
             <a href="#" className="hover:text-blytz-neon">Terms</a>
             <a href="#" className="hover:text-blytz-neon">Privacy</a>
           </div>
           <div className="text-gray-600 text-sm">
             © 2024 Blytz Commerce Protocol.
           </div>
        </div>
      </footer>

      {/* Chat Assistant */}
      {isChatOpen && <ChatAssistant onClose={() => setIsChatOpen(false)} />}
      
      {/* Chat FAB */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blytz-neon text-black rounded-full shadow-[0_0_20px_rgba(190,242,100,0.5)] flex items-center justify-center z-40 hover:scale-110 transition-transform animate-bounce"
        >
          <MessageSquare className="w-6 h-6 fill-current" />
        </button>
      )}

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
                    onClick={() => {
                      setIsCartOpen(false);
                      setView('HOME');
                    }}
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
                <Button 
                  className="w-full h-14 text-lg"
                  onClick={() => {
                    setIsCartOpen(false);
                    setView('CHECKOUT');
                    setCheckoutStep(1);
                  }}
                >
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

// Helper icon
const Loader2Icon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default App;