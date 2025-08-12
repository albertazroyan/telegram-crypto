import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // Database configuration
  db: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'crypto_tracker',
    host: 'postgres', // Always use the service name in Docker
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  
  // Redis configuration
  redis: {
    host: 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    widgetId: process.env.TELEGRAM_LOGIN_WIDGET_ID || 'crypto_yerevan5_pricebot',
  },
  
  binance: {
    wsBaseUrl: 'wss://stream.binance.com:9443/ws',
    symbols: ['btcusdt', 'ethusdt', 'solusdt'],
    priceUpdateInterval: 1000,
  },

  // CORS configuration
  cors: {
    origin: [
      /^https?:\/\/localhost(:[0-9]+)?$/,
      /^https?:\/\/.*\.serveo\.net$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400 // 24 hours
  },

  // Security configuration
  security: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://telegram.org',
          'https://*.telegram.org',
          ...(process.env.NODE_ENV === 'development' ? ["'unsafe-inline'", "'unsafe-eval'"] : [])
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'"
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https://telegram.org',
          'https://*.telegram.org',
          'https://t.me'
        ],
        connectSrc: [
          "'self'",
          'ws:',
          'wss:',
          `http://localhost:${process.env.PORT || 5000}`,
          `ws://localhost:${process.env.PORT || 5000}`,
          'http://localhost:5173',
          'ws://localhost:5173',
          'https://telegram.org',
          'https://*.telegram.org',
          'https://oauth.telegram.org',
          'https://t.me'
        ],
        frameSrc: [
          'https://oauth.telegram.org',
          'https://t.me',
          'https://*.telegram.org'
        ]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }
};

export default config;
