# Co-Mission: Decentralized Freelancing Platform

A modern, blockchain-powered freelancing platform that connects employers with skilled freelancers through a secure, transparent, and efficient system.

## 👥 Creators

- **Aldana, Christian R.**
- **Heteroza, Zedekiah**
- **Lariz, Ralph Kenneth A.**
- **Salazar, Jhomar B.**
- **Ventura, Jonel A.**

## 🚀 Project Overview

Co-Mission is a comprehensive freelancing platform built with Next.js that enables seamless collaboration between employers and freelancers. The platform features a token-based economy, real-time chat system, task management, and secure payment processing.

## ✨ Key Features

### 🔐 Authentication & User Management
- Secure user registration and login system
- Role-based access (Employer/Freelancer)
- Profile management with customizable settings
- Profile picture upload and management

### 💼 Task Management System
- **For Employers**: Post tasks, review applications, select freelancers
- **For Freelancers**: Browse tasks, apply, submit work
- Task status tracking (Posted → Applied → Selected → In Progress → Completed)
- Task categorization and filtering

### 💬 Real-time Communication
- Integrated chat system between employers and freelancers
- AI-powered chatbot for assistance
- Message history and notifications
- Profile pictures in chat messages

### 💰 Payment & Token System
- **Co-Mission Token (CMT)** integration
- Secure payment processing
- Token balance management
- Transaction history tracking
- Automated payment calculations

### 📊 Dashboard & Analytics
- Comprehensive dashboard for both user types
- Task statistics and performance metrics
- Earnings tracking
- Notification system

### ⭐ Rating & Review System
- Freelancer rating system
- Performance feedback
- Reputation building
- Quality assurance

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - Component-based UI
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Next.js Image** - Optimized image handling

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **RESTful API** - RESTful service architecture
- **JSON Storage** - File-based data persistence

### Blockchain & Web3
- **Smart Contracts** - Solidity-based token contracts
- **Hardhat** - Development environment
- **Web3 Integration** - Blockchain connectivity

### Additional Tools
- **Redis** - Caching and session management
- **File System** - Local data storage
- **WebSocket** - Real-time communication

## 📁 Project Structure

```
co-mission/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Chat endpoints
│   │   ├── freelancer/           # Freelancer APIs
│   │   ├── employer/             # Employer APIs
│   │   ├── tasks/                # Task management
│   │   ├── payment/              # Payment processing
│   │   └── notifications/        # Notification system
│   ├── components/               # Reusable components
│   │   ├── ChatWidget.tsx        # AI Chatbot
│   │   ├── FreelancerChat.tsx    # User-to-user chat
│   │   ├── DashboardHeader.tsx   # Dashboard header
│   │   └── SideNavigation.tsx    # Navigation
│   ├── dashboard/                # Dashboard pages
│   ├── profile/                  # User profile pages
│   ├── tasks/                    # Task management pages
│   └── messages/                 # Chat interface
├── contracts/                    # Smart contracts
│   └── CoMissionToken.sol       # CMT token contract
├── lib/                         # Utility libraries
│   ├── db.ts                    # Database utilities
│   ├── token-utils.ts           # Token management
│   └── payment-utils.ts          # Payment processing
├── scripts/                     # Deployment scripts
└── docs/                        # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd co-mission
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file with the following variables:
```bash
# Database
DATABASE_URL=your_database_url

# Redis (for notifications)
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# Blockchain
PRIVATE_KEY=your_private_key
RPC_URL=your_rpc_url
```

4. **Deploy smart contracts**
```bash
npx hardhat compile
npx hardhat run scripts/deploy-token.js --network <network>
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Smart Contracts
npm run compile      # Compile contracts
npm run deploy       # Deploy contracts
npm run test         # Run contract tests

# Utilities
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/reset-password` - Password reset

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/freelancer/profile` - Update freelancer profile
- `PUT /api/employer/profile` - Update employer profile

### Task Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get specific task
- `POST /api/tasks/[id]/apply` - Apply to task
- `POST /api/tasks/[id]/select` - Select freelancer

### Chat System
- `GET /api/chat` - Get chat messages
- `POST /api/chat/message` - Send message
- `POST /api/chat/message` - Send AI chat message

### Payment & Tokens
- `GET /api/token/balance` - Get token balance
- `POST /api/token/transfer` - Transfer tokens
- `POST /api/payment/calculate` - Calculate payment
- `POST /api/payment/process` - Process payment

## 🎨 Design System

### Color Palette
- **Primary**: `#FFBF00` (Co-Mission Yellow)
- **Secondary**: `#FFD700` (Gold)
- **Accent**: `#ed9e28` (Orange-Gold)
- **Background**: Gray gradients
- **Text**: Dark gray/black

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable text
- **UI Elements**: Consistent button and form styling

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **Authentication**: Secure login system
- **Data Protection**: Encrypted sensitive data
- **Smart Contract Security**: Audited token contracts
- **Payment Security**: Secure transaction processing

## 📱 User Experience

### For Employers
- Easy task posting with detailed requirements
- Freelancer selection and management
- Real-time communication
- Payment processing and tracking

### For Freelancers
- Task browsing and filtering
- Application management
- Portfolio showcase
- Earnings tracking

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
1. Configure production environment variables
2. Set up production database
3. Deploy smart contracts to mainnet
4. Configure domain and SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔮 Future Enhancements

- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Detailed performance metrics
- **AI Matching**: Smart freelancer-employer matching
- **Video Calls**: Integrated video communication
- **Multi-language**: Internationalization support
- **Advanced Payments**: Cryptocurrency integration

---

**Built with ❤️ by the Co-Mission Development Team**

*Connecting talent with opportunity through decentralized freelancing.*