import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import API from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setApiError('');

    try {
      const { data } = await API.post('/auth/login', formData);
      setAuth(data.user, data.tokens);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space bg-space-gradient flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 z-10"
      >
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-6"
          >
            <LogIn size={32} className="text-primary" />
          </motion.div>
          <h1 className="text-4xl font-display text-white mb-2">Welcome Back</h1>
          <p className="text-white/40 font-body">Sign in to your OneMatch universe</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          {apiError && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-accent/10 border border-accent/20 p-4 rounded-xl flex items-center gap-3 text-accent text-sm"
            >
              <AlertCircle size={18} />
              {apiError}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input 
              variant="glass"
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              disabled={isLoading}
            />

            <Input 
              variant="glass"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              disabled={isLoading}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" size="sm" className="text-xs text-primary hover:text-primary-light transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              variant="gradient" 
              className="w-full mt-4" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm">
          New to OneMatch?{' '}
          <Link to="/register" className="text-primary font-semibold hover:text-primary-light transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

