import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Button, Badge } from './UI';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { authService, LoginCredentials, RegisterData } from '../services/authService';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const credentials: LoginCredentials = { email, password };
        const authResponse = await authService.login(credentials);
        login(authResponse.user, authResponse.access_token);
        onClose();
      } else {
        const userData: RegisterData = {
          email,
          password,
          first_name: firstName,
          last_name: lastName
        };
        await authService.register(userData);
        // Auto-login after registration
        const credentials: LoginCredentials = { email, password };
        const authResponse = await authService.login(credentials);
        login(authResponse.user, authResponse.access_token);
        onClose();
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-blytz-dark border border-white/10 rounded-lg p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="text-2xl font-display font-bold italic text-white mb-2">
            BLYTZ<span className="text-gray-600">.LIVE</span>
          </div>
          <p className="text-gray-400">
            {isLogin ? 'Welcome back' : 'Join the revolution'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blytz-neon"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blytz-neon"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blytz-neon"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blytz-neon"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {isLogin ? 'SECURE ACCESS' : 'JOIN NOW'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blytz-neon hover:text-white text-sm"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AuthHeader: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount, setIsCartOpen } = useCartStore();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-6">
        <span className="text-gray-300 text-sm">
          Welcome, {user?.first_name}
        </span>
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative text-white hover:text-blytz-neon transition-colors"
        >
          <ShoppingBag className="w-6 h-6" />
          {itemCount > 0 && (
            <Badge variant="hot" className="absolute -top-2 -right-2">
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </button>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowLogin(true)}
          className="text-gray-300 hover:text-blytz-neon text-sm"
        >
          LOGIN
        </button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLogin(true)}
        >
          SELL
        </Button>
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative text-white hover:text-blytz-neon transition-colors"
        >
          <ShoppingBag className="w-6 h-6" />
          {itemCount > 0 && (
            <Badge variant="hot" className="absolute -top-2 -right-2">
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </button>
      </div>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};