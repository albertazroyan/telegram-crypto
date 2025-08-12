import { Box, Typography } from '@mui/material';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mr: 2,
    p: 1,
    borderRadius: 1,
    bgcolor: isConnected ? 'success.light' : 'error.light',
    color: 'white',
  }}>
    <Box sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      bgcolor: 'white',
      mr: 1,
      opacity: isConnected ? 1 : 0.7,
    }} />
    <Typography variant="caption">
      {isConnected ? 'Live' : 'Disconnected'}
    </Typography>
  </Box>
);
