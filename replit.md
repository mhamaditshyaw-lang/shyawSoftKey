# Office Management System

## Overview

This is a full-stack web application built for office management with role-based access control. The system manages users, todo lists, and interview requests with three user roles: admin, manager, and secretary. The application uses a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database.

## System Architecture

The application follows a client-server architecture with clear separation of concerns:

- **Frontend**: React with TypeScript, using Vite for build tooling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with role-based access control
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens

## Key Components

### Frontend Architecture

The React frontend is organized with:

- **Pages**: Main application views (dashboard, users, todos, interviews, reports, login)
- **Components**: Reusable UI components built with shadcn/ui
- **Hooks**: Custom hooks for authentication (`use-auth`) and other shared logic
- **State Management**: React Query for server state management
- **Routing**: Wouter for client-side routing
- **Authentication**: Context-based auth system with JWT token storage

### Backend Architecture

The Express.js backend implements:

- **Route Layer**: API endpoints organized in `routes.ts`
- **Storage Layer**: Database abstraction through `storage.ts` interface
- **Database Layer**: Drizzle ORM with PostgreSQL connection
- **Authentication Middleware**: JWT verification and role-based access control
- **Development Server**: Vite integration for development mode

### Database Schema

The PostgreSQL schema includes:

- **Users Table**: User accounts with roles (admin, manager, secretary) and status tracking
- **Todo Lists Table**: Task lists with assignment and priority management
- **Todo Items Table**: Individual tasks within lists with completion tracking
- **Interview Requests Table**: Interview scheduling requests with approval workflow

Key relationships:
- Users can create and be assigned todo lists
- Todo lists contain multiple todo items
- Interview requests reference requesting users and assigned managers

## Data Flow

1. **Authentication Flow**: Login → JWT token generation → Token storage → Authenticated requests
2. **Authorization Flow**: Token verification → Role checking → Route access control
3. **Data Operations**: Frontend requests → Backend validation → Database operations → Response
4. **Real-time Updates**: React Query for automatic data refetching and cache management

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query for state management
- **UI Components**: Radix UI primitives, shadcn/ui component library
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Forms**: React Hook Form with Zod validation
- **Utilities**: date-fns for date handling, clsx for conditional classes

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Neon PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with Zod schema validation
- **Authentication**: JWT for tokens, bcrypt for password hashing
- **Development**: tsx for TypeScript execution, Vite integration

### Build Tools
- **Bundling**: Vite for frontend, esbuild for backend
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development**: Hot reload, error overlays, and debugging tools

## Deployment Strategy

The application is configured for Replit deployment with:

- **Build Process**: Frontend built with Vite, backend bundled with esbuild
- **Production Mode**: NODE_ENV-based configuration switching
- **Port Configuration**: Configured for port 5000 with external mapping to port 80
- **Database**: Environment-based DATABASE_URL configuration
- **Static Assets**: Frontend build output served by Express in production

The deployment uses:
- Development: `npm run dev` - runs TypeScript server directly with hot reload
- Production: `npm run build && npm run start` - builds and runs bundled JavaScript
- Database: Drizzle migrations with `npm run db:push`

## Changelog

- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.