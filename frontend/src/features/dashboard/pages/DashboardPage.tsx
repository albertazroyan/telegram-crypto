import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { Header } from '../components/Header';
import { CryptoGrid } from '../components/CryptoGrid';
import { MarketOverview } from '../components/MarketOverview';
import { Footer } from '../components/Footer';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { prices, isConnected } = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cryptoCurrencies = ['btcusdt', 'ethusdt', 'solusdt'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        isConnected={isConnected} 
        user={user} 
        onLogout={handleLogout} 
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, flex: 1 }}>
        <CryptoGrid 
          cryptoCurrencies={cryptoCurrencies} 
          prices={prices as Record<string, any>} 
        />
        
        <Box mt={6}>
          <MarketOverview />
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default DashboardPage;
