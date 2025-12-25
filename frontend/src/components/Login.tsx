import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import { Button } from './UI';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

interface LoginProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onClose, onSwitchToRegister }) => {
  const auth = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      const { user, access_token, refresh_token } = response;

      auth.login(user, access_token, refresh_token);
      onClose();
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error || err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-blytz-dark border border-white/10 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold italic text-white mb-2">
              BLYTZ<span className="text-blytz-neon">.LIVE</span>
            </h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blytz-neon outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blytz-neon outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded bg-black border-white/10" />
                Remember me
              </label>
              <a href="#" className="text-blytz-neon hover:underline">Forgot password?</a>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-12 text-lg"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="text-blytz-neon hover:underline font-medium"
            >
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
