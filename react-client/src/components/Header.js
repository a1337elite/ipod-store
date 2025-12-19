import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ cartCount, cartTotal, user, onLogout, theme, onToggleTheme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-headphones me-2 text-primary"></i>
          <span className="fw-bold">iPod & Headphones Store</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/category/ipod">iPods</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/category/headphones">Headphones</Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            {user ? (
              <div className="d-flex align-items-center me-3">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleProfileClick}
                  title="Go to Profile"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {user.name || user.email.split('@')[0]}
                  {user.role === 'admin' && (
                    <span className="badge bg-danger ms-2">Admin</span>
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-danger ms-2"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : (
              <div className="me-3">
                <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
            
            <Link to="/cart" className="btn btn-outline-primary position-relative">
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
              <span className="ms-2">Cart</span>
              {cartTotal > 0 && (
                <span className="ms-2 text-success fw-bold">${cartTotal.toFixed(2)}</span>
              )}
            </Link>

            <button
              type="button"
              className="btn btn-outline-secondary ms-2 theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;