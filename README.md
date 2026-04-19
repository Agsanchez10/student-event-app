# Bullepin - Student Event App

<img src="./public/logos/bullepin_minimal_4pins.svg" width="200" />

A campus event and club management application built with Next.js 16, MongoDB, and Tailwind CSS. Students can discover events, join clubs, and manage their campus activities, while College Admins and System Admins have dedicated tools for content management and moderation.

## Features

### 🔐 Authentication & User Management
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Password Reset**: OTP-based email password reset flow via Resend
- **Four User Roles** with role-based access control:
  - **Student**: Browse and register for events, join clubs, sign charters
  - **ClubOwner**: Create and manage clubs, post events and announcements
  - **CollegeAdmin**: Moderate all content, manage clubs/events, review flags, suspend users
  - **SystemAdmin**: Full platform access — manage admins, users, and all content
- **Account Management**: Create, update, deactivate, and reactivate accounts
- **System Admin Controls**: Create College Admins, toggle admin active status

### 📅 Events
- **Full CRUD**: Create, edit, and delete events (ClubOwner for their own; CollegeAdmin/SystemAdmin for all)
- **Visibility Control**: Public (anyone) or private (authenticated users only)
- **Pricing**: Free or paid events with price display
- **Category Tags**: music, tech, sports, social, academic, arts, wellness, gaming, networking, professional, community-service, fundraising, other
- **Registration**: Students register/unregister; registration list tracked per event
- **Registered Events Dashboard**: Shows upcoming events by default with toggle to view past events; past events display a "Past Event" badge
- **Public Browse**: Unauthenticated users can browse public events at `/public/events`

### 🏢 Clubs
- **Full CRUD**: Create, read, update, delete clubs
- **Club Ownership**: ClubOwners manage their own clubs
- **Membership**: Students join/leave clubs; membership tracked
- **Club Landing Pages**: `/clubs/[clubid]` — public club detail pages
- **Club Dashboard**: ClubOwners and admins manage events and announcements per club

### 📣 Announcements
- **Club Announcements**: ClubOwners post announcements scoped to their club
- **Moderation**: CollegeAdmin and SystemAdmin can delete any announcement

### 📋 Club Charter System
- **Approval Workflow**: New club proposals go through draft → collecting signatures → submitted → approved/rejected
- **Signature Requirement**: 10+ signatures needed to advance to submission
- **Charter Management**: View, sign, remove signatures; admins approve or reject

### 🚩 Content Moderation
- **Flagging**: Any user can flag events, clubs, announcements, or other users
- **Admin Review**: CollegeAdmin and SystemAdmin review flagged items
- **Resolve Actions**: Remove flagged content (events, clubs, announcements) or suspend the content owner directly from the flagged content page
- **Flag Enrichment**: Each flag displays the content owner so admins act on the right person

### 📊 Role-Based Dashboards
- **Student Dashboard**: Upcoming registered events widget, club memberships, charter activity
- **CollegeAdmin Dashboard**: Flagged content, club/event moderation, charter review
- **SystemAdmin Dashboard**: User account management, admin management, platform overview
- **Club Dashboard**: Per-club view of events and announcements for owners and admins

### 🌐 Public Interface
- **Home Page**: Landing page with hero section and test login credentials for demo
- **Public Events**: Browse upcoming public events without logging in
- **About Page**: General platform information

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Database | MongoDB with Mongoose 9 |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |
| Email | Resend |
| Hosting | — |

## Project Structure

```
app/
├── actions/                  # Next.js Server Actions (all mutations)
│   ├── eventActions.js
│   ├── announcementActions.js
│   ├── clubActions.js
│   ├── clubCharterActions.js
│   ├── flagActions.js
│   ├── membershipApplicationActions.js
│   └── userActions.js
├── api/                      # REST API routes (auth + read queries)
│   ├── auth/                 # login, logout, check, register, password-reset, verify-otp, set-new-password
│   ├── users/
│   ├── events/
│   ├── clubs/
│   ├── club-charters/
│   ├── flags/
│   ├── system-admin/
│   └── email/send/
├── dashboard/                # Authenticated dashboards
│   ├── page.js               # Main dashboard (role-aware redirect)
│   ├── admin/                # CollegeAdmin pages (flagged-content, etc.)
│   ├── system-admin/         # SystemAdmin pages
│   ├── clubs/[clubid]/       # Club dashboard (events + announcements tabs)
│   ├── events/               # Event list & management
│   ├── club-charter/         # Charter detail
│   ├── pending-charters/     # Charter approval queue
│   ├── new-club-charters/    # Submit new charter
│   └── registeredEvents/     # Full registered events list
├── public/                   # Public-facing pages
│   ├── events/               # Public events browse
│   └── about/
├── clubs/[clubid]/           # Public club detail pages
├── login/ register/ logout/
├── reset-password/ new-password/
└── components/               # Shared UI (Navbar, Sidebar, Footer, SystemAdmin/*)
models/                       # Mongoose schemas
├── User.js
├── Club.js
├── Event.js
├── ClubCharter.js
├── Flag.js
├── Announcement.js
└── MembershipApplication.js
services/                     # Business logic layer
├── authService.js
├── userService.js
├── clubService.js
├── eventService.js
├── clubCharterService.js
├── flagService.js
├── announcementService.js
├── membershipApplicationService.js
└── emailService.js
lib/
├── mongodb.js                # MongoDB connection
└── authMiddleware.js         # getCurrentUser, requireAdmin, requireSystemAdmin
data/                         # Seed JSON files
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or MongoDB Atlas)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/Agsanchez10/student-event-app
cd student-event-app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
NODE_ENV=development
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test Accounts

All accounts use password: **`password123`**

| Role | Email |
|---|---|
| System Admin | `system.admin@bullepin.xyz` |
| College Admin | `college.admin@bullepin.xyz` |
| Club Owner | `club.owner@bullepin.xyz` |
| Student | `student@bullepin.xyz` |

These credentials are also displayed on the home page for quick demo access.

## Key API Endpoints

### Authentication
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/check` — Check session
- `POST /api/auth/register` — Register new account
- `POST /api/auth/password-reset` — Request OTP reset email
- `POST /api/auth/verify-otp` — Verify OTP code
- `POST /api/auth/set-new-password` — Set new password after OTP verification

### Users
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `GET /api/users/[userid]` — Get user
- `PUT /api/users/[userid]` — Update user
- `GET /api/users/current` — Get current authenticated user

### System Admin
- `GET /api/system-admin/users` — All users (SystemAdmin only)
- `GET /api/system-admin/admins` — All admins (SystemAdmin only)
- `POST /api/system-admin/account-management` — Activate/deactivate accounts

### Events
- `GET /api/events` — List events
- `POST /api/events` — Create event (via Server Action preferred)
- `GET /api/events/[eventid]` — Get event
- `GET /api/events/users` — Events the current user is registered for

### Clubs
- `GET /api/clubs` — List clubs
- `GET /api/clubs/[clubid]` — Get club

### Club Charters
- `GET /api/club-charters` — List charters
- `GET /api/club-charters/[charterid]` — Get charter

### Flags
- `GET /api/flags` — List flags (admin only)
- `POST /api/flags` — Submit a flag

> **Note:** All data mutations (create, update, delete) are handled via **Next.js Server Actions** in `app/actions/`. Direct API mutation routes have been deprecated.

## Acknowledgments

- **GitHub Copilot** — AI pair programming assistant used throughout development to help implement features, debug issues, and accelerate code generation.

