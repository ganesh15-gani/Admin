import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/ToastContext';
import { Button } from '../../components/ui/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await authService.register(name, email, password);
      success('Account created successfully');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-end p-6 lg:p-24 overflow-hidden animate-fade-in">
      {/* Full Background Image */}
      <img
        className="absolute inset-0 h-full w-full object-cover scale-105"
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80"
        alt="Luxury Property Background"
      />
      
      {/* Gradient / Blur Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/80"></div>

      {/* Floating Register Card on Right */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in-right border border-white/20">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/40 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center">
              Create Account
            </h1>
            <p className="text-sm text-slate-500 mt-2 text-center">
              Join the StayZen Admin network
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all duration-200 outline-none"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all duration-200 outline-none"
                  placeholder="admin@stayzen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all duration-200 outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full flex justify-center items-center py-3.5 text-base rounded-xl shadow-lg shadow-brand-500/25 group hover:shadow-brand-500/40 transition-all duration-300"
                isLoading={isLoading}
              >
                Sign Up securely
                {!isLoading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1.5 transition-transform" />}
              </Button>
            </div>
            
            <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
