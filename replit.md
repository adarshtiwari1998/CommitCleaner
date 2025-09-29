# Git Commit Cleanup System

## Overview

A web application for automatically identifying and removing Replit-generated commit messages from GitHub repositories. Built with a React frontend, Express backend, and PostgreSQL database, the system provides a clean interface for repository management and Git history cleanup operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system following Material Design principles
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Single-page application with view-based navigation using React state

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Tools**: Hot reload with Vite integration for seamless development experience

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Code-first approach using Drizzle Kit for migrations
- **Connection**: Neon serverless PostgreSQL for production deployment
- **Fallback**: In-memory storage implementation for development/testing scenarios

### Authentication and Authorization
- **GitHub Integration**: OAuth-based authentication through Replit Connectors
- **Token Management**: Automatic token refresh and secure credential handling
- **Access Control**: Repository-level permissions based on GitHub user access rights

### Design System
- **Theme Support**: Dark/light mode with system preference detection
- **Color Palette**: Custom HSL-based color system with semantic naming
- **Typography**: Roboto font family with consistent sizing scale
- **Component Standards**: Consistent spacing units (4px grid) and elevation patterns

### Git Operations
- **Repository Analysis**: Automated scanning for Replit-generated commit patterns
- **Commit Detection**: Pattern matching for commit messages and metadata analysis
- **Safe Cleanup**: Backup creation before destructive operations with confirmation dialogs
- **Batch Processing**: Support for multiple repository operations with progress tracking

## External Dependencies

### Core Infrastructure
- **Replit Platform**: Deployment environment with integrated development tools
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **GitHub API**: Repository access and Git operations via Octokit REST client

### Authentication Services
- **Replit Connectors**: Managed OAuth integration for GitHub authentication
- **GitHub OAuth**: Secure repository access with automatic token refresh

### Development Dependencies
- **Drizzle Kit**: Database schema management and migration tooling
- **TanStack Query**: Server state synchronization and caching
- **date-fns**: Date formatting and manipulation utilities
- **Lucide React**: Consistent icon library with tree-shaking support

### UI Components
- **Radix UI**: Headless component primitives for accessibility compliance
- **Class Variance Authority**: Type-safe component variant management
- **Tailwind CSS**: Utility-first styling with PostCSS processing
- **cmdk**: Command palette implementation for enhanced user experience