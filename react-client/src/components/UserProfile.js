import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const UserProfile = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCategory: '',
    memberSince: '',
    lastOrder: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    if (!isAdmin) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user, navigate, isAdmin]);

  const loadUserData = () => {
    const demoOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        date: '2024-01-15',
        total: 299.98,
        status: 'Delivered',
        items: [
          { name: 'iPod Touch 7th Gen', quantity: 1, price: 199.99, category: 'ipod' },
          { name: 'AirPods Pro Case', quantity: 1, price: 99.99, category: 'accessories' }
        ]
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        date: '2024-01-10',
        total: 149.99,
        status: 'Processing',
        items: [
          { name: 'iPod Shuffle', quantity: 1, price: 149.99, category: 'ipod' }
        ]
      }
    ];
    
    setTimeout(() => {
      setOrders(demoOrders);
      
      const totalOrders = demoOrders.length;
      const totalSpent = demoOrders.reduce((sum, order) => sum + order.total, 0);
      
      const categoryCount = {};
      demoOrders.forEach(order => {
        order.items.forEach(item => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });
      });
      
      let favoriteCategory = 'None';
      if (Object.keys(categoryCount).length > 0) {
        favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
          categoryCount[a] > categoryCount[b] ? a : b
        );
      }
      
      const categoryNames = {
        'ipod': 'iPods',
        'headphones': 'Headphones',
        'accessories': 'Accessories'
      };
      
      const lastOrder = demoOrders.length > 0 
        ? new Date(demoOrders[0].date).toLocaleDateString()
        : 'No orders yet';
      
      setUserStats({
        totalOrders,
        totalSpent,
        favoriteCategory: categoryNames[favoriteCategory] || favoriteCategory,
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently',
        lastOrder
      });
      
      setLoading(false);
    }, 500);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        { name: formData.name, email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Password change failed. Please check your current password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Delivered': 'bg-success',
      'Processing': 'bg-warning',
      'Shipped': 'bg-info',
      'Cancelled': 'bg-danger',
      'Pending': 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  };

  const getOrderStatusCounts = () => {
    const counts = {};
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return Object.entries(counts);
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-3">
          <div className="card mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="avatar-circle bg-primary text-white d-inline-flex align-items-center justify-content-center rounded-circle" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <h5 className="card-title">{user.name || 'User'}</h5>
              <p className="text-muted">{user.email}</p>
              <div className={`badge ${isAdmin ? 'bg-danger' : 'bg-success'}`}>
                {isAdmin ? 'Administrator' : 'Premium Customer'}
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  Member since: {userStats.memberSince}
                </small>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Quick Actions</h6>
              <div className="list-group list-group-flush">
                {isAdmin ? (
                  <>
                    <Link to="/admin" className="list-group-item list-group-item-action text-warning">
                      <i className="bi bi-shield-lock me-2"></i>Admin Panel
                    </Link>
                    <button 
                      className="list-group-item list-group-item-action text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <i className="bi bi-person me-2"></i>Profile Settings
                    </button>
                    <button 
                      className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                      onClick={() => setActiveTab('orders')}
                    >
                      <i className="bi bi-bag me-2"></i>My Orders ({userStats.totalOrders})
                    </button>
                    <button 
                      className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                      onClick={() => setActiveTab('password')}
                    >
                      <i className="bi bi-key me-2"></i>Change Password
                    </button>
                    <button 
                      className={`list-group-item list-group-item-action ${activeTab === 'stats' ? 'active' : ''}`}
                      onClick={() => setActiveTab('stats')}
                    >
                      <i className="bi bi-graph-up me-2"></i>My Statistics
                    </button>
                    <Link to="/cart" className="list-group-item list-group-item-action">
                      <i className="bi bi-cart me-2"></i>Shopping Cart
                    </Link>
                    <button 
                      className="list-group-item list-group-item-action text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          {isAdmin ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-shield-lock display-1 text-warning mb-4"></i>
                <h3 className="mb-3">Administrator Account</h3>
                <p className="text-muted mb-4">
                  You have administrator privileges. Use the Admin Panel to manage store products.
                </p>
                
                <div className="row mb-4 justify-content-center">
                  <div className="col-md-8">
                    <div className="card border-warning">
                      <div className="card-body">
                        <h5 className="card-title text-warning">
                          <i className="bi bi-box-seam me-2"></i>
                          Product Management
                        </h5>
                        <p className="card-text">Add, edit, or remove products from the store.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5>Quick Information</h5>
                  <div className="row justify-content-center">
                    <div className="col-md-6">
                      <div className="text-start">
                        <p className="mb-2">
                          <strong>Name:</strong> {user.name || 'Not set'}
                        </p>
                        <p className="mb-2">
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p className="mb-2">
                          <strong>Role:</strong> <span className="badge bg-danger">Administrator</span>
                        </p>
                        <p className="mb-0">
                          <strong>Member since:</strong> {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-center gap-3">
                  <Link to="/admin" className="btn btn-warning btn-lg">
                    <i className="bi bi-shield-lock me-2"></i>
                    Go to Admin Panel
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                {message.text && (
                  <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                    {message.text}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div>
                    <h4 className="mb-4">Profile Settings</h4>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email Address</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Account Type</label>
                        <div>
                          <span className="badge bg-success me-2">
                            Regular User
                          </span>
                          <small className="text-muted">
                            You can browse and purchase products
                          </small>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Profile'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'password' && (
                  <div>
                    <h4 className="mb-4">Change Password</h4>
                    <form onSubmit={handlePasswordChange}>
                      <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <div className="input-group">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            className="form-control"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            required
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            <i className={`bi ${showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <div className="input-group">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className="form-control"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                        <small className="text-muted">Minimum 6 characters</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <div className="input-group">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-warning"
                        disabled={loading}
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4>My Orders ({userStats.totalOrders})</h4>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={loadUserData}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-clockwise"></i> Refresh
                      </button>
                    </div>

                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-bag-x display-1 text-muted"></i>
                        <h5 className="mt-3">No Orders Yet</h5>
                        <p className="text-muted">You haven't placed any orders yet.</p>
                        <Link to="/" className="btn btn-primary">Start Shopping</Link>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Order #</th>
                              <th>Date</th>
                              <th>Items</th>
                              <th>Total</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map(order => (
                              <tr key={order.id} className={`order-card ${order.status}`}>
                                <td>
                                  <strong>{order.orderNumber}</strong>
                                </td>
                                <td>{formatDate(order.date)}</td>
                                <td>
                                  <small>
                                    {order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}
                                  </small>
                                </td>
                                <td>
                                  <strong>${order.total.toFixed(2)}</strong>
                                </td>
                                <td>
                                  <span className={`badge ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div>
                    <h4 className="mb-4">My Shopping Statistics</h4>
                    
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card text-white bg-primary mb-3">
                          <div className="card-body">
                            <h5 className="card-title">Total Orders</h5>
                            <h2 className="display-4">{userStats.totalOrders}</h2>
                            <p className="card-text">Orders placed</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card text-white bg-success mb-3">
                          <div className="card-body">
                            <h5 className="card-title">Total Spent</h5>
                            <h2 className="display-4">${userStats.totalSpent.toFixed(2)}</h2>
                            <p className="card-text">All-time spending</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="card mb-3">
                          <div className="card-body">
                            <h6 className="card-title">Favorite Category</h6>
                            <div className="d-flex align-items-center mt-3">
                              <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                   style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-tag"></i>
                              </div>
                              <div>
                                <h4 className="mb-0">{userStats.favoriteCategory}</h4>
                                <small className="text-muted">Most purchased category</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card mb-3">
                          <div className="card-body">
                            <h6 className="card-title">Last Order</h6>
                            <div className="d-flex align-items-center mt-3">
                              <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                   style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-calendar-check"></i>
                              </div>
                              <div>
                                <h4 className="mb-0">{userStats.lastOrder}</h4>
                                <small className="text-muted">Date of last purchase</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Order Status Distribution</h6>
                        <div className="mt-3">
                          {getOrderStatusCounts().map(([status, count]) => (
                            <div key={status} className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>{status}</span>
                                <span>{count} orders</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className={`progress-bar ${getStatusBadge(status)}`}
                                  style={{ width: `${(count / orders.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6>Recent Activity</h6>
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <i className="bi bi-bag-check text-success me-2"></i>
                            <span>Order #{orders[0]?.orderNumber || 'ORD-2024-001'} placed</span>
                          </div>
                          <small className="text-muted">Today</small>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <i className="bi bi-person text-primary me-2"></i>
                            <span>Profile updated</span>
                          </div>
                          <small className="text-muted">2 days ago</small>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <i className="bi bi-star text-warning me-2"></i>
                            <span>Left a product review</span>
                          </div>
                          <small className="text-muted">1 week ago</small>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Account Security</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        <i className="bi bi-shield-check text-success fs-4"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">Account Security</h6>
                        <small className="text-muted">Your account is secured with password protection</small>
                      </div>
                      <div className="ms-auto">
                        <span className="badge bg-success">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        <i className="bi bi-envelope text-primary fs-4"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">Email Verified</h6>
                        <small className="text-muted">Your email address is confirmed</small>
                      </div>
                      <div className="ms-auto">
                        <span className="badge bg-success">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;