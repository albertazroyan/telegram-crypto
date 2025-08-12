import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import config from './config/config.js';
import { testConnection } from './database/index.js';
import setupRoutes from './routes/index.js';
import { BinanceWebSocketProxy } from './services/priceService.js';
import { redisClient } from './services/redis.js';

const app = express();
const server = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distCandidates = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend_dist'),
];
const distPath = distCandidates.find((p) => fs.existsSync(p));

app.use(helmet(config.security));

const corsOptions = {
  ...config.cors,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = config.cors.origin.some(regex => 
      regex instanceof RegExp ? regex.test(origin) : regex === origin
    );
    
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  }
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupRoutes(app);

if (distPath) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('Frontend dist not found. Skipping static file serving.');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    ...(config.env === 'development' && { error: err.message, stack: err.stack }),
  });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not Found' });
});

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Initialize Binance WebSocket proxy
const binanceProxy = new BinanceWebSocketProxy(wss);

// Make services available in app context
app.locals = {
  ...app.locals,
  redisClient,
  wss,
  binanceProxy
};

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Connected to Redis');
    }
    const binanceProxy = new BinanceWebSocketProxy(wss);
    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

startServer();

export { app, server, redisClient };
