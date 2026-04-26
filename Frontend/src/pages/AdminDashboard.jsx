import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [passwordError, setPasswordError] = useState('');

  // Admin password for access (in production, use proper authentication)
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
      setShowPasswordPrompt(false);
      setIsAdmin(true);
      fetchUsers();
    }
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (adminPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      setShowPasswordPrompt(false);
      setIsAdmin(true);
      setAdminPassword('');
      fetchUsers();
    } else {
      setPasswordError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out from admin panel?')) {
      sessionStorage.removeItem('adminAuthenticated');
      navigate('/');
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to load users. Using demo data.');
      console.error(err);
      // Set mock data for demo
      setUsers([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [users, searchTerm, sortBy]);

  const applyFiltersAndSort = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone.includes(searchTerm)
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'username') {
      filtered.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === 'most-active') {
      filtered.sort((a, b) => (b.mealsDonated + b.mealsClaimed) - (a.mealsDonated + a.mealsClaimed));
    }

    setFilteredUsers(filtered);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== deleteUserId));
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
      alert('User deleted successfully');
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const maskPassword = (password) => {
    if (!password) return 'N/A';
    return password.substring(0, 10) + '...' + password.substring(password.length - 5);
  };

  const exportUserData = () => {
    const csvContent = [
      ['Username', 'Email', 'Phone', 'Created At', 'Last Login', 'Status', 'Meals Donated', 'Meals Claimed'],
      ...filteredUsers.map(user => [
        user.username,
        user.email,
        user.phone,
        user.createdAt,
        user.lastLogin,
        user.status,
        user.mealsDonated,
        user.mealsClaimed,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (showPasswordPrompt) {
    return (
      <div className="page">
        <header>
          <h1>Food Share - Admin Panel</h1>
        </header>
        <main>
          <div className="admin-login-container">
            <div className="login-card">
              <h2>Admin Access Required</h2>
              <p>Enter admin password to access the admin dashboard</p>

              {passwordError && <div className="error-message">{passwordError}</div>}

              <form onSubmit={handleAdminLogin} className="admin-login-form">
                <div className="form-group">
                  <label htmlFor="adminPassword">Admin Password</label>
                  <input
                    type="password"
                    id="adminPassword"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn-login">
                  Access Admin Panel
                </button>
              </form>

              <div className="login-footer">
                <Link to="/dashboard" className="back-link">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <header>
        <h1>Food Share - Admin Dashboard</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </header>

      <main>
        <section className="admin-container">
          <div className="admin-header">
            <h2>User Management</h2>
            <p>Manage and monitor all registered users</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{users.filter(u => u.status === 'active').length}</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-card">
              <h3>{users.reduce((sum, u) => sum + u.mealsDonated, 0)}</h3>
              <p>Total Meals Donated</p>
            </div>
            <div className="stat-card">
              <h3>{users.reduce((sum, u) => sum + u.mealsClaimed, 0)}</h3>
              <p>Total Meals Claimed</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="controls-section">
            <div className="search-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search by username, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="controls-group">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="username">Username A-Z</option>
                <option value="most-active">Most Active</option>
              </select>

              <button className="btn-export" onClick={exportUserData}>
                📊 Export to CSV
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
              <button onClick={fetchUsers} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <div className="loading">Loading users...</div>}

          {/* Users Table */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Donations</th>
                    <th>Claims</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="username-cell">{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="center">{user.mealsDonated}</td>
                      <td className="center">{user.mealsClaimed}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(user)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteClick(user.id)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredUsers.length === 0 && (
            <div className="empty-state">
              <p>No users found matching your search criteria.</p>
              <button onClick={() => setSearchTerm('')} className="reset-btn">
                Clear Search
              </button>
            </div>
          )}
        </section>
      </main>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details - {selectedUser.username}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Username:</label>
                  <span>{selectedUser.username}</span>
                </div>

                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>

                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedUser.phone}</span>
                </div>

                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedUser.status}`}>
                    {selectedUser.status}
                  </span>
                </div>

                <div className="detail-item">
                  <label>Encrypted Password:</label>
                  <code className="password-hash">{maskPassword(selectedUser.password)}</code>
                </div>

                <div className="detail-item">
                  <label>Account Created:</label>
                  <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>

                <div className="detail-item">
                  <label>Last Login:</label>
                  <span>{new Date(selectedUser.lastLogin).toLocaleString()}</span>
                </div>

                <div className="detail-item">
                  <label>Meals Donated:</label>
                  <span>{selectedUser.mealsDonated}</span>
                </div>

                <div className="detail-item">
                  <label>Meals Claimed:</label>
                  <span>{selectedUser.mealsClaimed}</span>
                </div>

                <div className="detail-item">
                  <label>Total Activity:</label>
                  <span>{selectedUser.mealsDonated + selectedUser.mealsClaimed} actions</span>
                </div>
              </div>

              <div className="password-info">
                <p>
                  <strong>Note:</strong> Passwords are encrypted using bcryptjs with 10 salt rounds.
                  The shown hash is truncated for security purposes.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete this user?</p>
              <p className="warning">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-confirm" onClick={handleConfirmDelete}>
                Delete User
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
