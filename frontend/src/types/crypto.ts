// Crypto price data type
export interface CryptoPrice {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

// Type for the prices object with symbol keys
export type CryptoPrices = Record<string, CryptoPrice>;

// Type for the WebSocket message
export interface WebSocketMessage {
  type: 'price_update' | 'error' | 'connection' | 'disconnect';
  data: any;
}

// Type for the price update message
export interface PriceUpdateMessage extends WebSocketMessage {
  type: 'price_update';
  data: CryptoPrices;
}

// Type for error message
export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  data: string;
}

// Type for connection status
export interface ConnectionMessage extends WebSocketMessage {
  type: 'connection' | 'disconnect';
  data: {
    isConnected: boolean;
    timestamp: number;
  };
}
