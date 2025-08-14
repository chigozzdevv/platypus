# 🦆 Platypus Trading Platform

**AI-Powered Trading Signals with Intellectual Property NFTs**

Platypus is a revolutionary trading platform that combines artificial intelligence, human expertise, and blockchain technology to create, improve, and monetize trading signals as intellectual property (IP) NFTs.

## 🌟 Overview

Platypus bridges the gap between AI-generated trading signals and human trading expertise by creating a marketplace where:

- **AI generates high-quality trading signals** using advanced market analysis
- **Human traders can improve these signals** through their expertise
- **All signals are minted as IP NFTs** on the Camp Network blockchain
- **Revenue is shared** between original creators and signal improvers
- **Trading is executed** directly through integrated exchange APIs

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS v4 with custom components
- **State Management**: Zustand for auth/trading stores
- **Data Fetching**: TanStack Query for API calls
- **Animation**: Framer Motion
- **Blockchain Integration**: Camp Network Origin SDK
- **Build Tool**: Vite

### Backend (Node.js + TypeScript)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Camp Network Origin integration
- **Trading**: Hyperliquid exchange API integration
- **AI**: OpenAI GPT-4/GPT-4o for signal generation
- **Security**: Helmet, CORS, rate limiting

## 🚀 Key Features

### 🤖 AI Signal Generation
- **Multi-Model Support**: GPT-4o and GPT-4o-mini for different use cases
- **Advanced Market Analysis**: Technical indicators, sentiment analysis, pattern recognition
- **Risk Management**: Conservative leverage, proper stop-loss placement
- **Quality Scoring**: Win rate analysis and confidence metrics

### 👨‍💼 Human Signal Improvement
- **Collaborative Enhancement**: Users can improve AI-generated signals
- **Quality Assessment**: Automated scoring of improvement quality
- **Revenue Sharing**: 60% revenue share for signal improvers
- **IP Protection**: Improvements minted as derivative NFTs

### 💎 IP NFT Marketplace
- **Camp Network Integration**: Signals minted as IP NFTs with licensing terms
- **Access Control**: Token-gated access to premium signals
- **Royalty System**: Automated revenue distribution
- **IPFS Storage**: Decentralized metadata storage via Pinata

### 📊 Trading Execution
- **Exchange Integration**: Direct trading through Hyperliquid
- **Position Sizing**: Automated risk-based position calculation
- **Order Management**: Smart order routing with slippage protection
- **Performance Tracking**: Real-time P&L and analytics

### 📈 Analytics Dashboard
- **Platform Metrics**: Total signals, users, volume, revenue
- **Signal Analytics**: Win rates, confidence distribution, performance by model
- **Trading Analytics**: P&L tracking, leverage distribution, top traders
- **User Analytics**: Creator rankings, revenue distribution

### 🛡️ Admin Panel
- **Signal Review**: Approve/reject signals before minting
- **Quality Control**: Confidence filtering and manual review
- **Platform Management**: User management and system monitoring

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Camp Network client credentials
- Hyperliquid API access
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd platypus
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**

**Server Environment** (`server/.env`):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/platypus

# Authentication
JWT_SECRET=your-jwt-secret-here
PLATFORM_WALLET_ADDRESS=0x...
PLATFORM_WALLET_PRIVATE_KEY=0x...

# Camp Network
CAMP_CLIENT_ID=your-camp-client-id
CAMP_TRUST_JWT=false
ORIGIN_JWKS_URL=https://auth.camp.network/.well-known/jwks.json
ORIGIN_ISSUER=https://auth.camp.network

# Blockchain
CHAIN_ID=123
BASECAMP_RPC_URL=https://basecamp-rpc-url
SIWE_DOMAIN=localhost:3000

# External APIs
OPENAI_API_KEY=sk-...
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz

# Server
PORT=3001
NODE_ENV=development
```

**Client Environment** (`client/.env`):
```env
VITE_API_URL=http://localhost:3001
VITE_PUBLIC_ORIGIN_CLIENT_ID=your-camp-client-id
VITE_PUBLIC_PINATA_JWT=your-pinata-jwt-token
```

4. **Database Setup**
```bash
# Start MongoDB (if running locally)
mongod

# The application will automatically create collections on first run
```

5. **Start Development Servers**
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
platypus/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── admin-layout.tsx     # Admin dashboard layout
│   │   │   ├── signal-card.tsx      # Signal display component
│   │   │   ├── trading-modal.tsx    # Trade execution modal
│   │   │   └── ...
│   │   ├── pages/                   # Page components
│   │   │   ├── dashboard/           # User dashboard pages
│   │   │   ├── landing.tsx          # Landing page
│   │   │   └── auth.tsx             # Authentication
│   │   ├── services/                # API service layers
│   │   │   ├── signals.ts           # Signals API
│   │   │   ├── trading.ts           # Trading API
│   │   │   ├── camp.ts              # Camp Network integration
│   │   │   └── ...
│   │   ├── stores/                  # Zustand state stores
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── features/                # Feature-based modules
│   │   │   ├── auth/                # Authentication system
│   │   │   ├── signals/             # Signal management
│   │   │   ├── trading/             # Trading execution
│   │   │   ├── analytics/           # Analytics & reporting
│   │   │   └── ip-redacted-2-client/ # Camp Network integration
│   │   ├── shared/                  # Shared utilities
│   │   │   ├── config/              # Configuration
│   │   │   ├── middleware/          # Express middleware
│   │   │   ├── types/               # Type definitions
│   │   │   └── utils/               # Utility functions
│   │   ├── routes/                  # API route definitions
│   │   ├── app.ts                   # Express app setup
│   │   └── server.ts                # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                        # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/connect` - Connect wallet and authenticate
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Signals
- `GET /signals/public` - Get public signals
- `GET /signals/improvable` - Get signals available for improvement
- `POST /signals` - Create new AI signal
- `POST /signals/:id/improve` - Improve existing signal
- `GET /signals/:id` - Get signal details

### Trading
- `POST /trading/execute` - Execute trade from signal
- `POST /trading/calculate-position` - Calculate position size
- `GET /trading/opportunities` - Get market opportunities

### Analytics
- `GET /analytics/overview` - Platform overview metrics
- `GET /analytics/signals` - Signal analytics
- `GET /analytics/trading` - Trading analytics

### Admin
- `GET /admin/signals` - Get signals for review
- `PUT /admin/signals/:id/status` - Update signal status
- `POST /admin/mint-signal` - Mint approved signal as NFT

## 🔒 Security Features

- **JWT Authentication** with Camp Network integration
- **Encrypted Credentials** for exchange API keys
- **Rate Limiting** on all API endpoints
- **Input Validation** using Zod schemas
- **CORS Protection** with configurable origins
- **Helmet Security** headers
- **Error Handling** with sanitized responses

## 🎯 Trading Logic

### Signal Generation Process
1. **Market Scanning**: Analyze top cryptocurrencies by volume
2. **Technical Analysis**: RSI, moving averages, pattern recognition
3. **Sentiment Analysis**: Fear & Greed Index integration
4. **AI Analysis**: GPT-4 generates comprehensive trading signals
5. **Risk Management**: Conservative leverage and stop-loss placement
6. **Quality Scoring**: Win rate and confidence assessment

### Signal Improvement Workflow
1. **Signal Selection**: Users browse improvable signals
2. **Improvement Submission**: Suggest entry/exit adjustments or analysis enhancements
3. **Quality Assessment**: Automated scoring based on change significance and reasoning
4. **Revenue Sharing**: 60% revenue share for quality improvements
5. **IP Protection**: Improvements minted as derivative NFTs

### Trading Execution
1. **Position Calculation**: Risk-based position sizing
2. **Order Validation**: Price movement and margin checks
3. **Smart Execution**: Limit orders with slippage protection
4. **Risk Management**: Maximum leverage and stop-loss enforcement

## 📊 Monitoring & Analytics

### Key Metrics Tracked
- **Platform Metrics**: Total signals, users, volume, revenue
- **Signal Performance**: Win rates, confidence levels, AI model performance
- **Trading Analytics**: P&L, success rates, popular symbols
- **User Analytics**: Creator performance, revenue distribution
- **IP Analytics**: NFT sales, royalty distribution

### Caching Strategy
- **Analytics Caching**: 5-minute cache for dashboard metrics
- **Signal Caching**: 10-minute cache for public signal lists
- **User Performance**: 1-hour cache for user statistics

## 🌐 Blockchain Integration

### Camp Network Features
- **IP NFT Minting**: Signals minted as intellectual property
- **Access Control**: Token-gated signal access
- **Licensing Terms**: Automated licensing with royalties
- **Revenue Distribution**: Smart contract-based royalty payments

### Supported Networks
- **Base Camp Testnet**: Primary development network
- **IPFS Storage**: Decentralized metadata storage via Pinata

## 🚧 Development

### Available Scripts

**Server**:
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build production bundle
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # Run ESLint
```

**Client**:
```bash
npm run dev          # Start Vite development server
npm run build        # Build production bundle
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for git messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Ukpaa Chigozie** - Platypus Team

## 🙏 Acknowledgments

- **Camp Network** for IP NFT infrastructure
- **Hyperliquid** for DEX trading capabilities
- **OpenAI** for AI signal generation
- **React & Node.js** communities for excellent tooling

---

For more information, support, or questions, please open an issue or contact the development team.