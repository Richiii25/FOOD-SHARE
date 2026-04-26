import express from 'express';

const router = express.Router();

// Middleware to verify admin authentication (in production, use proper JWT)
const verifyAdmin = (req, res, next) => {
  // In production, verify JWT token and check admin role
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

/**
 * GET /api/admin/users
 * Retrieves all users (admin only)
 */
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    // In production, fetch from database
    // const users = await User.find().select('-password');

    const mockUsers = [
      {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoM.eDwCvxNeq3/tHt6IIfxWu4KoUuAydil.',
        phone: '+1-555-0101',
        createdAt: '2026-04-20',
        lastLogin: '2026-04-25',
        status: 'active',
        mealsDonated: 12,
        mealsClaimed: 5,
      },
      {
        id: 2,
        username: 'sarahsmith',
        email: 'sarah@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoM.eDwCvxNeq3/tHt6IIfxWu4KoUuAydil.',
        phone: '+1-555-0102',
        createdAt: '2026-04-18',
        lastLogin: '2026-04-24',
        status: 'active',
        mealsDonated: 8,
        mealsClaimed: 3,
      },
      {
        id: 3,
        username: 'mikebrown',
        email: 'mike@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoM.eDwCvxNeq3/tHt6IIfxWu4KoUuAydil.',
        phone: '+1-555-0103',
        createdAt: '2026-04-15',
        lastLogin: '2026-04-22',
        status: 'active',
        mealsDonated: 15,
        mealsClaimed: 8,
      },
      {
        id: 4,
        username: 'emmajones',
        email: 'emma@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoM.eDwCvxNeq3/tHt6IIfxWu4KoUuAydil.',
        phone: '+1-555-0104',
        createdAt: '2026-04-10',
        lastLogin: '2026-04-23',
        status: 'inactive',
        mealsDonated: 5,
        mealsClaimed: 2,
      },
      {
        id: 5,
        username: 'davidlee',
        email: 'david@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoM.eDwCvxNeq3/tHt6IIfxWu4KoUuAydil.',
        phone: '+1-555-0105',
        createdAt: '2026-03-25',
        lastLogin: '2026-04-21',
        status: 'active',
        mealsDonated: 20,
        mealsClaimed: 12,
      },
    ];

    res.json({
      success: true,
      users: mockUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

/**
 * GET /api/admin/users/:userId
 * Retrieves a specific user by ID (admin only)
 */
router.get('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // In production, fetch from database
    // const user = await User.findById(userId);

    // Mock data
    const mockUsers = {
      1: {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoM.eDwCvxNeq3/tHt6IIfxWu4KoUuAydil.',
        phone: '+1-555-0101',
        createdAt: '2026-04-20',
        lastLogin: '2026-04-25',
        status: 'active',
        mealsDonated: 12,
        mealsClaimed: 5,
      },
    };

    const user = mockUsers[userId];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Deletes a user by ID (admin only)
 */
router.delete('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // In production:
    // 1. Validate the user exists
    // 2. Delete the user from database
    // 3. Clean up related data (donations, claims, etc.)

    console.log(`User ${userId} would be deleted`);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/stats
 * Retrieves admin dashboard statistics
 */
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    // In production, calculate from database
    const stats = {
      totalUsers: 5,
      activeUsers: 4,
      inactiveUsers: 1,
      totalDonations: 60,
      totalClaims: 30,
      totalFoodWastePrevented: '45.5 kg',
      averageMealsDonatedPerUser: 12,
      averageMealsClaimedPerUser: 6,
      registrationsTrend: {
        week: 2,
        month: 8,
        allTime: 5,
      },
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * PUT /api/admin/users/:userId/status
 * Updates user status (active/inactive)
 */
router.put('/users/:userId/status', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // In production, update user status in database
    console.log(`User ${userId} status updated to ${status}`);

    res.json({
      success: true,
      message: 'User status updated successfully',
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
});

/**
 * POST /api/admin/export-users
 * Exports user data in CSV format
 */
router.post('/export-users', verifyAdmin, async (req, res) => {
  try {
    // In production, fetch from database and format as CSV
    const csvContent = `Username,Email,Phone,Status,Donations,Claims,Created,Last Login
johndoe,john@example.com,+1-555-0101,active,12,5,2026-04-20,2026-04-25
sarahsmith,sarah@example.com,+1-555-0102,active,8,3,2026-04-18,2026-04-24
mikebrown,mike@example.com,+1-555-0103,active,15,8,2026-04-15,2026-04-22
emmajones,emma@example.com,+1-555-0104,inactive,5,2,2026-04-10,2026-04-23
davidlee,david@example.com,+1-555-0105,active,20,12,2026-03-25,2026-04-21`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
    });
  }
});

export default router;
