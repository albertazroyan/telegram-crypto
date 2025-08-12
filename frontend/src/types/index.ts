// User related types
export interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: number;
  hash?: string;
}

// Re-export all crypto types
export * from './crypto';

// Authentication related types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Crypto price related types
export interface CryptoPrice {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface CryptoPrices {
  [key: string]: CryptoPrice;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

// WebSocket message types
export type WsMessageType = 'price_update' | 'error' | 'info';

export interface WsMessage<T = any> {
  type: WsMessageType;
  data: T;
  timestamp: number;
}

// Component props
export interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Form data types
export interface LoginFormData {
  username: string;
  password: string;
}
