# Admin Dashboard Documentation

## Overview
The Admin Dashboard is a secure administration panel for Food Share application administrators to manage users, view their information, and monitor application statistics.

## Access Instructions

### 1. **Accessing the Admin Dashboard**
- Navigate to: `http://localhost:5173/admin` (Frontend URL)
- Or click the admin link from any page (once implemented)

### 2. **Admin Authentication**
- You will be prompted to enter an admin password
- **Default Admin Password**: `admin123`
- ⚠️ **IMPORTANT**: In production, change this to a secure password and implement proper JWT authentication

### 3. **Session Management**
- Admin authentication is stored in browser's sessionStorage
- Logging out will clear the session
- Session persists during the browser session

## Dashboard Features

### **Login Screen**
- Password-protected access
- Error messages for incorrect passwords
- Back to Dashboard link
- Professional UI with security theme

### **User Management**

#### **Statistics Cards**
Displays real-time metrics:
- Total Users
- Active Users
- Total Meals Donated
- Total Meals Claimed

#### **Search Functionality**
Search users by:
- Username
- Email address
- Phone number
- Real-time search results

#### **Sort Options**
- **Newest First**: Recently registered users
- **Oldest First**: Early registered users
- **Username A-Z**: Alphabetical order
- **Most Active**: Users with most donations/claims

#### **User Table**
Displays all users with columns:
| Column | Description |
|--------|-------------|
| Username | User's login name |
| Email | User's email address |
| Phone | User's contact number |
| Status | Active/Inactive status |
| Donations | Number of meals donated |
| Claims | Number of meals claimed |
| Created | Registration date |
| Actions | View/Delete buttons |

#### **User Actions**
- **View Details (👁️)**: Opens modal with complete user information
- **Delete (🗑️)**: Deletes user account (with confirmation)

### **User Details Modal**

Shows comprehensive user information:
```
Username: johndoe
Email: john@example.com
Phone: +1-555-0101
Status: Active
Encrypted Password: $2a$10$N9qo8u...IIfxWu4 (truncated)
Account Created: Apr 20, 2026 10:30 AM
Last Login: Apr 25, 2026 3:45 PM
Meals Donated: 12
Meals Claimed: 5
Total Activity: 17 actions
```

#### **Password Security Note**
- Passwords are encrypted using bcryptjs with 10 salt rounds
- The displayed hash is truncated for security
- Full password hash is stored in database
- Cannot be decrypted (one-way encryption)

### **Export to CSV**
- Export user data in CSV format
- Includes: Username, Email, Phone, Status, Donations, Claims, Created Date, Last Login
- File name: `users_YYYY-MM-DD.csv`
- Opens file download dialog

## User Information Structure

### **User Data Fields**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoM.eDwCvxNeq3/tHt6IIfxWu4KoUuAydil.",
  "phone": "+1-555-0101",
  "createdAt": "2026-04-20",
  "lastLogin": "2026-04-25",
  "status": "active",
  "mealsDonated": 12,
  "mealsClaimed": 5
}
```

### **Status Values**
- **active**: User can access the platform
- **inactive**: User account is inactive
- **suspended** (future): Account restricted

## Backend API Endpoints

### **User Management Endpoints**

#### `GET /api/admin/users`
- **Description**: Retrieve all users
- **Auth**: Admin authentication required
- **Response**:
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "password": "...",
      "phone": "+1-555-0101",
      ...
    }
  ]
}
```

#### `GET /api/admin/users/:userId`
- **Description**: Get specific user details
- **Auth**: Admin authentication required
- **Parameters**: `userId` (integer)
- **Response**: Single user object

#### `DELETE /api/admin/users/:userId`
- **Description**: Delete a user
- **Auth**: Admin authentication required
- **Parameters**: `userId` (integer)
- **Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### `PUT /api/admin/users/:userId/status`
- **Description**: Update user status
- **Auth**: Admin authentication required
- **Body**: `{ "status": "active|inactive|suspended" }`
- **Response**:
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

#### `GET /api/admin/stats`
- **Description**: Get dashboard statistics
- **Auth**: Admin authentication required
- **Response**:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 5,
    "activeUsers": 4,
    "totalDonations": 60,
    ...
  }
}
```

#### `POST /api/admin/export-users`
- **Description**: Export users as CSV
- **Auth**: Admin authentication required
- **Response**: CSV file download

## Security Features

### **Current Implementation**
✅ Password-protected access page
✅ Session-based authentication
✅ Encrypted password display (truncated)
✅ Confirmation dialogs for destructive actions
✅ CORS protection
✅ Error handling

### **Production Recommendations**

#### **1. Authentication**
```javascript
// Replace simple password with JWT tokens
// Example:
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Not admin' });
    }
  } catch (err) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
```

#### **2. Password Security**
- Store admin password hash in database
- Use environment variables for secrets
- Implement rate limiting on login attempts
- Add 2FA (Two-Factor Authentication)

#### **3. Audit Logging**
```javascript
// Log all admin actions
const adminLog = {
  adminId: adminUser.id,
  action: 'DELETE_USER',
  targetUserId: userId,
  timestamp: new Date(),
  ipAddress: req.ip,
  result: 'success'
};
// Save to database
```

#### **4. RBAC (Role-Based Access Control)**
```javascript
const roles = {
  SUPER_ADMIN: ['read', 'write', 'delete', 'export'],
  ADMIN: ['read', 'write', 'delete'],
  MODERATOR: ['read', 'write'],
  VIEWER: ['read']
};
```

## Demo Data

The system includes 5 demo users for testing:

| Username | Email | Status | Donations | Claims |
|----------|-------|--------|-----------|--------|
| johndoe | john@example.com | Active | 12 | 5 |
| sarahsmith | sarah@example.com | Active | 8 | 3 |
| mikebrown | mike@example.com | Active | 15 | 8 |
| emmajones | emma@example.com | Inactive | 5 | 2 |
| davidlee | david@example.com | Active | 20 | 12 |

## Troubleshooting

### **"Invalid admin password" error**
- Verify you entered the correct password
- Default: `admin123`
- Check for caps lock

### **Users not loading**
- Ensure backend server is running
- Check network connectivity
- Click "Retry" button

### **Cannot delete user**
- Confirm deletion in popup
- User must exist in system
- Check admin permissions

### **CSV export not working**
- Check browser's download settings
- Ensure popup blockers are disabled
- Try different browser

## Future Enhancements

1. **Advanced Filters**
   - Filter by registration date range
   - Filter by activity level
   - Filter by status

2. **User Management**
   - Edit user information
   - Reset user passwords
   - Assign admin roles

3. **Analytics**
   - Detailed charts and graphs
   - User growth trends
   - Activity heatmaps

4. **Actions**
   - Send notifications to users
   - Generate reports
   - Bulk operations (import/export)

5. **Monitoring**
   - Real-time user activity
   - System health checks
   - Performance metrics

## Support & Maintenance

- Regular security audits
- Monitor admin activity
- Update authentication methods
- Backup user data regularly
- Test disaster recovery procedures

## References

- [Admin Dashboard Route](/admin)
- Backend API: `/api/admin/*`
- Session Storage: `adminAuthenticated` flag
- Database Integration: Ready for MongoDB/PostgreSQL
