import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, LogOut } from 'lucide-react';
import Button from '../common/Button';

const CheckInModal = ({ isOpen, type, onRespond }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-text-primary/40 backdrop-blur-md z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 bg-white rounded-t-[2.5rem] p-10 z-[60] shadow-modal border-t border-bg-surface"
          >
            <div className="w-12 h-1 bg-bg-surface rounded-full mx-auto mb-8" />
            
            <div className="text-center space-y-6 max-w-sm mx-auto">
              <div className="w-20 h-20 bg-accent-light rounded-full mx-auto flex items-center justify-center text-accent">
                <Sparkles size={40} />
              </div>

              <div>
                <h2 className="text-3xl font-display text-text-primary mb-2">Still feeling it?</h2>
                <p className="text-text-secondary text-base">
                  {type === '24h' ? "It's been a full day since your orbits aligned." : "A week has passed in this shared space."}
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <Button 
                  variant="accent"
                  className="w-full h-14 flex items-center justify-center gap-3" 
                  onClick={() => onRespond('yes')}
                >
                  <Heart size={20} fill="currentColor" /> Yes, keep chatting
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full h-14 flex items-center justify-center gap-3 text-text-muted hover:text-accent hover:bg-accent-light"
                  onClick={() => onRespond('move_on')}
                >
                  <LogOut size={20} /> Move on
                </Button>
              </div>

              <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest pt-4">
                Both of you must respond to continue
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckInModal;

