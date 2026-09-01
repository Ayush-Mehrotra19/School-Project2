# GrowMyIq - Learning Management System

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Gemini-AI-FBBC04?style=for-the-badge&logo=google" alt="Gemini AI">
</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

GrowMyIq is a modern, AI-powered learning management system built with Next.js 15 and TypeScript. It features a beautiful glassmorphism design with a cosmic theme, comprehensive quiz management, AI-integrated timetable generation, and real-time progress tracking.

The platform is designed to provide an engaging learning experience with features such as:
- AI-generated quizzes with detailed explanations
- Dynamic timetable creation using Google's Gemini AI
- Comprehensive performance analytics
- Beautiful, responsive design with glassmorphism effects
- Full-stack authentication with Supabase

## ✨ Features

### 🎯 Core Features
- **Authentication System**: Complete user authentication with Supabase
- **AI-Powered Quizzer**: Generate quizzes with multiple subjects and difficulties
- **Smart Timetable**: AI-generated timetables based on user preferences
- **Interactive Dashboard**: Track progress, view stats, and manage learning
- **Performance Analytics**: Detailed insights into learning progress
- **Mistake Review**: Review incorrect answers with explanations

### 🎨 Design Features
- **Glassmorphism UI**: Modern glass-like design elements
- **Cosmic Theme**: Dark theme with purple/magenta accents
- **Responsive Design**: Mobile-first, works on all devices
- **Smooth Animations**: 60fps animations with GPU acceleration
- **Component Library**: Reusable shadcn/ui components

### 🔧 Technical Features
- **Type Safety**: Full TypeScript implementation
- **Server-Side Rendering**: Next.js App Router with SSR
- **Database**: PostgreSQL with Supabase
- **API Integration**: RESTful APIs with proper error handling
- **State Management**: React hooks and context
- **Security**: Row-level security and JWT authentication

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend & Database
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **ORM**: Supabase JavaScript Client
- **Real-time**: Supabase Realtime (planned)

### AI & External Services
- **AI Model**: Google Gemini 2.0 Flash
- **Quiz Generation**: Custom prompt engineering
- **Timetable AI**: Conversational AI interface

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript compiler
- **Git Hooks**: Husky (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- Git
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd learning-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables (see [Environment Setup](#environment-setup))

4. **Set up the database**
   - Create a new Supabase project
   - Run the migration scripts from `supabase/migrations/`
   - Configure auth settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
learning-app/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── (marketing)/          # Marketing routes group
│   │   ├── api/                  # API routes
│   │   │   ├── ai/              # AI integration endpoints
│   │   │   └── quiz/            # Quiz system endpoints
│   │   ├── auth/                # Authentication page
│   │   ├── dashboard/           # Dashboard page
│   │   ├── quiz/                # Quiz taking page
│   │   ├── quizzer/             # Quiz configuration page
│   │   ├── timetable/           # Timetable page with AI
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase client configuration
│   │   └── theme.ts            # Theme system
│   ├── services/               # Business logic services
│   │   └── quizSessionService.ts
│   └── types/                  # TypeScript type definitions
├── docs/                      # Documentation (this guide)
├── supabase/                  # Database migrations
│   └── migrations/           # SQL migration files
├── todotasks/               # Project documentation
└── public/                  # Static assets
```

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Pages         │    │ • Quiz API      │    │ • Supabase      │
│ • Components    │    │ • Auth API      │    │ • Gemini AI     │
│ • Hooks         │    │ • AI API        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (Supabase)    │
                    │                 │
                    │ • Users         │
                    │ • Quiz Data     │
                    │ • Sessions      │
                    └─────────────────┘
```

### Key Architectural Decisions

1. **App Router over Pages Router**: Leverages Next.js 15's latest features
2. **Server Components**: Improved performance and SEO
3. **Supabase for Backend**: Rapid development with built-in auth
4. **Modular Theme System**: Easy customization without hardcoded values
5. **TypeScript Everywhere**: Type safety across the stack

## 📚 Documentation

Our documentation is organized to help you find exactly what you need:

### For New Developers
- [Getting Started Guide](./docs/01-getting-started/installation.md)
- [Development Workflow](./docs/01-getting-started/development-workflow.md)
- [Environment Setup](./docs/01-getting-started/environment-setup.md)

### Understanding the System
- [Architecture Overview](./docs/02-architecture/overview.md)
- [Design System](./docs/02-architecture/design-system.md)
- [Database Schema](./docs/02-architecture/database-schema.md)

### Feature Documentation
- [Authentication System](./docs/03-features/authentication.md)
- [Quiz System](./docs/03-features/quiz-system.md)
- [Timetable AI](./docs/03-features/timetable-ai.md)
- [Dashboard](./docs/03-features/dashboard.md)

### API Documentation
- [API Overview](./docs/04/api/overview.md)
- [Authentication Endpoints](./docs/04/api/authentication-endpoints.md)
- [Quiz API](./docs/04/api/quiz-endpoints.md)
- [AI Integration](./docs/04/api/ai-integration.md)

### Deployment
- [Production Setup](./docs/05-deployment/production-setup.md)
- [Supabase Configuration](./docs/05-deployment/supabase-configuration.md)
- [Environment Variables](./docs/05-deployment/environment-variables.md)

## ⚙️ Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### Supabase Setup

1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Settings > API
3. **Configure Authentication**:
   - Enable Email/Password authentication
   - Add your site URL to redirects
4. **Run migrations** from the `supabase/migrations/` folder

### Gemini API Setup

1. **Get API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Enable Gemini API** in your Google Cloud Console
3. **Add the key** to your environment variables

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code style guidelines
   - Add TypeScript types
   - Import colors from theme system

3. **Test your changes**
   - Run the linter
   - Check for TypeScript errors
   - Test in the browser

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push and create a pull request**

### Code Style Guidelines

- **TypeScript**: Use strict mode, provide types for all variables
- **Tailwind**: Use theme colors, no hardcoded values
- **Components**: Follow atomic design principles
- **Files**: Use PascalCase for components, camelCase for utilities

## 🔌 API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | Sign in user |
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signout` | Sign out user |

### Quiz Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/session` | Create quiz session |
| GET | `/api/quiz/session/[id]` | Get session details |
| POST | `/api/quiz/questions` | Save quiz questions |
| POST | `/api/quiz/answers` | Save user answers |
| GET | `/api/quiz/history` | Get quiz history |
| GET | `/api/quiz/stats` | Get performance stats |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/quiz` | Generate quiz questions |
| POST | `/api/ai/timetable` | Generate timetable |

For detailed API documentation, see [API Overview](./docs/04/api/overview.md).

## 🚀 Deployment

### Production Deployment Checklist

1. **Environment Variables**
   - Set all required environment variables
   - Use production URLs
   - Secure your API keys

2. **Database Setup**
   - Run all migrations
   - Configure Row Level Security
   - Set up connection pooling

3. **Build Process**
   - Run `npm run build`
   - Check for build errors
   - Test production build locally

4. **Deploy**
   - Choose your hosting platform
   - Configure custom domains
   - Set up SSL certificates

### Recommended Platforms

- **Vercel**: Seamless Next.js deployment
- **Netlify**: Simple static hosting
- **AWS**: Full control and scalability
- **DigitalOcean**: Affordable VPS hosting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Read the contributing guide** ([Contributing Guide](./docs/06-contributing/coding-standards.md))
2. **Fork the repository**
3. **Create a feature branch**
4. **Make your changes**
5. **Add tests if applicable**
6. **Update documentation**
7. **Submit a pull request**

### Contribution Areas

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage

## 📞 Support

- **Documentation**: [Read the docs](./docs/)
- **Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Discussions**: [Join the discussion](https://github.com/your-repo/discussions)
- **Email**: support@learndash.com

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Google Gemini](https://ai.google.dev/) - AI model
- [Lucide](https://lucide.dev/) - Icon library

---

<div align="center">
  Made with ❤️ by the GrowMyIq team
</div>