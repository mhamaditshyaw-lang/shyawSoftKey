# Shyaw Administration System

## Overview

This is a full-stack web application for internal employee management with role-based access control (admin, manager, security). It manages employees, todo lists, and internal interview/evaluation requests, focusing on employee affairs, performance reviews, internal role changes, and administrative tasks. The project's business vision is to streamline internal HR and operational processes, enhance employee management efficiency, and provide comprehensive reporting tools.

## Recent Changes (August 2025)

- **Data & File Cleanup**: Cleared all database data and removed unnecessary deployment files, assets, and build artifacts
- **Employee Management**: Created missing employee management pages (employee-management.tsx, add-employee.tsx) with comprehensive CRUD functionality
- **System Reset**: Truncated all database tables (users, notifications, todos, interviews, feedback, etc.) for fresh start
- **File Organization**: Removed deployment guides, scripts, build files, and attached assets to clean up project structure
- **Application Recovery**: Fixed missing import errors and restored application functionality after cleanup

## User Preferences

Preferred communication style: Simple, everyday language.
- Edit archive form should only have name, date, and description fields (simplified from complex evaluation form)
- Description field should always start empty for writing new content, not pre-filled with existing data
- Each new description entry should be stored with timestamp and preserved (multiple entries supported)
- Archive page should support searching by employee name, category/position, and date filters
- Remove feedback quick action from dashboard (keep only in sidebar navigation)
- Archive should show detailed views of archived items with expandable sections
- Archive should have interview report forms for adding performance ratings and detailed descriptions
- Archive should have comprehensive date filtering (today, week, month, custom date, date range)
- Remove restore button from archive (archive items should be permanent)
- Archive page should display original data in readable format and manage multiple reports per item
- Prefers old/simple design for Data View with search functionality and icons on filter buttons
- Removed all test fields and debug sections from dashboard for clean production interface
- Removed notification bell icon from header per user request while keeping notification management functionality in sidebar navigation

## System Architecture

The application follows a client-server architecture.

**UI/UX Decisions:**
- Uses a modern React frontend with shadcn/ui components, built on Radix UI primitives, styled with Tailwind CSS.
- Implements a modern sleek dashboard UI with a specific color palette (Primary: #2563EB, Secondary: #374151, Accent: #10B981, Error: #DC2626, Background Light: #F9FAFB, Background Dark: #1F2937).
- Features a responsive dashboard layout with collapsible sidebar, header with search/notifications/theme toggle, stats cards with hover effects, quick action buttons, and an activity feed.
- Comprehensive navigation system with "All Pages" dropdown, floating page menu modal, categorized organization, search functionality, and role-based filtering.
- Responsive menu bar system with desktop horizontal navigation, mobile bottom navigation bar, and slide-out menu panel.
- Dark mode implementation with theme toggle, system preference detection, and localStorage persistence.
- Glass morphism design system with backdrop blur effects, professional black/white color scheme, and smooth animations, including a UI component library (GlassCard, GlassButton, etc.).
- Material Design color scheme transformation with Indigo Primary (#6200EE) and Teal Secondary (#03DAC6) colors.
- Animated welcome dashboard with greeting, time-based messages, role badges, and smooth animations.
- Implemented emoji/icon picker for description highlights.
- Comprehensive contextual help tooltips system (HelpTooltip, FeatureTooltip, RoleTooltip, StatusTooltip, ActionTooltip) for improved user experience.

**Technical Implementations:**
- **Frontend**: React with TypeScript, Vite for build tooling, React Query for server state management, Wouter for routing, Context-based auth system.
- **Backend**: Express.js server with TypeScript, organized API endpoints, database abstraction through `storage.ts`, Drizzle ORM.
- **Authentication**: JWT-based authentication with role-based access control (Admin, Manager, Security).
- **Database Schema**: PostgreSQL with tables for Users, Todo Lists, Todo Items, and Interview Requests.
- **Data Flow**: Authentication, authorization, data operations, and real-time updates via React Query.
- **Notifications**: Enhanced notification system with real-time updates (3-second polling), automatic permission requests, quick action buttons, and a dedicated notification management page with filtering and search.
- **Archiving**: One-Click Task Archive with Undo Functionality (10-second undo window, animated toast notifications), selective task archiving, and archive functionality for employee reviews/evaluations.
- **Data View**: Clean, minimal design with gradient backgrounds, improved typography, and glass-morphism effects. Features comprehensive date filtering (today-first, auto-refresh), real-time data counters, and admin-only data removal controls with confirmation modals.
- **Reports**: Comprehensive Management Reports page with interactive charts using Recharts, user statistics, task analytics, interview metrics, feedback analysis, and operational data with CSV export.
- **Internationalization**: Comprehensive Kurdish and English language support, including i18n configuration and translated components.
- **Development & Deployment**: Configured for Replit deployment, using Vite for frontend build, esbuild for backend bundling. Production mode uses `NODE_ENV`-based configuration and external port mapping. Includes a cPanel deployment guide for Hostinger and similar providers.

**Feature Specifications:**
- Internal employee management with roles (admin, manager, security).
- Todo list management with assignment and priority.
- Internal interview/evaluation request scheduling.
- Comprehensive dashboard with sections for Employee, Operations, Staff Count, Yesterday's Production, and Yesterday's Loading Vehicles.
- Employee Management system with employee profiles, Add Employee form, and New Daily List form.
- Feedback & Reviews system with analytics dashboard, rating distribution, and trend analysis.
- Smart Prioritization Algorithm for daily tasks based on urgency, priority, workload, completion rate, and user patterns.

## External Dependencies

**Frontend:**
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI primitives, shadcn/ui, class-variance-authority
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form, Zod
- **Utilities**: date-fns, clsx
- **Charting**: Recharts

**Backend:**
- **Server Framework**: Express.js
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT, bcrypt
- **Development**: tsx

**Build Tools:**
- **Bundling**: Vite (frontend), esbuild (backend)
- **TypeScript**: Full TypeScript support