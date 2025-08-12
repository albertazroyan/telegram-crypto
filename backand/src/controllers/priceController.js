import { redisClient } from '../services/redis.js';

/**
 * Get latest prices from Redis cache
 */
const getLatestPrices = async (req, res) => {
  try {
    if (!redisClient.isOpen) {
      console.log('Redis client not connected, attempting to connect...');
      await redisClient.connect();
    }

    const priceKeys = await redisClient.keys('price:*');
    
    if (!priceKeys || priceKeys.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No price data available',
        message: 'Waiting for initial price data from Binance...' 
      });
    }

    const prices = {};
    for (const key of priceKeys) {
      const symbol = key.replace('price:', '');
      const priceData = await redisClient.get(key);
      if (priceData) {
        try {
          prices[symbol] = JSON.parse(priceData);
        } catch (e) {
          console.error(`Error parsing price data for ${key}:`, e);
        }
      }
    }
    
    if (Object.keys(prices).length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No valid price data available',
        message: 'Price data is present but could not be parsed' 
      });
    }
    
    res.json({ 
      success: true,
      timestamp: Date.now(),
      data: prices 
    });
    
  } catch (error) {
    console.error('Error getting latest prices:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch price data',
      details: error.message,
      redisConnected: redisClient?.isOpen || false
    });
  }
};

export default getLatestPrices;
