# Office Management System

## Overview

This is a full-stack web application built for internal employee management with role-based access control. The system manages internal employees, todo lists, and internal interview/evaluation requests with three user roles: admin, manager, and secretary. The application is designed for managing existing company employees' affairs, performance reviews, internal role changes, and administrative tasks. It uses a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database.

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

- **Users Table**: Internal employee accounts with roles (admin, manager, secretary) and status tracking
- **Todo Lists Table**: Internal task lists with assignment and priority management for employee affairs
- **Todo Items Table**: Individual administrative tasks within lists with completion tracking
- **Interview Requests Table**: Internal employee evaluation/review scheduling and internal role change interviews

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

- June 21, 2025: Initial setup of office management system
- June 21, 2025: Completed full-stack implementation with authentication, role-based access control, user management, interview request system, todo management, and reports dashboard
- June 21, 2025: Created admin user (username: admin, password: admin123) and set up database schema
- June 22, 2025: Fixed SelectItem errors in modals and added proper accessibility features
- June 22, 2025: Added comprehensive notification system with real-time updates, notification bell, and automatic notifications for user creation, interview requests, status changes, and todo assignments
- June 22, 2025: Created feedback system with rating capabilities and archive functionality for managing completed interviews, todos, and users
- June 22, 2025: Updated system terminology and branding to reflect internal employee management focus rather than external hiring
- June 22, 2025: Enhanced operations tracking with dual-form dashboard for employee attendance (7 fields) and operational activities (6 fields)
- June 22, 2025: Updated operations fields to track ice cream production, Albany operations, and Do activities across day/night shifts

## User Preferences

Preferred communication style: Simple, everyday language.
- Edit archive form should only have name, date, and description fields (simplified from complex evaluation form)
- Description field should always start empty for writing new content, not pre-filled with existing data
- Each new description entry should be stored with timestamp and preserved (multiple entries supported)
- Archive page should support searching by employee name, category/position, and date filters
- Remove feedback quick action from dashboard (keep only in sidebar navigation)
- Added animated welcome dashboard with greeting, time-based messages, role badges, and smooth animations
- Implemented emoji/icon picker for description highlights with categorized selection (Performance, Feedback, Areas)
