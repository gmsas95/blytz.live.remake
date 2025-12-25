import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone } from 'lucide-react';
import { Button } from './UI';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

interface RegisterProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onClose, onSwitchToLogin }) => {
  const auth = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      // Register returns user object, we need to handle token storage
      const user = response;
      
      // Auto-login after registration
      const loginResponse = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      const { user: loginUser, access_token, refresh_token } = loginResponse;
      auth.login(loginUser, access_token, refresh_token);
      onClose();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-blytz-dark border border-white/10 rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold italic text-white mb-2">
              BLYTZ<span className="text-blytz-neon">.LIVE</span>
            </h1>
            <p className="text-gray-400">Create your account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blytz-neon outline-none"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blytz-neon outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

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
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blytz-neon outline-none"
                  placeholder="+1 (555) 1234"
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
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blytz-neon outline-none"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-400">
              <input type="checkbox" required className="mt-1 rounded bg-black border-white/10" />
              <span>
                I agree to the <a href="#" className="text-blytz-neon hover:underline">Terms</a> and <a href="#" className="text-blytz-neon hover:underline">Privacy Policy</a>
              </span>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-12 text-lg"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="text-blytz-neon hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
