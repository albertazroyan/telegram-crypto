import WebSocket from 'ws';
import config from '../config/config.js';
import { redisClient } from './redis.js';

const CACHE_TTL = 300;

const ensureRedisConnected = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('Redis client connected in priceService');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }
  return true;
};

export class BinanceWebSocketProxy {
  constructor(wss) {
    this.wss = wss;
    this.binanceWs = null;
    this.connectionUrl = 'wss://stream.binance.com:9443/ws';
    this.symbols = config.binance?.symbols || ['btcusdt', 'ethusdt', 'solusdt'];
    this.isConnected = false;
    
    this.connect = this.connect.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
    
    this.connect();
    
    redisClient.on('ready', () => {
      console.log('Redis client is ready for BinanceWebSocketProxy');
    });
  }
  
  connect() {
    try {
      if (this.binanceWs) {
        this.binanceWs.close();
      }
      
      // Create streams for all symbols
      const streams = this.symbols.map(symbol => `${symbol}@ticker`).join('/');
      const wsUrl = `${this.connectionUrl}/${streams}`;
      
      console.log('Connecting to Binance WebSocket:', wsUrl);
      this.binanceWs = new WebSocket(wsUrl);
      
      // Set up event handlers
      this.binanceWs.on('open', this.onOpen);
      
      this.binanceWs.on('message', this.onMessage);
      this.binanceWs.on('close', this.onClose);
      this.binanceWs.on('error', this.onError);
      
    } catch (error) {
      console.error('Error connecting to Binance WebSocket:', error);
      setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
    }
  }
  
  onOpen() {
    console.log('Connected to Binance WebSocket');
    console.log(`Subscribed to symbols: ${this.symbols.join(', ')}`);
  }
  
  async onMessage(data) {
    try {
      let messageData;
      
      await ensureRedisConnected();
      
      if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
        messageData = JSON.parse(data.toString('utf8'));
      } else if (typeof data === 'string') {
        messageData = JSON.parse(data);
      } else {
        messageData = data;
      }
      
      // Only process ticker data
      if (messageData.e === '24hrTicker') {
        const symbol = messageData.s?.toLowerCase();
        if (!symbol) {
          console.error('Received message with no symbol:', messageData);
          return;
        }
        
        const priceData = {
          symbol: symbol,
          price: parseFloat(messageData.c) || 0,
          change: parseFloat(messageData.p) || 0,
          changePercent: parseFloat(messageData.P) || 0,
          high: parseFloat(messageData.h) || 0,
          low: parseFloat(messageData.l) || 0,
          volume: parseFloat(messageData.v) || 0,
          timestamp: messageData.E || Date.now()
        };
        
        console.log(`📊 ${symbol.toUpperCase()}: $${priceData.price} (${priceData.changePercent}%)`);
        
        try {
          const result = await redisClient.set(
            `price:${symbol}`,
            JSON.stringify(priceData),
            {
              EX: CACHE_TTL,
              NX: true
            }
          );
          
          if (result !== 'OK') {
            console.warn(`Failed to set price for ${symbol} in Redis`);
          }
          
          await redisClient.zAdd('prices:latest', {
            score: priceData.timestamp,
            value: priceData.symbol
          });
          
        } catch (redisError) {
          console.error('Error caching price in Redis:', redisError);
        }
        
        if (this.wss && this.wss.clients) {
          const clients = Array.from(this.wss.clients).filter(
            client => client.readyState === WebSocket.OPEN
          );
          
          if (clients.length > 0) {
            const messageString = JSON.stringify({
              type: 'price_update',
              data: priceData
            });
            
            clients.forEach(client => {
              try {
                client.send(messageString);
              } catch (err) {
                console.error('Error sending message to client:', err);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error forwarding WebSocket message:', error);
    }
  }
  
  onClose() {
    console.log('❌ Binance WebSocket connection closed. Reconnecting in 5 seconds...');
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect to Binance WebSocket...');
      this.connect();
    }, 5000);
  }

  onError = (error) => {
    console.error('WebSocket error:', error);
  }

  /**
   * Get latest prices from Redis cache
   * @returns {Promise<Object>} Object with symbol-price pairs
   */
  getLatestPrices = async () => {
    try {
      const symbols = this.symbols;
      const pipeline = redisClient.pipeline();

      // Queue up gets for all symbols
      symbols.forEach(symbol => {
        pipeline.get(`price:${symbol}`);
      });

      // Execute all gets in a single round trip
      const results = await pipeline.exec();

      // Process results
      const prices = {};
      results.forEach(([err, data], index) => {
        if (!err && data) {
          try {
            const priceData = JSON.parse(data);
            prices[priceData.symbol] = priceData;
          } catch (parseError) {
            console.error(`Error parsing price data for ${symbols[index]}:`, parseError);
          }
        }
      });

      return prices;

    } catch (error) {
      console.error('Error getting latest prices from cache:', error);
      return {};
    }
  }

  // Clean up resources
  close = () => {
    if (this.binanceWs) {
      this.binanceWs.close();
      this.binanceWs = null;
    }
  }
}

export default BinanceWebSocketProxy;
