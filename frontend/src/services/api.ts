import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { User, CryptoPrices, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: any): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/telegram', data);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const pricesApi = {
  getLatest: async (): Promise<ApiResponse<{ prices: CryptoPrices }>> => {
    const response = await api.get('/prices/latest');
    return response.data;
  },

  getHistorical: async (symbol: string, interval: string = '1h', limit: number = 24): Promise<ApiResponse<{ data: any[] }>> => {
    const response = await api.get('/prices/historical', {
      params: { symbol, interval, limit },
    });
    return response.data;
  },
};

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private subscribers: ((message: any) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  private constructor() {
    this.connect();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private getWebSocketUrl(): string {
    // Use the same host and port as the API for development
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = isLocalhost ? 'localhost:5000' : window.location.host;
    const path = '/ws';
    return `${protocol}//${host}${path}`;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private connect(): void {
    try {
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onclose = null;
        this.ws.onerror = null;
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
        this.ws = null;
      }

      const wsUrl = this.getWebSocketUrl();
      console.log('Connecting to WebSocket at:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.notifySubscribers({ type: 'connection_status', connected: true });
      };
      
      this.ws.onmessage = async (event) => {
        try {
          let data = event.data;
          
          if (data instanceof Blob) {
            try {
              data = await data.text();
            } catch (blobError) {
              console.error('Error reading Blob data:', blobError);
              return;
            }
          }
          
          // Parse JSON if it's a string
          const message = typeof data === 'string' ? JSON.parse(data) : data;
          
          console.log('WebSocket message received:', message);
          this.notifySubscribers(message);
        } catch (error) {
          console.error('Error processing WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifySubscribers({ type: 'connection_status', connected: false });
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifySubscribers({ 
          type: 'connection_error', 
          error: 'WebSocket error',
          details: error
        });
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
      
      console.log(`Attempting to reconnect in ${delay / 1000} seconds... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = window.setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page.');
    }
  }

  public subscribe(callback: (message: any) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(message: any): void {
    this.subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in WebSocket subscriber:', error);
      }
    });
  }

  public close(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = WebSocketService.getInstance();

export default api;
