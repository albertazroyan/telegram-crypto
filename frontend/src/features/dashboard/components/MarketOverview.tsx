import { Paper, Typography } from '@mui/material';

export const MarketOverview: React.FC = () => (
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Typography variant="h6" gutterBottom>
      Market Overview
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      Real-time cryptocurrency prices are updated every second. The data is provided by Binance WebSocket API.
    </Typography>
    <Typography variant="caption" color="text.secondary">
      Last updated: {new Date().toLocaleTimeString()}
    </Typography>
  </Paper>
);
