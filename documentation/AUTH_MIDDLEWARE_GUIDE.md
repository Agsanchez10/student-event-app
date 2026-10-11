# Authentication Middleware for Server Actions

This document explains the authentication middleware system added to protect your server actions.

## Overview

All server actions now include authentication and authorization checks to protect your database from unauthorized access.

## Available Authentication Functions

### 1. `getCurrentUser()`
Gets the current authenticated user from the JWT token in cookies.

```javascript
import { getCurrentUser } from "@/lib/authMiddleware";

const user = await getCurrentUser();
// Returns: User object or null if not authenticated
```

### 2. `requireAuth()`
Ensures user is authenticated. Throws error if not.

```javascript
import { requireAuth } from "@/lib/authMiddleware";

const user = await requireAuth();
// Throws: "Unauthorized: Please log in" if not authenticated
```

### 3. `requireRole(requiredRole)`
Ensures user has specific role (e.g., "Student", "Admin", "SystemAdmin").

```javascript
import { requireRole } from "@/lib/authMiddleware";

const user = await requireRole("Student");
// Throws: "Forbidden: Student access required" if user doesn't have role
```

### 4. `requireAdmin()`
Ensures user is admin (SystemAdmin or CollegeAdmin) and active.

```javascript
import { requireAdmin } from "@/lib/authMiddleware";

const user = await requireAdmin();
// Throws: "Forbidden: Admin access required" if not admin
// Also throws if admin account is inactive
```

### 5. `requireSystemAdmin()`
Ensures user is SystemAdmin and active.

```javascript
import { requireSystemAdmin } from "@/lib/authMiddleware";

const user = await requireSystemAdmin();
// Throws: "Forbidden: SystemAdmin access required" if not SystemAdmin
```

### 6. `requireOwnership(ownerId)`
Ensures user owns a specific resource.

```javascript
import { requireOwnership } from "@/lib/authMiddleware";

const user = await requireOwnership(resourceOwnerId);
// Throws: "Forbidden: You don't have access to this resource"
```

## Usage Examples

### Example 1: Fetch Users (Admin Only)
```javascript
"use server";

import { getUsers } from "@/services/userService";
import { requireAdmin } from "@/lib/authMiddleware";

export async function fetchUsers() {
  try {
    // Verify user is admin
    await requireAdmin();
    
    const users = await getUsers();
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Example 2: Update Own Profile
```javascript
"use server";

import { updateUser } from "@/services/userService";
import { requireAuth } from "@/lib/authMiddleware";

export async function updateProfile(userId, userData) {
  try {
    const currentUser = await requireAuth();
    
    // Users can only update their own profile
    if (Number(currentUser._id) !== Number(userId)) {
      throw new Error("Forbidden: You can only update your own profile");
    }
    
    const result = await updateUser(userId, userData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Example 3: Owner-Only Operations
```javascript
"use server";

import { deleteClub, getClub } from "@/services/clubService";
import { requireAuth } from "@/lib/authMiddleware";

export async function removeClub(clubId) {
  try {
    const currentUser = await requireAuth();
    const club = await getClub(clubId);
    
    // Only owner or admin can delete
    if (Number(club.ownedBy) !== Number(currentUser._id) && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Only club owner or admin can delete this club");
    }
    
    const result = await deleteClub(clubId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Current Authorization Levels

### Public Operations
- None (all require authentication)

### Student (Any authenticated user)
- Join/leave clubs
- Register/unregister for events
- Create events and charters
- Submit content flags/reports
- View clubs and events

### Admin (System or College Admin)
- Fetch all users
- Create/delete/deactivate users
- View all flags
- Resolve content reports
- Manage all clubs, events, and charters

### SystemAdmin Only
- Create new admin accounts
- Create/delete any user
- Deactivate admin accounts
- Full access to all operations

## Security Best Practices

1. **Always use `requireAuth()` for authenticated operations**
   - All user data modifications should require authentication

2. **Check ownership before modifications**
   - Let users modify only their own data
   - Admins can modify any data

3. **Use appropriate role checks**
   - `requireAdmin()` for moderation
   - `requireSystemAdmin()` for system operations
   - `requireAuth()` for general authenticated access

4. **Throw meaningful errors**
   - "Unauthorized: Please log in" - No authentication
   - "Forbidden: Admin access required" - Wrong role
   - "Forbidden: You don't have access to this resource" - Wrong ownership

5. **Catch and return errors properly**
   - Return `{ success: false, error: error.message }`
   - Don't expose sensitive details in error messages

## Token Details

Tokens are stored in HTTP-only cookies named `token` and contain:
- User ID (`id`)
- Email
- Role
- Expiration (7 days for normal login, 15 minutes for OTP temp token)

**The middleware automatically extracts and verifies these tokens.**

## Testing Authentication

To test if authentication is working:

```javascript
// This should work
const result = await fetchUsers(); // If you're logged in as admin

// This should fail
// (Logout first, then try)
const result = await fetchUsers(); // "Unauthorized: Please log in"
```

## Migration Notes

All server actions have been updated with appropriate authentication checks:

✅ userActions.js - Admin-only operations
✅ clubActions.js - Auth required, ownership checks
✅ eventActions.js - Auth required, creator checks
✅ flagActions.js - Anyone can report, only admin can view
✅ announcementActions.js - Club owner/admin only
✅ membershipApplicationActions.js - Owner/admin to approve
✅ clubCharterActions.js - Initiator/admin controls

## Future Enhancements

Consider adding:
- Rate limiting per user/endpoint
- Audit logging for sensitive operations
- IP whitelisting for admin operations
- Two-factor authentication for admins
- Request signing for API security
