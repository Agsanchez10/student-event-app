# Club Dashboard Management System

## Overview

A comprehensive club management dashboard that allows club owners and admins to manage all aspects of their club including details, announcements, events, and (for private clubs) membership applications.

## Features

### 1. **Club Details Tab**
- View club information (name, description, type, member count, creation date)
- Display whether the club is public or private
- Shows total number of current members

### 2. **Announcements Tab**
- **For All Members**: View all club announcements
- **For Club Admins**:
  - Post new announcements with title and description
  - Edit existing announcements
  - Delete announcements
  - Announcements are sorted by most recent first

### 3. **Events Tab**
- **For All Members**: View all club events with details (date, location, registrations)
- **For Club Admins**:
  - Create new events with name, description, date, and location
  - Edit event details
  - Delete events
  - Events are sorted by date
  - Each event shows current registration count

### 4. **Membership Applications Tab** (Private Clubs Only)
- **For Club Admins**: Manage pending membership applications
  - View applicant information (name, email)
  - Approve applications (adds user to club membership)
  - Reject applications (removes from pending list)
- Automatically appears only for private clubs

## Data Models

### Club Model Updates
```javascript
{
    isPrivate: Boolean,                        // Whether club is private or public
    membershipApplications: [Number],          // References to MembershipApplication
    announcements: [Number],                   // References to Announcement (updated from String)
}
```

### MembershipApplication Model
```javascript
{
    _id: Number,
    clubID: Number,        // Reference to Club
    userId: Number,        // Reference to User
    userName: String,      // Cached user name
    userEmail: String,     // Cached user email
    status: String,        // "pending", "approved", "rejected"
    createdAt: Date,
}
```

## API Routes

### Announcements
- `GET /api/clubs/[clubid]/announcements` - Get all announcements for a club
- `POST /api/clubs/[clubid]/announcements` - Create new announcement (Admin only)
- `PUT /api/clubs/[clubid]/announcements/[announcementid]` - Update announcement (Admin only)
- `DELETE /api/clubs/[clubid]/announcements/[announcementid]` - Delete announcement (Admin only)

### Membership Applications
- `GET /api/clubs/[clubid]/membership-applications` - Get pending applications (Admin only)
- `PUT /api/clubs/[clubid]/membership-applications/[appid]` - Approve application (Admin only)
- `DELETE /api/clubs/[clubid]/membership-applications/[appid]` - Reject application (Admin only)

## File Structure

```
app/
├── dashboard/
│   └── clubs/
│       └── [clubid]/
│           ├── page.js (Server component - Authentication & data fetching)
│           └── ClubDashboardClient.js (Client component - UI & interactions)
└── api/
    └── clubs/
        └── [clubid]/
            ├── announcements/
            │   ├── route.js (GET, POST)
            │   └── [announcementid]/
            │       └── route.js (PUT, DELETE)
            └── membership-applications/
                ├── route.js (GET)
                └── [appid]/
                    └── route.js (PUT, DELETE)

models/
├── Club.js (Updated with isPrivate and membershipApplications)
├── Announcement.js
└── MembershipApplication.js (New)

services/
├── announcementService.js (New)
└── membershipApplicationService.js (New)
```

## Authorization

- **Club Owner**: Can access dashboard for their own clubs (automatic redirect on login)
- **Club Admin**: Can perform all admin actions (edit/delete announcements, create/edit/delete events, manage applications)
- **Member**: Can view announcements and events (read-only)
- **Non-member**: Cannot access club dashboard

## Usage

### Accessing the Dashboard
1. Log in to your account
2. Navigate to `/dashboard/clubs/[clubid]` where `[clubid]` is your club's ID
3. If you own a club, you may be automatically redirected here

### Posting an Announcement (Admin Only)
1. Go to the "Announcements" tab
2. Click "Post Announcement"
3. Enter title and description
4. Click "Post"

### Creating an Event (Admin Only)
1. Go to the "Events" tab
2. Click "Create Event"
3. Fill in event details (name, description, date, location)
4. Click "Create Event"

### Managing Membership Applications (Private Clubs, Admin Only)
1. Go to the "Membership Applications" tab
2. View pending applications
3. Click "Approve" to add user to club membership
4. Click "Reject" to deny the application

## Services

### announcementService.js
- `getClubAnnouncements(clubID)` - Fetch all announcements for a club
- `createAnnouncement(clubID, data)` - Create new announcement
- `updateAnnouncement(announcementID, data)` - Update announcement
- `deleteAnnouncement(announcementID, clubID)` - Delete announcement

### membershipApplicationService.js
- `getMembershipApplications(clubID)` - Get pending applications
- `createMembershipApplication(clubID, userId, userName, userEmail)` - Create application
- `approveMembershipApplication(applicationID, userId, clubID)` - Approve application
- `rejectMembershipApplication(applicationID, clubID)` - Reject application

## Implementation Notes

- All admin actions require the user to be either the club owner or designated club admin
- Announcements are displayed in reverse chronological order (newest first)
- Events are sorted by date
- Membership applications only appear for private clubs
- The UI uses responsive design with dark mode support
- All operations include proper error handling and user feedback via alerts
- Transaction consistency is maintained when approving applications (both status update and membership addition)
