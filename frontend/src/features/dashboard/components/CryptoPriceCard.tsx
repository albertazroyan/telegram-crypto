import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import type { CryptoPrice } from '../../../types';

interface CryptoPriceCardProps {
  symbol: string;
  price: CryptoPrice | null;
  loading?: boolean;
}

const CryptoPriceCard: React.FC<CryptoPriceCardProps> = ({ symbol, price, loading = false }) => {
  const formatPriceValue = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(num);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const formatVolume = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  if (loading) {
    return (
      <Card sx={{ minWidth: 275, height: '100%', borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Skeleton variant="text" width={80} height={32} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
          <Skeleton variant="text" width={120} height={48} />
          <Skeleton variant="text" width={80} height={24} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (!price) {
    return (
      <Card sx={{ minWidth: 275, height: '100%', borderRadius: 2, boxShadow: 3, opacity: 0.7 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="div" fontWeight="bold" color="text.secondary">
              {symbol.toUpperCase()}
            </Typography>
            <TrendingFlat color="disabled" />
          </Box>
          <Typography variant="h6" color="text.secondary">
            No data available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Waiting for price updates...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const changePercent = typeof price.changePercent === 'string' 
    ? parseFloat(price.changePercent) 
    : price.changePercent;
  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;
  const changeColor = isPositive ? 'success.main' : isNeutral ? 'text.secondary' : 'error.main';
  const ChangeIcon = isPositive ? TrendingUp : isNeutral ? TrendingFlat : TrendingDown;

  return (
    <Card sx={{ minWidth: 275, height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div" fontWeight="bold">
            {symbol.toUpperCase()}
          </Typography>
          <ChangeIcon sx={{ color: changeColor }} />
        </Box>
        
        <Box mb={2}>
          <Typography variant="h4" component="div" fontWeight="bold">
            {formatPriceValue(price.price)}
          </Typography>
          <Typography 
            variant="subtitle1" 
            color={changeColor}
            sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
          >
            {formatPercentage(price.changePercent)} (24h)
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Last Updated
            </Typography>
            <Typography variant="body2">
              {new Date(price.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">
              24h Volume
            </Typography>
            <Typography variant="body2">
              {formatVolume(price.volume)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CryptoPriceCard;
