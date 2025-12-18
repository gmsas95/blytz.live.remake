import React, { useState } from 'react';
import './index.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Sample products data
  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
      rating: 4.5,
      badge: "HOT",
      description: "Crystal clear audio with active noise cancellation"
    },
    {
      id: 2,
      name: "Smart Watch Pro",
      price: 449.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
      rating: 4.8,
      badge: "NEW",
      description: "Track your fitness and stay connected"
    },
    {
      id: 3,
      name: "4K Webcam Ultra",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
      rating: 4.3,
      badge: "FLASH",
      description: "Professional quality video for streaming"
    },
    {
      id: 4,
      name: "Mechanical Keyboard RGB",
      price: 159.99,
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91e20b?w=300",
      rating: 4.7,
      badge: null,
      description: "Premium typing experience with RGB lighting"
    },
    {
      id: 5,
      name: "Wireless Gaming Mouse",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=300",
      rating: 4.6,
      badge: "HOT",
      description: "Precision gaming with customizable DPI"
    },
    {
      id: 6,
      name: "USB-C Hub Pro",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300",
      rating: 4.4,
      badge: "NEW",
      description: "Expand your connectivity with 10 ports"
    }
  ];

  const categories = ["All Products", "Electronics", "Audio", "Computers", "Gaming", "Accessories"];
  const [selectedCategory, setSelectedCategory] = useState("All Products");

  const filteredProducts = selectedCategory === "All Products" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (productId: number) => {
    setCartCount(prev => prev + 1);
    // Add to cart animation
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        className="w-4 h-4" 
        fill={i < Math.floor(rating) ? "currentColor" : "none"}
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l3.976-2.888a1 1 0 011.818 0l3.976 2.888c.753.566.382 1.818-.588 1.818h-4.914a1 1 0 00-.951.69l-1.519 4.674c-.3.922-1.603.922-1.902 0z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/10 to-black">
        <div className="absolute inset-0 opacity-20 grid-pattern-bg"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 nav-glass">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Blytz
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                Categories
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                Deals
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                Support
              </button>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="hidden md:block text-white/80 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* User Account */}
              <button className="hidden md:block text-white/80 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Cart */}
              <button className="relative btn-gradient-primary px-4 py-2 rounded-full">
                <span className="font-semibold">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu */}
              <button 
                className="md:hidden text-white/80 hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            {/* Gradient Background */}
            <div className="hero-gradient-bg"></div>
            
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Welcome to
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Blytz.live
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
                The ultimate marketplace for cutting-edge tech and digital innovation. Experience shopping redefined.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-gradient-primary px-8 py-4 text-lg shadow-lg hover:shadow-purple-500/25">
                  Start Shopping
                </button>
                <button className="btn-gradient-secondary px-8 py-4 text-lg">
                  Become a Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full border transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
                    : 'border-white/20 text-white/80 hover:border-white/40'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="product-card group relative"
              >
                {/* Badge */}
                {product.badge && (
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${
                    product.badge === 'HOT' ? 'product-badge-hot' :
                    product.badge === 'NEW' ? 'product-badge-new' :
                    'product-badge-flash'
                  }`}>
                    {product.badge}
                  </div>
                )}

                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">{product.description}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-white/60 text-sm ml-2">{product.rating}</span>
                  </div>

                  {/* Price and Add to Cart */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${product.price}</span>
                    <button 
                      onClick={() => addToCart(product.id)}
                      className="btn-gradient-primary px-4 py-2"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 footer-glass py-12 px-4 mt-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
                <span className="text-xl font-bold">Blytz</span>
              </div>
              <p className="text-white/60">The future of digital marketplace innovation.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-white/60">
                <li><button className="hover:text-white transition-colors">Browse Products</button></li>
                <li><button className="hover:text-white transition-colors">Categories</button></li>
                <li><button className="hover:text-white transition-colors">Hot Deals</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/60">
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors">Returns</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="text-white/60 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="text-white/60 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                </div>
                <p className="text-white/60 text-sm">Join 50,000+ subscribers</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 Blytz.live. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;