# 🦄 Platypus Trading Platform - Complete User Flow

## 🏗️ **System Architecture Overview**

**Platypus** is an AI-powered trading platform that combines artificial intelligence signal generation with Camp Network's IP tokenization. Users can create trading signals, improve existing ones, monetize through IP NFTs, and build a decentralized trading ecosystem.

### **Core Components:**
- **Auth System**: Wallet-based authentication with Camp Network integration
- **Signals System**: AI trading signal generation and improvement marketplace  
- **IP System**: Camp Network IP NFT minting and licensing
- **Trading System**: Hyperliquid exchange integration
- **Analytics System**: Platform performance and revenue tracking

---

## 📱 **Complete User Journey**

### **1. Landing & Onboarding Flow**

#### **Step 1: Get Started → Authentication Page**
```
Landing Page → [Get Started Button] → Authentication Modal
```

**Frontend Actions:**
- User clicks "Get Started" 
- Authentication modal opens with wallet connection options

**Backend Endpoints:**
- `POST /api/auth/generate-nonce` - Generate signing nonce
- `POST /api/auth/connect` - Complete wallet authentication

**Process:**
1. **Generate Nonce**: Frontend requests nonce for user's wallet address
2. **Sign Message**: User signs authentication message with their wallet
3. **Verify & Connect**: Backend verifies signature and creates/updates user profile
4. **JWT Token**: User receives authentication token for subsequent requests

---

### **2. Dashboard - Main Hub**

#### **Navigation Structure:**
```
Dashboard
├── Overview (Analytics)
├── Signals (Base Signals/Parent IPs)  
├── Marketplace (Improved Signals/Child IPs)
├── My Signals
├── Royalties
├── Wallet
└── Profile Menu
    ├── Profile Settings
    ├── Exchange Settings
    └── Disconnect
```

#### **Dashboard Overview Page**
**Endpoint**: `GET /api/analytics/overview`

**Features:**
- **Platform Stats**: Total signals, trades, users, IP assets
- **Personal Stats**: User's signal performance, earnings, reputation
- **Quick Actions**: Create signal, view marketplace, connect exchange

**Data Displayed:**
```json
{
  "totalSignals": 1250,
  "totalTrades": 5800,
  "totalUsers": 892,
  "totalIPAssets": 340,
  "totalVolume": 2500000,
  "totalRevenue": 45000,
  "avgSignalAccuracy": 73.2,
  "mostTradedSymbol": "BTC-USD",
  "topPerformer": "ai_trader_123"
}
```

---

### **3. Signals Section - Improvable Signals**

#### **View Improvable Signals**  
**Endpoint**: `GET /api/signals/improvable`

**Shows signals that can be improved:**
- Active and public base signals
- Less than 24 hours old (fresh signals)
- Not expired
- Available for improvement (one improver per signal)

#### **Generate New Signals**
**Endpoint**: `POST /api/signals/`

**Two Generation Modes:**

**Mode 1: Smart Auto-Selection** (Recommended - No symbol needed)
```json
POST /api/signals/
{
  "aiModel": "gpt-4o-mini"
}
```

**Process:**
1. **Top Opportunities Scan**: System scans 30+ Hyperliquid symbols automatically
2. **Win Rate Prioritization**: Finds symbols with >70% historical win rates
3. **Auto Symbol Selection**: Picks the single best opportunity (highest win rate + score)
4. **Signal Generation**: AI creates optimized trading signal for selected symbol
5. **Auto IP Minting**: Automatically mint signal as IP NFT on Camp Network

**Mode 2: Manual Symbol Selection** (Optional)
```json  
POST /api/signals/
{
  "symbol": "BTC-USD",
  "aiModel": "gpt-4o-mini"
}
```

**Process:**
1. **User Input**: Specify exact trading symbol  
2. **Market Validation**: Verify symbol availability and liquidity
3. **Signal Generation**: AI creates signal for specified symbol
4. **Auto IP Minting**: Automatically mint signal as IP NFT on Camp Network

**Result for both modes:**
- Signal appears on Signals page immediately
- Available for improvement by other users (one improvement per signal)

**Signal Data Structure:**
```json
{
  "symbol": "BTC-USD",
  "side": "long",
  "entryPrice": 45000,
  "stopLoss": 43500,
  "takeProfit": 47000,
  "leverage": 3,
  "confidence": 87,
  "analysis": {
    "technicalAnalysis": "Strong bullish momentum...",
    "marketAnalysis": "Market conditions favorable...",
    "sentimentAnalysis": "Positive sentiment indicators...",
    "riskAssessment": "Medium risk profile..."
  },
  "registeredAsIP": true,
  "ipTokenId": "12345",
  "ipTransactionHash": "0xabc123..."
}
```

#### **View Public Signals**
**Endpoint**: `GET /api/signals/public`

**Features:**
- **Filter Options**: Symbol, confidence level, timeframe, performance
- **Sort Options**: Newest, highest confidence, best performance
- **Preview Mode**: Limited signal details until access purchased

---

### **4. Marketplace - Improved Signals Only**

#### **Browse Marketplace**  
**Endpoint**: `GET /api/ip/marketplace`

**Shows only improved signals:**
- Signals that have been enhanced by other users
- Available for purchase as IP NFTs
- **One Improvement Per Signal**: Each base signal can only be improved by one person
- **Revenue Sharing**: 40% to base signal creator, 60% to improver
- **Preview Cards**: Signal metadata, improvement summary, pricing

**Marketplace Item Structure:**
```json
{
  "tokenId": "67890",
  "name": "Improved BTC-USD Trading Signal", 
  "description": "Human-improved trading signal...",
  "type": "improvement",
  "price": 1.02,
  "currency": "USDC",
  "creator": {
    "username": "pro_trader",
    "reputation": 95
  },
  "symbol": "BTC-USD",
  "side": "long",
  "confidence": 92,
  "totalSales": 45,
  "previewOnly": true
}
```

#### **Purchase IP Access**
**Endpoint**: `POST /api/ip/purchase`

**Process:**
1. **Access Purchase**: Buy time-limited access to IP asset
2. **Camp Network Transaction**: Execute purchase through Camp Network
3. **Revenue Distribution**: Automatic split between platform, creator, improver
4. **Access Grant**: User gains full signal details

---

### **5. Signal Improvement System**

#### **Improve Existing Signal**
**Endpoint**: `POST /api/signals/:signalId/improve`

**Improvement Types:**
- **Entry Adjustment**: Modify entry price with reasoning
- **Stop Loss Adjustment**: Update risk management levels  
- **Take Profit Adjustment**: Optimize profit targets
- **Analysis Enhancement**: Add market insights

**Quality Assessment:**
- **Minimum Score**: 50/100 required for approval (easier testing threshold)
- **Quality Factors**: Reasoning depth, technical accuracy, market insight
- **Revenue Share**: Fixed 60% for all accepted improvements (simplified system)

#### **Register Improvement as IP**
**Endpoint**: `POST /api/ip/register`

**Process:**
1. **Quality Verification**: Ensure improvement meets standards
2. **IP Minting**: Create child IP NFT linked to parent signal
3. **Revenue Setup**: Configure 40/60 split with parent IP
4. **Marketplace Listing**: Make improvement available for purchase

---

### **6. My Signals - Personal Dashboard**

#### **User's Signal Portfolio**
**Endpoint**: `GET /api/signals/user/signals`

**Categories:**
- **Active Signals**: Currently tradeable signals
- **Expired Signals**: Past signals with performance data
- **IP Registered**: Signals monetized as NFTs
- **Pending Improvements**: Improvements awaiting quality review

**Performance Tracking:**
```json
{
  "totalSignals": 25,
  "winRate": 68.5,
  "avgReturn": 12.3,
  "totalReturn": 145.8,
  "bestSignal": 45.2,
  "worstSignal": -12.1
}
```

#### **Signal Performance Updates**
**Endpoint**: `PUT /api/signals/:signalId/performance`

**Process:**
- **Trade Execution**: Update with actual entry/exit prices
- **Performance Calculation**: Automatic ROI and success rate tracking
- **Reputation Impact**: Update creator reputation based on results

---

### **7. Royalties - Earnings Dashboard**

#### **Revenue Tracking**
**Endpoint**: `GET /api/analytics/revenue`

**Revenue Sources:**
- **Base Signal Sales**: Direct IP asset sales
- **Improvement Royalties**: 40% share from improved signals
- **Trading Fees**: Commission from executed trades
- **Platform Rewards**: Bonus for high-performing signals

**Earnings Structure:**
```json
{
  "totalRevenue": 1250.50,
  "ipRevenue": 890.25,
  "royaltyRevenue": 360.25,
  "monthlyBreakdown": [
    {"month": "2024-01", "revenue": 125.50, "sales": 15},
    {"month": "2024-02", "revenue": 245.75, "sales": 28}
  ]
}
```

#### **Revenue Distribution**
**Handled by Camp Network automatically:**
- **Automatic Payments**: Revenue splits (40/60) distributed on each IP purchase
- **Blockchain Native**: All payments go directly to creators' wallets via Camp Network
- **No Manual Withdrawal**: Earnings are automatically distributed on purchase
- **Transaction History**: All revenue tracked on-chain via Camp Network

---

### **8. Wallet Integration**

#### **Exchange Connection**
**Endpoint**: `POST /api/auth/exchange/connect`

**Supported Exchanges:**
- **Hyperliquid**: Primary trading integration
- **Future**: Binance, Coinbase Pro, etc.

**Connection Process:**
1. **Credentials Input**: Private key and wallet address
2. **Security Storage**: Encrypted credential storage
3. **Connection Test**: Verify exchange API connectivity
4. **Balance Sync**: Import account balance for position sizing

#### **Wallet Status**
**Endpoint**: `GET /api/auth/exchange/:exchange/status`

**Status Information:**
- **Connection Status**: Connected/Disconnected
- **Wallet Address**: Associated wallet
- **Last Sync**: Recent activity timestamp
- **Available Balance**: Current trading balance

---

### **9. Profile & Settings**

#### **Profile Management**
**Endpoint**: `GET /PUT /api/auth/profile`

**Profile Fields:**
- **Username**: Public display name
- **Bio**: Personal description
- **Avatar**: Profile image URL
- **Specialties**: Trading focus areas
- **Statistics**: Performance metrics, reputation score

#### **Settings Configuration**
- **Exchange Settings**: Manage trading connections
- **Notification Preferences**: Alert configurations
- **Privacy Settings**: Public/private profile options
- **API Access**: Generate API keys for automated trading

#### **Disconnect & Logout**
**Endpoint**: `POST /api/auth/disconnect`

**Process:**
- **Session Termination**: Invalidate JWT token
- **Secure Logout**: Clear all authentication data
- **Redirect**: Return to landing page

---

## 🔄 **Core Business Flows**

### **Signal Creation → Monetization Flow**
```
1. User creates AI signal
2. Platform automatically mints as IP NFT (Base/Parent IP)
3. Signal available for improvement by other users
4. Improvements registered as child IPs (40/60 revenue split)
5. Both base and improved signals sold on marketplace
6. Revenue automatically distributed to creators
```

### **Signal Improvement → Earning Flow** 
```
1. User finds improvable signal on Signals page
2. User submits ONE improvement per signal (first come, first served)
3. System evaluates improvement quality (must score 50+ to be accepted)
4. All accepted improvements get fixed 60% revenue share
5. Improvement registered as child IP NFT on Camp Network
6. Improved signal appears in marketplace for purchase
7. Revenue split: 40% to base creator, 60% to improver
```

### **Marketplace Purchase Flow**
```
1. User browses marketplace for relevant signals
2. User views preview data (limited information)
3. User purchases access through Camp Network
4. Revenue split: 40% parent, 60% improver, 2% platform
5. User gains full signal access and trading data
```

---

## 📊 **Analytics & Monitoring**

### **Platform Analytics**
**Endpoint**: `GET /api/analytics/detailed`

**Key Metrics:**
- **User Growth**: Registration and activity trends
- **Signal Performance**: Success rates and returns
- **Revenue Analytics**: IP sales and royalty distribution
- **Trading Volume**: Total platform trading activity
- **Top Performers**: Leading creators and signals

### **Personal Analytics**
**Endpoints**: Various analytics endpoints with user filtering

**User Metrics:**
- **Signal Performance**: Individual success rates
- **Earnings Tracking**: Revenue from IP sales
- **Improvement Impact**: Success of signal enhancements
- **Trading Statistics**: Personal trading performance

---

## 🔐 **Security & Compliance**

### **Authentication Security**
- **Wallet Signatures**: Cryptographic wallet-based auth
- **JWT Tokens**: Secure session management
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security

### **Data Protection**
- **Encrypted Storage**: Private keys and sensitive data
- **IP Rights**: Camp Network provenance tracking
- **Revenue Transparency**: Blockchain-verified payments
- **Audit Trails**: Complete transaction logging

---

## 🚀 **Future Enhancements**

### **Advanced Features (Roadmap)**
- **Social Features**: Follow traders, social signals
- **Advanced Analytics**: ML-powered performance prediction
- **Multi-Exchange**: Support for additional exchanges
- **Mobile App**: Native iOS/Android applications
- **API Access**: Public API for third-party integrations
- **DAO Governance**: Community-driven platform decisions

### **Monetization Expansion**
- **Premium Tiers**: Enhanced features for paid users
- **Signal Subscriptions**: Recurring revenue models
- **Educational Content**: Trading courses and tutorials
- **Institutional Features**: High-volume trader tools

---

## 📋 **Complete API Reference**

### **🔐 Authentication Routes** (`/api/auth/`)

#### **Public Routes (No Authentication)**
```bash
POST /api/auth/generate-nonce
```
**Request:**
```json
{
  "walletAddress": "0x742d35Cc6cf4C15D83d3d6e8C7d3d4C1aB1D1234"
}
```
**Response:**
```json
{
  "nonce": "unique-nonce-string",
  "message": "Sign this message to authenticate: unique-nonce-string"
}
```

```bash
POST /api/auth/connect
```
**Request:**
```json
{
  "walletAddress": "0x742d35Cc6cf4C15D83d3d6e8C7d3d4C1aB1D1234",
  "signature": "0x1234567890abcdef...",
  "nonce": "unique-nonce-string"
}
```
**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "userId",
    "walletAddress": "0x742d35...",
    "username": "trader123",
    "reputation": 85
  }
}
```

#### **Protected Routes (Auth Required)**
```bash
GET /api/auth/profile
```
**Response:**
```json
{
  "user": {
    "id": "userId",
    "walletAddress": "0x742d35...",
    "username": "trader123",
    "bio": "Professional crypto trader",
    "avatar": "https://example.com/avatar.jpg",
    "specialties": ["scalping", "technical-analysis"],
    "reputation": 85,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

```bash
PUT /api/auth/profile
```
**Request:**
```json
{
  "username": "newUsername",
  "bio": "Updated bio",
  "avatar": "https://example.com/new-avatar.jpg",
  "specialties": ["swing", "futures"]
}
```

```bash
POST /api/auth/exchange/connect
```
**Request:**
```json
{
  "exchange": "hyperliquid",
  "privateKey": "0x1234567890abcdef...",
  "walletAddress": "0x742d35Cc6cf4C15D83d3d6e8C7d3d4C1aB1D1234"
}
```

```bash
GET /api/auth/exchange/hyperliquid/status
```
**Response:**
```json
{
  "connected": true,
  "walletAddress": "0x742d35...",
  "lastSync": "2024-01-01T12:00:00.000Z",
  "balance": 5000.00
}
```

---

### **📊 Signals Routes** (`/api/signals/`)

#### **Public Routes**
```bash
GET /api/signals/public
```
**Query Parameters:** `symbol`, `minConfidence`, `sortBy`, `limit`, `offset`
**Response:**
```json
{
  "signals": [
    {
      "id": "signalId",
      "symbol": "BTC-USD",
      "side": "long",
      "entryPrice": 45000,
      "confidence": 87,
      "creator": {
        "username": "trader123",
        "reputation": 85
      },
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 25,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

```bash
GET /api/signals/improvable
```
**Query Parameters:** `symbol`, `minConfidence`, `sortBy`, `limit`, `offset`
**Response:** Same structure as public signals, but only shows signals available for improvement

```bash
GET /api/signals/:signalId
```
**Response:**
```json
{
  "signal": {
    "id": "signalId",
    "symbol": "BTC-USD",
    "side": "long",
    "entryPrice": 45000,
    "stopLoss": 43500,
    "takeProfit": 47000,
    "leverage": 3,
    "confidence": 87,
    "analysis": {
      "technicalAnalysis": "Strong bullish momentum...",
      "marketAnalysis": "Market conditions favorable...",
      "sentimentAnalysis": "Positive sentiment indicators...",
      "riskAssessment": "Medium risk profile..."
    },
    "registeredAsIP": true,
    "ipTokenId": "12345",
    "creator": {
      "username": "trader123",
      "reputation": 85
    }
  }
}
```

#### **Protected Routes**
```bash
POST /api/signals/
```
**Request:**
```json
{
  "symbol": "BTC-USD",  // Optional - auto-selects best opportunity if omitted
  "aiModel": "gpt-4o-mini",
  "accountBalance": 5000
}
```
**Response:**
```json
{
  "signal": {
    "id": "signalId",
    "symbol": "BTC-USD",
    "side": "long",
    "entryPrice": 45000,
    "stopLoss": 43500,
    "takeProfit": 47000,
    "leverage": 3,
    "confidence": 87,
    "registeredAsIP": true,
    "ipTokenId": "12345",
    "ipTransactionHash": "0xabc123..."
  },
  "message": "AI trading signal generated successfully"
}
```

```bash
POST /api/signals/:signalId/improve
```
**Request:**
```json
{
  "improvementType": "entry-adjustment",
  "originalValue": 45000,
  "improvedValue": 44800,
  "reasoning": "Entry price too aggressive, better to enter on slight pullback for improved risk/reward ratio..."
}
```

```bash
GET /api/signals/user/signals
```
**Query Parameters:** `status`, `symbol`, `outcome`, `limit`, `offset`
**Response:** User's personal signals with same structure as public signals

---

### **🏪 IP/Marketplace Routes** (`/api/ip/`)

#### **Public Routes**
```bash
GET /api/ip/marketplace
```
**Query Parameters:** `type`, `symbol`, `limit`, `offset`
**Response:**
```json
{
  "assets": [
    {
      "tokenId": "67890",
      "name": "Improved BTC-USD Trading Signal",
      "description": "Human-improved trading signal with enhanced entry timing...",
      "type": "improvement",
      "price": 1.02,
      "currency": "USDC",
      "creator": {
        "username": "pro_trader",
        "reputation": 95
      },
      "symbol": "BTC-USD",
      "confidence": 92,
      "totalSales": 45,
      "previewOnly": true
    }
  ],
  "total": 15
}
```

#### **Protected Routes**
```bash
POST /api/ip/register
```
**Request:**
```json
{
  "signalId": "signalId",
  "improvementIndex": 0  // Optional - for improvements
}
```

```bash
POST /api/ip/purchase
```
**Request:**
```json
{
  "tokenId": "67890",
  "periods": 1  // Access periods
}
```

```bash
GET /api/ip/user/assets
```
**Response:**
```json
{
  "assets": [
    {
      "tokenId": "12345",
      "name": "BTC-USD Trading Signal",
      "type": "base",
      "revenue": 125.50,
      "totalSales": 28
    }
  ],
  "total": 5
}
```

---

### **📈 Trading Routes** (`/api/trading/`)

#### **All Protected Routes**
```bash
GET /api/trading/opportunities
```
**Query Parameters:** `maxSymbols`, `minVolume`, `topCount`
**Response:**
```json
{
  "opportunities": [
    {
      "symbol": "ETH-USD",
      "score": 87.5,
      "price": 2450.00,
      "change24h": 5.2,
      "volume": 125000000,
      "winRate": 73.5,
      "setup": {
        "type": "High Win Rate Momentum",
        "direction": "LONG",
        "confidence": 85
      }
    }
  ],
  "scanSummary": {
    "totalScanned": 30,
    "opportunitiesFound": 8,
    "avgWinRate": 65.2
  }
}
```

```bash
POST /api/trading/execute
```
**Request:**
```json
{
  "symbol": "BTC-USD",
  "side": "buy",
  "size": 0.1,
  "orderType": "limit",
  "price": 45000
}
```

```bash
GET /api/trading/positions
```
**Response:**
```json
{
  "positions": [
    {
      "symbol": "BTC-USD",
      "side": "long",
      "size": 0.1,
      "entryPrice": 45000,
      "unrealizedPnl": 150.00
    }
  ]
}
```

---

### **📊 Analytics Routes** (`/api/analytics/`)

#### **All Protected Routes**
```bash
GET /api/analytics/overview
```
**Response:**
```json
{
  "totalSignals": 1250,
  "totalTrades": 5800,
  "totalUsers": 892,
  "totalIPAssets": 340,
  "totalVolume": 2500000,
  "totalRevenue": 45000,
  "avgSignalAccuracy": 73.2
}
```

```bash
GET /api/analytics/signals
```
**Query Parameters:** `timeframe` (24h, 7d, 30d, 90d, 1y)
**Response:**
```json
{
  "totalSignals": 125,
  "accuracyRate": 68.5,
  "averageConfidence": 78.2,
  "topSymbols": ["BTC-USD", "ETH-USD", "SOL-USD"]
}
```

```bash
GET /api/analytics/revenue
```
**Response:**
```json
{
  "totalRevenue": 1250.50,
  "ipRevenue": 890.25,
  "royaltyRevenue": 360.25,
  "monthlyBreakdown": [
    {"month": "2024-01", "revenue": 125.50, "sales": 15}
  ]
}
```

---

## 🔑 **Authentication Headers**

All protected routes require:
```bash
Authorization: Bearer <jwt-token>
```

## ⚠️ **Error Responses**

Standard error format:
```json
{
  "error": {
    "code": "SIGNAL_NOT_FOUND",
    "message": "Signal not found",
    "details": {}
  }
}
```

## 📝 **Response Format**

All successful responses follow:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

---

This comprehensive API reference covers all endpoints with request/response structures for complete frontend integration.