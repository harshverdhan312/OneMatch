import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from './store/useAuthStore';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import MatchPage from './pages/Match/MatchPage';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import ChatPage from './pages/Chat/ChatPage';
import CheckInModal from './components/common/CheckInModal';
import API from './services/api';

function App() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Global Check-in Listener - only runs when authenticated
  const { data: pendingCheckIn } = useQuery({
    queryKey: ['pendingCheckIn'],
    queryFn: async () => {
      const { data } = await API.get('/checkin/pending');
      return data.data;
    },
    enabled: !!isAuthenticated,
    refetchInterval: 15000, 
  });

  const respondMutation = useMutation({
    mutationFn: async (response) => {
      if (!pendingCheckIn) return;
      await API.post('/checkin/respond', {
        matchId: pendingCheckIn.matchId,
        type: pendingCheckIn.type,
        response
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingCheckIn']);
      queryClient.invalidateQueries(['currentMatch']);
    }
  });

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/onboarding" />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MatchPage /> : <Navigate to="/login" />} />
        <Route path="/onboarding" element={isAuthenticated ? <OnboardingPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Modals */}
      {pendingCheckIn && (
        <CheckInModal 
          isOpen={true} 
          type={pendingCheckIn.type} 
          onRespond={(res) => respondMutation.mutate(res)} 
        />
      )}
    </Router>
  );
}

export default App;
