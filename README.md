# Student Event App

A comprehensive campus event and club management application built with Next.js, MongoDB, and modern web technologies. Students can discover events, join clubs, and manage their campus activities, while administrators have tools to manage content and moderate community engagement.

## Features

### 🔐 Authentication & User Management
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **User Roles**: Three distinct user types with role-based access control
  - **Students**: Browse events, join clubs, register for activities
  - **College Admins**: Manage clubs, events, and review flagged content
  - **System Admins**: Manage user accounts and create new College Admins
- **User Account Management**: Create, update, deactivate, and reactivate user accounts
- **Admin Account Control**: System admins can create College Admins and manage their active status

### 📅 Events Management
- **Event Creation & Management**: Create, edit, and delete campus events
- **Visibility Control**: Mark events as public (visible to all) or private (institution-only)
- **Event Registration**: Students can register/unregister from events
- **Event Details**: Display location, date, time, club affiliation, and registration count
- **Public Events Page**: Unauthenticated users can browse publicly visible events at `/events`
- **User Event Tracking**: View all events a student is registered for

### 🏢 Club Management
- **Club CRUD Operations**: Create, read, update, and delete clubs
- **Club Ownership**: Users can own and manage their clubs
- **Club Membership**: Students can join clubs and view their memberships
- **Club Landing Pages**: Dedicated pages for individual clubs with event and membership info

### 📋 Club Charter System
- **Charter Workflow**: New clubs go through an approval process
- **Charter Signatures**: Requires 10+ signatures to advance to submission
- **Status Tracking**: Charters progress through states (draft, collecting, submitted, approved/rejected)
- **Charter Management**: View, sign, and remove signatures from charters

### 🚩 Content Moderation
- **Flagged Content**: Users can flag inappropriate content
- **Admin Review**: Admins can view and manage flagged content
- **Flag Organization**: Browse flagged items by type and status

### 📊 Dashboards & Personalization
- **Role-Based Dashboards**:
  - Student Dashboard: Registered events, club memberships, charter activity
  - College Admin Dashboard: Manage events, clubs, charters, and flagged content
  - System Admin Dashboard: User management and admin controls
- **Quick Actions**: Fast access to common tasks
- **Personalized Content**: Dashboards adapt based on user role

### 🧪 Testing & Development
- **Testing Page**: Central location with links to all pages and API endpoints (`/testing`)
- **API Testing**: Easy access to all REST API endpoints with example URLs

### 🌐 Public Interface
- **Public Events Page**: Unauthenticated users can view publicly visible events
- **Home Page**: Landing page with quick navigation to events and features
- **About & Contact Pages**: General information and contact options

## Technology Stack

- **Frontend**: Next.js 13+ (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies, bcryptjs password hashing
- **Security**: CSRF protection, HTTPS-only cookies in production, secure password hashing

## Project Structure

```
app/
├── api/                      # API endpoints
│   ├── auth/                # Authentication routes (login, logout, check)
│   ├── users/               # User management endpoints
│   ├── events/              # Event management endpoints
│   ├── clubs/               # Club management endpoints
│   ├── club-charters/       # Club charter endpoints
│   └── flags/               # Content flagging endpoints
├── dashboard/               # Authenticated dashboards
│   ├── page.js             # Main dashboard (role-aware)
│   ├── student/            # Student dashboard
│   ├── admin/              # College Admin dashboard
│   ├── system-admin/       # System Admin dashboard
│   ├── events/             # Event management
│   ├── clubs/              # Club management
│   ├── pending-charters/   # Charter approval queue
│   ├── new-club-charters/  # New charter applications
│   └── flags/              # Flagged content review
├── public/                 # Public facing pages
|   ├── events/             # Public events page
│   ├── about/              # About page
│   └── contact/            # Contact page
├── clubs/                  # Club detail pages
├── testing/                # Testing dashboard with all links
└── components/             # Reusable UI components
models/                     # Mongoose schemas
├── User.js                 # User with role discriminators
├── Club.js
├── Event.js
├── ClubCharter.js
├── Flag.js
└── Announcement.js
services/                    # Business logic & database operations
├── authService.js          # Authentication logic
├── userService.js          # User CRUD & admin functions
├── clubService.js          # Club operations
├── eventService.js         # Event operations
├── clubCharterService.js   # Charter workflow
└── flagService.js          # Content flagging
lib/
└── mongodb.js              # MongoDB connection utility
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or MongoDB Atlas)
- npm or yarn package manager

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

3. Set up environment variables by creating a `.env.local` file:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/[userid]` - Get specific user
- `PUT /api/users/[userid]` - Update user
- `DELETE /api/users/[userid]` - Delete user
- `POST /api/users/admin/create` - Create College Admin (System Admin only)
- `POST /api/users/admin/deactivate` - Deactivate user (System Admin only)
- `POST /api/users/admin/activate` - Reactivate user (System Admin only)

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/[eventid]` - Get specific event
- `PUT /api/events/[eventid]` - Update event
- `DELETE /api/events/[eventid]` - Delete event
- `POST /api/events/[eventid]/register` - Register for event
- `DELETE /api/events/[eventid]/register` - Unregister from event
- `GET /api/events/users?userId=[userid]` - Get user's registered events

### Clubs
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Create club
- `GET /api/clubs/[clubid]` - Get specific club
- `PUT /api/clubs/[clubid]` - Update club
- `DELETE /api/clubs/[clubid]` - Delete club

### Club Charters
- `GET /api/club-charters` - Get user's charters
- `POST /api/club-charters` - Create new charter
- `GET /api/club-charters/[charterid]` - Get charter details
- `POST /api/club-charters/[charterid]/sign` - Sign charter
- `POST /api/club-charters/[charterid]/remove-signature` - Remove signature from charter

### Flags
- `GET /api/flags` - Get all flags
- `POST /api/flags` - Create flag
- `GET /api/flags/[flagid]` - Get specific flag
- `PUT /api/flags/[flagid]` - Update flag
- `DELETE /api/flags/[flagid]` - Delete flag

## Database Models

### User
- Base user with email, password, name, phone, and class year
- Discriminators: Student, Admin (with adminType and isActive), ClubOwner
- Properties: club memberships, owned clubs, role-specific fields

### Event
- Name, description, date, time, location
- Visibility: public or private
- Owner and registration list
- Club affiliation

### Club
- Name, description, meeting times
- Owner and member lists
- Associated events

### ClubCharter
- Charter details and status workflow
- Initiator and signature collection
- Auto-advances from "collecting" to "submitted" at 10+ signatures

### Flag
- Flagged content with description and reason
- User who flagged it
- Status tracking (open, resolved, dismissed)

### Announcement
- Club announcements and updates
- Creation and posting dates

## Authentication Flow

1. User submits email/password to `/api/auth/login`
2. Password validated against hashed password in database
3. JWT token generated with user ID, email, and role
4. Token set in HTTP-only secure cookie
5. Frontend checks auth status via `/api/auth/check`
6. Sidebar and navigation components conditionally render based on auth state

## Role-Based Access Control

- **Public Access**: Home, About, Contact, Public Events
- **Authenticated Access**: Dashboard, Event Registration, Club Membership
- **Student Access**: Student Dashboard, Event Registration, Club Membership
- **College Admin Access**: College Admin Dashboard, Content Moderation, Club Management
- **System Admin Access**: System Admin Dashboard, User Management, Admin Creation

## Security Features

- JWT tokens expire after 1 hour
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production (HTTPS only)
- Password hashing with bcryptjs (rounds: 10)
- Role-based route protection
- Environment variable configuration for sensitive data

## Development & Testing

Access the testing dashboard at `/testing` to quickly navigate to all pages and API endpoints for development and testing purposes.

## Future Enhancements

- Real-time notifications for event updates
- Email notifications for registrations
- Announcement system for clubs
- Calendar view for events


