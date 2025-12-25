import React from 'react';
import { Button } from './UI';
import { useAuthStore } from '../../store/authStore';

interface SellerDashboardProps {
  user: User | null;
  onLoginClick: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ user, onLoginClick }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">SELLER DASHBOARD</h1>
        {user ? (
          <p className="text-gray-400">Welcome back, {user.first_name}</p>
        ) : (
          <Button onClick={onLoginClick}>Login to Start Selling</Button>
        )}
      </div>

      <div className="max-w-2xl">
        <div className="bg-blytz-dark border border-white/10 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-6">Seller Dashboard</h2>
          <div className="p-4 text-gray-400 mb-4">
            <p className="mb-2">Welcome to the seller portal!</p>
            <p>Product listing and auction management features are coming soon.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded p-4 text-center transition-all">
              <div className="w-10 h-10 bg-blytz-neon/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📦</span>
              </div>
              <span className="text-sm text-white">My Products</span>
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded p-4 text-center transition-all">
              <div className="w-10 h-10 bg-blytz-neon/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔨</span>
              </div>
              <span className="text-sm text-white">List Product</span>
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded p-4 text-center transition-all">
              <div className="w-10 h-10 bg-blytz-neon/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-sm text-white">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
