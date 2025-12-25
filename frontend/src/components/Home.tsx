import React from 'react';
import { ArrowRight, Zap, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Button, Badge } from './UI';
import { Product } from '../types';
import { useFeaturedProducts } from '../../hooks/useProducts';

interface HomeProps {
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ onAddToCart, onProductClick }) => {
  const { products: featuredProducts, loading: featuredLoading } = useFeaturedProducts(8);

  return (
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
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-blytz-dark py-16 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blytz-neon/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blytz-neon" />
              </div>
              <h3 className="text-white font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Instant order processing and same-day dispatch</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blytz-neon/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blytz-neon" />
              </div>
              <h3 className="text-white font-bold mb-2">Verified Sellers</h3>
              <p className="text-gray-400 text-sm">All sellers vetted for quality and reliability</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blytz-neon/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blytz-neon" />
              </div>
              <h3 className="text-white font-bold mb-2">Free Shipping</h3>
              <p className="text-gray-400 text-sm">On all orders with Blytz Prime membership</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blytz-neon/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-blytz-neon" />
              </div>
              <h3 className="text-white font-bold mb-2">Easy Returns</h3>
              <p className="text-gray-400 text-sm">30-day hassle-free return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="bg-blytz-black py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white italic">Featured Gear</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white transition-all">←</button>
              <button className="w-10 h-10 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white transition-all">→</button>
            </div>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-blytz-dark border border-white/10 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-white/5"></div>
                  <div className="p-4">
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-6 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  className="group border border-white/10 bg-blytz-dark overflow-hidden hover:border-blytz-neon transition-all cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    {product.isFlash && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="flash">
                          {product.timeLeft || 'Flash Sale'}
                        </Badge>
                      </div>
                    )}
                    {product.isHot && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="hot">Hot</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-2 line-clamp-1">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-mono text-blytz-neon">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!featuredLoading && featuredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p>No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
