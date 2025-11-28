# Shyaw Administration System

## Overview

This is a full-stack web application for internal employee management with role-based access control (admin, manager, security). It manages employees, todo lists, and internal interview/evaluation requests, focusing on employee affairs, performance reviews, internal role changes, and administrative tasks. The project's business vision is to streamline internal HR and operational processes, enhance employee management efficiency, and provide comprehensive reporting tools.

## Recent Changes (November 2025)

- **Weekly Meetings Task Management - Complete Implementation** (Latest):
  - Added `assignedUserId` field to weekly meeting tasks for user assignments
  - Created `taskComments` table for storing comments and proof on tasks
  - Implemented storage methods: `createTaskComment`, `getTaskComments`, with auto-loading on task fetch
  - Added API endpoints: POST/GET `/api/weekly-meetings/tasks/:taskId/comments` and GET `/api/users`
  - Frontend UI enhancements:
    - User dropdown selector in "Add New Task" form for assigning tasks to team members
    - Comments & Progress section in task detail view showing comment history
    - Comment input textarea with timestamp tracking and proof submission support
    - Scrollable comment history with author and creation time display
  - Database migration: Successfully synced new `assignedUserId` and `taskComments` table
  - All features tested and working: user assignments, comments, and proof tracking fully functional

- **Port Configuration for Local Development**:
  - Made port configurable via PORT environment variable
  - Local development: `PORT=3000 npm run dev` (for port 3000)
  - Replit deployment: `npm run dev` (defaults to port 5000)
  - Allows flexible development workflow on any machine
- **Manager-Only Pages Created**:
  - Password-protected manager todos page (`/manager-todos`)
  - Team dashboard showing managed staff and task statistics (`/manager-dashboard`)
  - Eye icon for completion proof/notes display on all pages
- **TypeScript Type Casting Fixes**:
  - Fixed 11 database query type-casting errors in storage layer
  - Proper Drizzle ORM result handling with array type casting
  - Improved type safety for todo, interview, and user management operations
- **Menu Partitions System Implemented**:
  - Created comprehensive menu partitions organizing all 25+ pages into 5 business sections
  - Automatic PageInfo display on all pages showing current partition and page title
  - Partition Browser page at `/partitions` to explore all pages by section
  - Partition utilities for page searching and breadcrumb generation
  - 5 Partitions: Task Management, Employee Management, HR & Operations, Analytics & Reports, System Management
- **Employee Role Added**:
  - Added "Employee" role to database schema and user management forms
  - Implemented in add user form, filter dropdowns, and user creation

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
- Menu partitions should NOT be changed (no layout modifications) - partitions are data organization only, auto-display on all pages

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
- **Menu Partition System**: Automatic page partition display on all pages showing current section and page title, partition browser for exploring pages by business category.

**Technical Implementations:**
- **Frontend**: React with TypeScript, Vite for build tooling, React Query for server state management, Wouter for routing, Context-based auth system.
- **Backend**: Express.js server with TypeScript, organized API endpoints, database abstraction through `storage.ts`, Drizzle ORM.
- **Authentication**: JWT-based authentication with role-based access control (Admin, Manager, Security, Office, Secretary, Employee).
- **Database**: PostgreSQL (local) with standard pg driver, Drizzle ORM for schema management.
- **Database Schema**: PostgreSQL with tables for Users, Todo Lists, Todo Items, and Interview Requests.
- **Data Flow**: Authentication, authorization, data operations, and real-time updates via React Query.
- **Notifications**: Enhanced notification system with real-time updates (3-second polling), automatic permission requests, quick action buttons, and a dedicated notification management page with filtering and search.
- **Archiving**: One-Click Task Archive with Undo Functionality (10-second undo window, animated toast notifications), selective task archiving, and archive functionality for employee reviews/evaluations.
- **Data View**: Clean, minimal design with gradient backgrounds, improved typography, and glass-morphism effects. Features comprehensive date filtering (today-first, auto-refresh), real-time data counters, and admin-only data removal controls with confirmation modals.
- **Reports**: Comprehensive Management Reports page with interactive charts using Recharts, user statistics, task analytics, interview metrics, feedback analysis, and operational data with CSV export.
- **Internationalization**: Comprehensive Kurdish and English language support, including i18n configuration and translated components.
- **Menu Partitions**: Data-driven organization of 25+ pages into 5 business sections (Task Management, Employee Management, HR & Operations, Analytics & Reports, System Management) with automatic display on all pages.
- **Development & Deployment**: Configured for Replit deployment, using Vite for frontend build, esbuild for backend bundling. Production mode uses `NODE_ENV`-based configuration and external port mapping. Includes a cPanel deployment guide for Hostinger and similar providers.

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
- **Database**: PostgreSQL with pg driver
- **ORM**: Drizzle ORM
- **Authentication**: JWT, bcrypt
- **Development**: tsx

**Build Tools:**
- **Bundling**: Vite (frontend), esbuild (backend)
- **TypeScript**: Full TypeScript support
