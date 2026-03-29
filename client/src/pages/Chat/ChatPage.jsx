import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, ChevronLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';

const ChatPage = () => {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { user } = useAuthStore();

  // 1. Get current match first (to get matchId)
  const { data: match } = useQuery({
    queryKey: ['currentMatch'],
    queryFn: async () => {
      const { data } = await API.get('/match/current');
      return data.match;
    }
  });

  const matchId = match?._id;

  // 2. Get messages
  const { data: messages } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      const { data } = await API.get(`/chat/${matchId}`);
      return data.messages;
    },
    enabled: !!matchId,
    refetchInterval: 3000, // Poll for MVP
  });

  // 3. Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (text) => {
      const { data } = await API.post('/chat/send', { matchId, text });
      return data.message;
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries(['messages', matchId]);
    }
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage.mutate(text);
  };

  if (!match) return <div className="min-h-screen flex items-center justify-center text-gold">Loading conversation...</div>;

  return (
    <div className="flex flex-col h-screen bg-obsidian">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-obsidian-light border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30" />
            <div>
              <h3 className="font-editorial text-lg text-white">Sophie</h3>
              <p className="text-[10px] text-gold uppercase tracking-widest">Active Match</p>
            </div>
          </div>
        </div>
        <button className="text-white/40"><MoreVertical size={20} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages?.map((msg, i) => {
          const isMe = msg.sender === user.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm ${
                isMe ? 'bg-gold-gradient text-obsidian rounded-br-none shadow-gold-glow' : 'bg-white/5 text-white/90 rounded-bl-none border border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-obsidian-light border-t border-white/5">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:border-gold/50 transition-all font-sans"
          />
          <button 
            type="submit"
            className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-obsidian shadow-gold-glow active:scale-95 transition-all"
            disabled={sendMessage.isLoading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
