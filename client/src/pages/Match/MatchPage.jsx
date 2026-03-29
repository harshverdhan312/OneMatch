import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, X, MessageCircle, MapPin, Music, LogOut } from 'lucide-react';
import Button from '../../components/common/Button';
import API from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const MatchPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['currentMatch'],
    queryFn: async () => {
      const { data } = await API.get('/match/current');
      return data.match;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space bg-space-gradient flex flex-col items-center justify-center space-y-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-48 h-48 bg-primary rounded-full blur-3xl absolute -top-12 -left-12"
          />
          <div className="w-24 h-24 border-2 border-primary/10 rounded-full flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-t-2 border-primary rounded-full"
            />
          </div>
        </div>
        <div className="text-center z-10">
          <p className="text-white font-display text-2xl font-bold mb-2">Finding your match...</p>
          <p className="text-white/30 text-sm tracking-widest uppercase font-semibold">The algorithm is breathing</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-space bg-space-gradient flex flex-col items-center justify-center p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full" />
        <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center text-accent mb-4 border border-white/10 z-10">
          <Heart size={48} fill="currentColor" />
        </div>
        <h1 className="text-4xl font-display text-white z-10">In Orbit</h1>
        <p className="text-white/40 max-w-xs z-10">You're in the waiting pool. We'll find your perfect match soon.</p>
        <div className="flex flex-col gap-4 w-full max-w-xs z-10">
          <Button variant="glass">Check Preferences</Button>
          <button 
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-accent transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={14} /> Terminate Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space bg-space-gradient flex flex-col px-6 py-12 relative overflow-hidden">
       {/* Background Orbs */}
       <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
       <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden relative glass-card shadow-2xl"
        >
          {/* Photo Placeholder */}
          <div className="absolute inset-0">
             <img 
               src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800" 
               alt="Match" 
               className="w-full h-full object-cover" 
             />
             <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-space via-space/40 to-transparent" />
          </div>

          {/* Info Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-8 space-y-4">
            <div>
              <h2 className="text-4xl font-display text-white">Sophie, 24</h2>
              <p className="text-white/60 flex items-center gap-2 mt-1 font-body">
                <MapPin size={14} className="text-accent" /> Paris, France
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['Vinyl', 'Late Nights', 'Existentialism'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white font-medium border border-white/5">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
               <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-accent">
                 <Music size={18} />
               </div>
               <div className="text-xs">
                 <p className="text-white/40 uppercase tracking-tighter font-bold">Spotify Resonance</p>
                 <p className="text-white font-medium">Arctic Monkeys Overlap</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-8 mt-12">
          <button className="w-16 h-16 rounded-full glass-card flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={28} />
          </button>
          <button className="w-20 h-20 rounded-full bg-violet-rose shadow-xl shadow-primary/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all">
            <Heart size={36} fill="currentColor" />
          </button>
          <button className="w-16 h-16 rounded-full glass-card flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <MessageCircle size={28} />
          </button>
        </div>


        {/* Global Controls */}
        <div className="mt-12">
           <button 
             onClick={() => {
               useAuthStore.getState().logout();
               window.location.href = '/login';
             }}
             className="text-xs font-bold uppercase tracking-widest text-text-muted hover:text-accent transition-colors flex items-center gap-2"
           >
             <LogOut size={14} /> Terminate Session
           </button>
        </div>
      </div>
    </div>
  );
};


export default MatchPage;

