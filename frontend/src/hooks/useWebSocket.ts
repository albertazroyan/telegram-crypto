import { useEffect, useState, useCallback } from 'react';
import type { CryptoPrices } from '../types';
import { wsService } from '../services/api';

export const useWebSocket = () => {
  const [prices, setPrices] = useState<CryptoPrices>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrices = useCallback((newPrices: CryptoPrices) => {
    console.log('Updating prices:', newPrices);
    setPrices((prevPrices: CryptoPrices) => ({
      ...prevPrices,
      ...newPrices,
    }));
  }, []);

  const handleMessage = useCallback((message: any) => {
    console.log('Handling WebSocket message:', message);
    
    if (message.type === 'price_update' && message.data) {
      const { symbol, price, changePercent, volume, timestamp } = message.data;
      const normalizedSymbol = symbol.toLowerCase();
      
      const priceData = {
        [normalizedSymbol]: {
          symbol: normalizedSymbol,
          price: parseFloat(price),
          changePercent: parseFloat(changePercent),
          volume: parseFloat(volume),
          timestamp: timestamp || Date.now()
        }
      };
      
      console.log('Processed price update:', priceData);
      updatePrices(priceData);
    }

    else if (message.type === 'error') {
      console.error('WebSocket error:', message.data || message);
      setError(message.data || 'An error occurred');
    }

    else if (message.type === 'connection_status') {
      console.log('Connection status:', message.connected ? 'Connected' : 'Disconnected');
      setIsConnected(message.connected);
    }

    else {
      console.log('Unhandled WebSocket message type:', message);
    }
  }, [updatePrices]);

  useEffect(() => {
    const unsubscribe = wsService.subscribe(handleMessage);
    
    const handleOpen = () => setIsConnected(true);
    const handleClose = () => setIsConnected(false);
    
    window.addEventListener('online', handleOpen);
    window.addEventListener('offline', handleClose);
    
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOpen);
      window.removeEventListener('offline', handleClose);
    };
  }, [handleMessage]);

  const getPrice = useCallback((symbol: string) => {
    return prices[symbol.toLowerCase()] || null;
  }, [prices]);

  return {
    prices,
    getPrice,
    isConnected,
    error,
  };
};

export default useWebSocket;
