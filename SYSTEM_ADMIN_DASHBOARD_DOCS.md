# SystemAdmin Dashboard Documentation

## Overview
The SystemAdmin Dashboard is a comprehensive management interface that allows System Administrators to:
- ✅ Create new college and system admin accounts
- ✅ Deactivate/activate any account
- ✅ Initiate one-time password (OTP) resets for users
- ✅ View all users and admins with detailed statistics
- ✅ Manage account security and access controls

## Features

### 1. **Admin Management**
**Location:** `/system-admin/manage-admins`

#### Create New Admin
- **Form Fields:**
  - First Name (required)
  - Last Name (required)
  - Email (required, must be unique)
  - Password (required, auto-hashed)
  - Admin Type (CollegeAdmin or SystemAdmin)

- **Admin Types:**
  - **CollegeAdmin:** Can manage clubs, events, and charters
  - **SystemAdmin:** Full system access, cannot be deactivated

#### Manage Admins
- View all admin accounts with status
- Filter by: All, Active, Inactive
- **Actions Available:**
  - 🔑 **Reset Password:** Initiate a password reset
  - 🚫 **Deactivate:** Disable an admin account (CollegeAdmins only)
  - ✓ **Activate:** Re-enable a deactivated account

### 2. **User Management**
**Location:** `/system-admin/manage-users`

#### View All Users
- Display all users on the platform
- Filter by role: Students, Admins, Club Owners
- View user statistics:
  - Total Users
  - Student count
  - Admin count
  - Club Owner count

#### User Information Displayed
- Name (First & Last)
- Email
- Role (Student, Admin, ClubOwner)
- Join date
- Reset password option

### 3. **Account Security**
**Location:** `/system-admin/account-security`

#### Account Status Management
- View all admin accounts with current status
- Quick stats on active vs. deactivated accounts
- Filter accounts by status

#### Password Reset Process
1. Click "🔑 Reset Pass" on any user
2. System generates a one-time password (OTP)
3. OTP displayed to system admin
4. User enters OTP + new password to complete reset
5. OTP valid for 15 minutes

#### Account Deactivation/Activation
- Deactivate accounts: Prevents login, keeps account data
- Activate accounts: Restores access to suspended accounts
- SystemAdmin accounts protected - cannot be deactivated

## API Endpoints

### Admin Management APIs
```
GET  /api/system-admin/admins
     - Get all admin accounts (requires SystemAdmin auth)

POST /api/system-admin/admins/create
     - Create new admin account
     - Body: { firstName, lastName, email, password, adminType? }

POST /api/system-admin/account-management
     - Manage account status
     - Body: { action: "deactivate"|"activate"|"reset-password", userId }
```

### User Management APIs
```
GET  /api/system-admin/users
     - Get all users (requires SystemAdmin auth)
```

### Password Reset APIs
```
POST /api/users/password-reset/initiate
     - Generate OTP for password reset
     - Body: { userId }

POST /api/users/password-reset/reset
     - Reset password using OTP
     - Body: { userId, otp, newPassword }
```

## Database Schema Updates

### User Model - New Fields
```javascript
{
  resetToken: String,          // For future token-based resets
  resetTokenExpiry: Date,      // Token expiration time
  otp: String,                 // Current OTP
  otpExpiry: Date              // OTP expiration (15 minutes)
}
```

### Admin Schema (Discriminator)
```javascript
{
  adminType: "SystemAdmin" | "CollegeAdmin",
  isActive: Boolean,           // Account active status
  pastActions: [String]        // Audit trail of admin actions
}
```

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- All system admin routes require verification
- SystemAdmin role verified on every request
- Middleware: `verifySystemAdmin()`, `verifyAdmin()`

### Password Security
- Passwords hashed with bcryptjs (salt rounds: 10)
- OTP-based password resets
- OTPs expire after 15 minutes
- One-time use only

### Account Protection
- SystemAdmin accounts cannot be deactivated
- Deactivated accounts cannot login
- Account status tracked in database

## Components

### SystemAdmin Components (`/app/components/SystemAdmin/`)

1. **CreateAdminForm.js**
   - Form for creating new admin accounts
   - Validation of required fields
   - Admin type selection
   - Success/error messaging

2. **AdminList.js**
   - Display all admins with management options
   - Filter by status
   - Deactivate/activate controls
   - Password reset trigger

3. **UserList.js**
   - Display all platform users
   - Filter by role
   - User statistics
   - Password reset for any user

4. **PasswordResetModal.js**
   - OTP generation and display
   - OTP entry form
   - New password entry
   - Confirmation step
   - Success notification

## Usage Workflow

### Creating a New College Admin
1. Go to `/dashboard/system-admin/manage-admins`
2. Click "+ Create Admin"
3. Fill in required information
4. Select "CollegeAdmin" from dropdown
5. Click "Create Admin"
6. Confirm as on the success message

### Resetting a User's Password
1. Navigate to account management page
2. Find the user account
3. Click "🔑 Reset Pass"
4. Modal displays generated OTP
5. Share OTP with the user (via email in production)
6. User enters OTP and new password to complete reset

### Deactivating an Account
1. Go to `/dashboard/system-admin/account-security`
2. Find the account to deactivate
3. Click "🚫 Deactivate"
4. Confirm the action
5. Account will be marked as inactive
6. User cannot login until reactivated

### Reactivating a Deactivated Account
1. Go to `/dashboard/system-admin/account-security`
2. Filter by "Deactivated"
3. Click "✓ Activate" on the desired account
4. Account becomes active again
5. User can login with existing credentials

## Production Considerations

### 1. Email Integration Needed
Current implementation displays OTP on screen. In production:
```javascript
// Send OTP via email service (not implemented)
// Example: SendGrid, AWS SES, etc.
await emailService.sendPasswordResetOTP(user.email, otp);
```

### 2. Audit Logging
Implement audit trail for admin actions:
- Track who made changes
- Log timestamps
- Record what was changed
- Store in database

### 3. Rate Limiting
Add rate limiting to prevent:
- Brute force password reset attempts
- Excessive admin creation
- Account manipulation attacks

### 4. Two-Factor Authentication (2FA)
Consider implementing:
- TOTP (Time-based One-Time Password)
- SMS-based 2FA for SystemAdmins
- Backup codes for account recovery

### 5. Session Management
Current implementation:
- JWT tokens with 1-hour expiration
- HttpOnly cookies for security
- Cookies invalidated on logout

## Troubleshooting

### "Unauthorized access" error
- Verify you're logged in as SystemAdmin
- Check JWT token hasn't expired
- Confirm user role is "Admin" and adminType is "SystemAdmin"

### OTP not working
- Verify OTP hasn't expired (15-minute window)
- Check OTP is entered correctly
- Ensure new password meets requirements (min 6 chars)

### Can't deactivate account
- SystemAdmin accounts cannot be deactivated
- Only Admin role accounts have deactivate option
- Verify you have SystemAdmin privileges

### Password reset not visible
- Check if there's internet connectivity
- Verify API routes are accessible
- Check browser console for errors

## File Structure

```
app/
├── api/
│   ├── system-admin/
│   │   ├── admins/
│   │   │   ├── route.js (GET all admins)
│   │   │   └── create/route.js (POST create admin)
│   │   ├── account-management/route.js (POST deactivate/activate/reset)
│   │   └── users/route.js (GET all users)
│   └── users/
│       └── password-reset/
│           ├── initiate/route.js (POST generate OTP)
│           └── reset/route.js (POST verify OTP & reset password)
├── components/
│   └── SystemAdmin/
│       ├── CreateAdminForm.js
│       ├── AdminList.js
│       ├── UserList.js
│       └── PasswordResetModal.js
└── dashboard/
    └── system-admin/
        ├── page.js (Main dashboard)
        ├── manage-admins/page.js
        ├── manage-users/page.js
        └── account-security/page.js
lib/
└── authMiddleware.js (verifySystemAdmin, verifyAdmin)
models/
└── User.js (Updated with OTP/reset fields)
services/
└── userService.js (Updated with password reset functions)
```

## Next Steps

1. **Test all features** in development environment
2. **Integrate email service** for OTP delivery
3. **Add audit logging** for all admin actions
4. **Implement rate limiting** for security
5. **Deploy to production** with additional security measures
6. **Monitor usage** and collect feedback
7. **Consider 2FA implementation** for enhanced security

## Support

For issues or questions about the SystemAdmin Dashboard:
1. Check this documentation
2. Review the code comments in component files
3. Check browser console for error messages
4. Verify all environment variables are set correctly

---

**Version:** 1.0
**Last Updated:** April 2026
**Maintained by:** Development Team
