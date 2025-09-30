# Juju - Workspace Suite

## Overview

Juju is an AI-powered creative platform built with Next.js 13+ that enables users to create various types of content including images, videos, and engage with AI assistance. The platform features a dashboard interface, community gallery, templates system, and administrative tools. It's designed as a Progressive Web App (PWA) with mobile-first responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 13+ with App Router architecture
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **Component Library**: Radix UI primitives with custom shadcn/ui components
- **State Management**: React hooks and Context API for local state
- **Typography**: DM Sans font family for consistent design
- **PWA Support**: Service worker implementation with offline caching and install prompts

### Authentication & User Management
- **Authentication Provider**: Firebase Authentication with Google OAuth
- **User Data**: Firebase Firestore for user profiles and preferences
- **Authorization**: Role-based access control (admin/user roles)
- **Session Management**: Firebase Auth state persistence

### Database & Storage
- **Primary Database**: Firebase Firestore for all application data
- **File Storage**: Firebase Storage for images, videos, and media assets
- **Data Models**: 
  - Documents (images, videos, templates, canvas projects)
  - Users (profiles, preferences, roles)
  - Templates (design templates with categories)
  - Chat sessions and messages
  - Canvas documents with Fabric.js integration

### AI Integration
- **Primary AI Service**: Google Gemini API for text generation and chat functionality
- **Image Generation**: Integrated AI image generation with prompt optimization
- **Video Creation**: AI-powered video generation with custom starting frames
- **Chat Assistant**: Real-time AI conversations with persistent history

### Content Management
- **Document Service**: Centralized document management with CRUD operations
- **Template System**: Categorized templates with metadata and usage tracking
- **Media Processing**: Image and video handling with upload and optimization
- **Public Gallery**: Community sharing with privacy controls and engagement features

### Canvas & Design Tools
- **Canvas Engine**: Fabric.js integration for design and editing capabilities
- **Design Tools**: Shape creation, text editing, image manipulation
- **Version Control**: Canvas state management with history tracking
- **Export System**: Multiple export formats and quality options

### Administrative Features
- **Admin Dashboard**: User management, content moderation, analytics
- **Knowledge Base**: Documentation and help system
- **Content Management**: Template creation and curation tools
- **Usage Analytics**: User engagement and feature usage tracking

### Mobile Experience
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Mobile Navigation**: Bottom navigation bar for mobile devices
- **Touch Interactions**: Optimized for touch gestures and mobile workflows
- **Progressive Enhancement**: Desktop features enhanced for larger screens

## External Dependencies

### Core Services
- **Firebase**: Authentication, Firestore database, Cloud Storage
- **Google Gemini AI**: Text generation, chat functionality, content assistance
- **Vercel/Replit**: Hosting and deployment platform

### UI & Design
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Fabric.js**: Canvas manipulation and design tools

### Development Tools
- **TypeScript**: Type safety and improved developer experience
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization
- **Sharp**: Image processing and optimization (server-side)

### Additional Integrations
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation for type-safe data handling
- **Date-fns**: Date manipulation and formatting utilities
- **Sonner**: Toast notification system for user feedback