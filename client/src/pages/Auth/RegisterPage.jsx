import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import API from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
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
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setApiError('');

    try {
      const { data } = await API.post('/auth/register', {
        email: formData.email,
        password: formData.password
      });
      setAuth(data.user, data.tokens);
      navigate('/onboarding');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space bg-space-gradient flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

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
            <UserPlus size={32} className="text-accent" />
          </motion.div>
          <h1 className="text-4xl font-display text-white mb-2">Create Account</h1>
          <p className="text-white/40 font-body">Begin your journey to intentional matching</p>
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

          <form onSubmit={handleRegister} className="space-y-4">
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

            <Input 
              variant="glass"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              disabled={isLoading}
            />

            <Button 
              type="submit" 
              variant="accent" 
              className="w-full mt-6 bg-violet-rose shadow-lg shadow-primary/20" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              🚀 Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold hover:text-accent-light transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

