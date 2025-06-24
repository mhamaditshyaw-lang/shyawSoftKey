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
- June 23, 2025: Added third tracking component for staff count with 6 fields matching operational categories (Day/Night Ice cream, Albany, Do)
- June 23, 2025: Unified dashboard terminology across all three sections to consistently reflect ice cream and Albany business operations
- June 23, 2025: Created comprehensive Data View page with complete operational data visibility, filtering, and export capabilities
- June 23, 2025: Added advanced date search functionality with specific date search, date range filtering, and active filter management
- June 23, 2025: Added fourth tracking component "Yesterday's Production" with 6 fields for production data in cartons and tons
- June 23, 2025: Completed comprehensive 4-section dashboard: Employee (7), Operations (6), Staff Count (6), Yesterday's Production (6) with unique themes
- June 23, 2025: Added fifth tracking component "Yesterday's Loading Vehicles" with 3 fields for vehicle tracking
- June 23, 2025: Implemented Playful Time-Stamped Loading Visualization with animated progress, real-time timestamps, and contextual loading steps for all form submissions and data operations
- June 23, 2025: Implemented comprehensive User Preference Saving system for Data View with customizable filters, sorting, pagination, view modes, and auto-refresh settings
- June 23, 2025: Added Contextual Confirmation Modal for Data Deletion with entry preview, bulk deletion confirmation, and enhanced security
- June 23, 2025: Implemented comprehensive date filtering system with today-focused data view, auto-refresh functionality, and custom date selection
- June 23, 2025: Enhanced Feedback & Reviews system with analytics dashboard, rating distribution, trend analysis, and comprehensive reporting
- June 23, 2025: Added date filtering, auto-refresh, and today-focused view to Feedback & Reviews system with comprehensive search capabilities
- June 23, 2025: Implemented comprehensive date filtering, auto-refresh, and today-focused view for Dashboard/Todo Management with real-time statistics
- June 23, 2025: Created enhanced Daily Task Management page with completion animations, comprehensive filtering, daily work lists, and real-time progress tracking
- June 23, 2025: Implemented Smart Prioritization Algorithm for Daily Tasks with intelligent scoring based on urgency, priority, workload, completion rate, age, and user patterns
- June 23, 2025: Created comprehensive Management Reports page with interactive charts, data visualization, user privacy controls, and CSV export functionality for managers and admins
- June 24, 2025: Added archive button to todo lists with proper styling and role-based access control
- June 24, 2025: Implemented One-Click Task Archive with Undo Functionality featuring 10-second undo window, animated toast notifications, and complete restore capability
- June 24, 2025: Added comprehensive archive functionality including Archive All Tasks button, individual task/list archive buttons, and improved archive API with proper validation
- June 24, 2025: Implemented selective task archiving with selection mode, checkboxes for individual tasks/lists, bulk selection controls, and visual selection indicators
- June 24, 2025: Enhanced Employee Reviews & Evaluations page with comprehensive date filtering, auto-refresh every 30 seconds, search functionality by employee/position/reviewer, and advanced filter controls with clear filter options
- June 24, 2025: Added archive button to Employee Reviews & Evaluations page with role-based access control for admins and managers
- June 24, 2025: Enhanced Data View page with date search functionality including specific date search and date range filtering
- June 24, 2025: Created comprehensive All Data Dashboard page aggregating data from all system components with advanced filtering, search, export capabilities, and unified data view
- June 24, 2025: Implemented comprehensive mobile responsiveness and phone size customization across entire system including touch-friendly navigation, responsive grids, mobile-optimized buttons, and adaptive layouts
- June 24, 2025: Added comprehensive navigation menu system with "All Pages" dropdown in header and floating page menu modal, featuring categorized page organization, search functionality, role-based filtering, and enhanced navigation experience
- June 24, 2025: Implemented responsive menu bar system with desktop horizontal navigation, mobile bottom navigation bar, and slide-out menu panel, providing optimal navigation experience across all device sizes
- June 24, 2025: Added comprehensive dark mode implementation with theme toggle, system preference detection, localStorage persistence, and complete dark styling across all components

## User Preferences

Preferred communication style: Simple, everyday language.
- Edit archive form should only have name, date, and description fields (simplified from complex evaluation form)
- Description field should always start empty for writing new content, not pre-filled with existing data
- Each new description entry should be stored with timestamp and preserved (multiple entries supported)
- Archive page should support searching by employee name, category/position, and date filters
- Remove feedback quick action from dashboard (keep only in sidebar navigation)
- Added animated welcome dashboard with greeting, time-based messages, role badges, and smooth animations
- Implemented emoji/icon picker for description highlights with categorized selection (Performance, Feedback, Areas)
- Prefers old/simple design for Data View with search functionality and icons on filter buttons
- Updated Data View to clean, minimal design with better spacing and modern card layout
- Enhanced Data View with beautiful gradient backgrounds, improved typography, and modern glass-morphism effects
- Removed all test fields and debug sections from dashboard for clean production interface
- Added admin-only data removal functionality in Data View with individual entry deletion and clear all data options
- Implemented contextual confirmation modal for secure data deletion with entry previews and typed confirmation for bulk operations
- Added comprehensive date filtering with today-first approach, auto-refresh every 30 seconds, and real-time data counters
- Enhanced Feedback & Reviews with analytics dashboard, search/filter capabilities, rating trends, and actionable insights
- Implemented date filtering and auto-refresh for Feedback & Reviews with today-first approach and real-time data updates
- Added comprehensive date filtering and auto-refresh system to Dashboard/Todo Management with today-focused view and filtered statistics
- Created dedicated Daily Task Management page with animated task completion, daily work lists, comprehensive filtering (date, priority, status), auto-refresh functionality, and real-time progress tracking with visual completion animations
- Implemented Smart Prioritization Algorithm with weighted scoring system analyzing urgency (due dates), priority levels, workload, completion momentum, task age, and user behavior patterns to provide intelligent task recommendations and daily productivity suggestions
- Created comprehensive Management Reports page with interactive charts and data visualization using Recharts library, featuring user statistics, task analytics, interview metrics, feedback analysis, and operational data with role-based access control and CSV export functionality
- Implemented One-Click Task Archive with Undo Functionality providing quick task archiving with blue archive buttons, 10-second undo window, animated toast notifications, complete item restoration, and enhanced user experience for task management
