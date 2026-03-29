import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Music, Heart, MapPin, User as UserIcon } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import API from '../../services/api';

const steps = [
  { id: 1, title: 'Basics', icon: UserIcon },
  { id: 2, title: 'Preferences', icon: Heart },
  { id: 3, title: 'Interests', icon: MapPin },
  { id: 4, title: 'Questions', icon: Heart },
  { id: 5, title: 'Spotify', icon: Music },
];

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    basicInfo: { name: '', city: '', gender: '' },
    preferences: { genderPreference: '' },
    interests: [],
    questions: [],
    spotifyProfile: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (currentStep < 5) {
      setIsLoading(true);
      try {
        await API.put(`/profile/step/${currentStep}`, formData);
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Failed to save step', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-space bg-space-gradient px-6 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      {/* Progress Header */}
      <div className="flex justify-between items-center mb-12 glass-card p-4 relative z-10">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isActive ? 'border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 
                isCompleted ? 'border-primary/40 bg-primary/20 text-primary' : 'border-white/10 text-white/20'
              }`}>
                <Icon size={18} />
              </div>
              <span className={`text-[10px] mt-2 font-display font-semibold uppercase tracking-wider ${isActive ? 'text-white' : 'text-white/20'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="flex-1 max-w-md mx-auto w-full glass-card p-10 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-8 h-full flex flex-col"
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-display text-white mb-2">The Basics</h2>
                  <p className="text-white/40 font-body">Connect your orbit to the community</p>
                </div>
                <Input 
                  variant="glass"
                  label="Display Name" 
                  placeholder="Your cosmic alias" 
                  value={formData.basicInfo.name}
                  onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, name: e.target.value}})}
                />
                <Input 
                  variant="glass"
                  label="Location" 
                  placeholder="Paris, London, Mars..." 
                  value={formData.basicInfo.city}
                  onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, city: e.target.value}})}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/40 ml-1">Identity</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map(g => (
                      <button
                        key={g}
                        onClick={() => setFormData({...formData, basicInfo: {...formData.basicInfo, gender: g}})}
                        className={`py-3 rounded-xl border transition-all font-body font-medium ${
                          formData.basicInfo.gender === g ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/10' : 'border-white/10 text-white/40 hover:bg-white/5'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-display text-white mb-2">Preferences</h2>
                  <p className="text-white/40">Who are you looking to connect with?</p>
                </div>
                <div className="space-y-3">
                   {['male', 'female', 'everyone'].map(p => (
                      <button
                        key={p}
                        onClick={() => setFormData({...formData, preferences: {genderPreference: p}})}
                        className={`w-full py-4 rounded-xl border text-left px-6 transition-all font-body font-medium ${
                          formData.preferences.genderPreference === p ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/10' : 'border-white/10 text-white/40 hover:bg-white/5'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {currentStep > 2 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary relative"
                >
                  <Heart size={48} fill="currentColor" className="relative z-10" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125" />
                </motion.div>
                <div>
                  <p className="text-white font-display text-2xl font-bold">Resonating...</p>
                  <p className="text-white/40 italic font-body">Syncing your vibration with the pool</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-auto flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button variant="glass" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1">
                  Back
                </Button>
              )}
              <Button variant="gradient" className="flex-1" onClick={handleNext} isLoading={isLoading}>
                {currentStep === 5 ? 'Venture In' : 'Continue'}
                {!isLoading && <ChevronRight size={18} className="ml-1" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

};

export default OnboardingPage;

