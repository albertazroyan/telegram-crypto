import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Paper, Alert, useTheme } from '@mui/material';
import TelegramLoginButton from '../components/TelegramLoginButton';

import { useAuth } from '../../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const handleSuccess = async (userData: any) => {
    try {
      await login(userData);
      navigate(from, { replace: true });
    } catch (e: any) {
      console.error('Login failed:', e);
      setError(e?.message || 'Login failed');
    }
  };

  const handleError = (error: Error) => {
    console.error('Telegram login error:', error);
    setError(error.message || 'Failed to login with Telegram');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Welcome to Crypto Tracker
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Sign in with your Telegram account to access real-time cryptocurrency prices
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: '100%', maxWidth: 300, mb: 2 }}>
            <TelegramLoginButton
              botName={import.meta.env.VITE_TELEGRAM_BOT_NAME || 'your_bot_username'}
              onAuthCallback={handleSuccess}
              onError={handleError}
              buttonSize="large"
              cornerRadius={8}
            />
          </Box>

          <Typography 
            variant="caption" 
            color="textSecondary" 
            align="center"
            sx={{
              mt: 2,
              display: 'block',
              maxWidth: '80%',
              color: theme.palette.text.secondary,
            }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
