import React, { useState } from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { Button } from './UI';
import { useAuthStore } from '../../store/authStore';

interface AccountProps {
  onViewChange: (view: ViewState) => void;
}

export const Account: React.FC<AccountProps> = ({ onViewChange }) => {
  const auth = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: auth.user?.email || '',
    firstName: auth.user?.first_name || '',
    lastName: auth.user?.last_name || '',
    phone: auth.user?.phone || ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update profile via API would go here
      // For now, update local state
      auth.updateUser({
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || ''
      });

      alert('Account information saved successfully!');
    } catch (error) {
      console.error('Failed to save account:', error);
      alert('Failed to save account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!auth.user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20 bg-blytz-dark border border-white/10 rounded-lg">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">MY ACCOUNT</h1>
          <p className="text-gray-400 mb-6">Please login to access your account</p>
          <Button onClick={() => onViewChange('HOME')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold text-white mb-8 italic">MY ACCOUNT</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-blytz-dark border border-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                className="bg-black border border-white/10 rounded px-4 py-2 text-white focus:border-blytz-neon outline-none"
              />
              <input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
                className="bg-black border border-white/10 rounded px-4 py-2 text-white focus:border-blytz-neon outline-none"
              />
              <div className="md:col-span-2">
                <input
                  label="Email"
                  value={formData.email}
                  disabled
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  className="bg-black border border-white/10 rounded px-4 py-2 text-white focus:border-blytz-neon outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 1234"
                  className="bg-black border border-white/10 rounded px-4 py-2 text-white focus:border-blytz-neon outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button isLoading={isLoading}>Save Changes</Button>
              <Button variant="outline" onClick={() => auth.logout()}>Logout</Button>
            </div>
          </form>
        </div>

        <div className="bg-blytz-dark border border-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Account Type</h2>
          <div className="p-4 bg-blytz-neon/10 rounded mb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blytz-neon" />
              <div>
                <p className="font-bold text-white text-lg">{auth.user.role.toUpperCase()}</p>
                <p className="text-gray-400 text-sm">
                  {auth.user.email_verified ? 'Verified Account' : 'Verification Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
