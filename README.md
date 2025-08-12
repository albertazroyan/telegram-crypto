# 🚀 Crypto Price Tracker with Telegram Auth

A modern web application that provides real-time cryptocurrency price tracking with secure Telegram-based authentication.

## ✨ Features

- **🔐 Secure Authentication**
  - Telegram Login Widget integration
  - JWT-based session management
  - Protected API routes

- **📊 Real-time Price Tracking**
  - Live price updates via WebSocket
  - Multiple cryptocurrency support (BTC, ETH, SOL)
  - 24h price change indicators

- **⚡ Optimized Performance**
  - Redis caching layer for fast price lookups
  - Efficient WebSocket connections
  - Responsive UI with Material-UI components

- **🛠 Developer Friendly**
  - Containerized with Docker
  - Environment-based configuration
  - Comprehensive documentation

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, TypeScript, Vite, Material-UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL with Sequelize ORM |
| **Caching** | Redis |
| **Real-time** | WebSocket |
| **Auth** | Telegram Login Widget, JWT |
| **Containerization** | Docker, Docker Compose |

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Node.js 18+ and npm 9+ (for local development)
- Telegram Bot Token from [@BotFather](https://t.me/botfather)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd telegram-crypto
```

### 2. Environment Setup

#### Backend Configuration

1. Create and configure the backend environment:
   ```bash
   cp backand/.env.example backand/.env
   ```

2. Edit the `.env` file in the `backand` directory with your settings:
   ```env
   # Server
   NODE_ENV=development
   PORT=5000
   
   # Database (PostgreSQL)
   DB_HOST=postgres
   DB_NAME=crypto_tracker
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_PORT=5432
   
   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379
   
   # JWT Authentication
   JWT_SECRET=generate_a_secure_random_string
   JWT_EXPIRES_IN=7d
   
   # Telegram Integration
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_LOGIN_WIDGET_ID=your_telegram_widget_id
   ```

#### Frontend Configuration

1. Set up the frontend environment:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Update the frontend `.env` file:
   ```env
   # API Configuration
   VITE_API_BASE_URL=/api
   VITE_WS_URL=/ws
   
   # Telegram Widget
   VITE_TELEGRAM_BOT_NAME=your_telegram_bot_username
   ```

### 3. Start with Docker Compose

From the project root, run:

```bash
docker-compose up --build
```

This starts all services:
- Backend API: `http://localhost:5000`
- PostgreSQL database
- Redis cache
- Frontend: `http://localhost:5173`

### 4. Access the Application

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

## Development

### Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend will be available at `http://localhost:5173`

### Backend Development

```bash
git clone <repository-url>
cd telegram-crypto
```

### 2. Set up environment variables

1. Copy the example environment file:
   ```bash
   cp backand/.env.example backand/.env
   ```

2. Update the `.env` file with your actual credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database
   DB_HOST=postgres
   DB_NAME=crypto_tracker
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_PORT=5432
   
   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379
   
   # JWT
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=7d
   
   # Telegram
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_LOGIN_WIDGET_ID=your_telegram_widget_id
   ```

### 3. Start the application with Docker Compose

```bash
docker-compose up --build
```

This will start:
- Backend API at `http://localhost:5000`
- PostgreSQL database
- Redis cache

### 4. Access the application

- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:5173` (if frontend is set up)

## API Endpoints

### Authentication

   cd backand
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start in development mode with hot-reload:
   ```bash
   npm run dev
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Making Your Local Server Public

To test Telegram Login Widget, you'll need a public URL. Here's how to set it up with Serveo:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. Start the backend server:
   ```bash
   cd backand
   npm start
   ```

3. In a new terminal, expose your local server:
   ```bash
   ssh -R 80:localhost:5000 serveo.net
   ```
   
   You'll receive a public URL like `https://yoursubdomain.serveo.net`

### Configuring Telegram Bot

1. Open Telegram and find [@BotFather](https://t.me/botfather)
2. Start a chat and use the following commands:
   ```
   /setdomain
   ```
3. Select your bot from the list
4. Enter your Serveo URL (without trailing slash):
   ```
   https://yoursubdomain.serveo.net
   ```

5. Your Telegram Login Widget will be available at:
   ```
   https://yoursubdomain.serveo.net/auth/telegram/login
   ```

## 📚 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/telegram` | POST | Authenticate with Telegram Login Widget |
| `/api/auth/me` | GET | Get current user (requires auth) |

### Cryptocurrency Prices

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prices/latest` | GET | Get latest cached prices |

## 🚀 Deployment

### Production Deployment

1. Update environment variables for production:
   - Set `NODE_ENV=production`
   - Update database credentials
   - Configure proper CORS origins
   - Set secure JWT secret

2. Build and deploy with Docker:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. Set up SSL certificates (recommended):
   - Use Let's Encrypt with Nginx
   - Configure proper security headers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Binance API](https://binance-docs.github.io/) for cryptocurrency data
- [Telegram](https://core.telegram.org/widgets/login) for authentication
- [Redis](https://redis.io/) for caching
- [PostgreSQL](https://www.postgresql.org/) for data persistence
- All open-source libraries used in this project
