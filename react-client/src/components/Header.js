import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ cartCount, cartTotal }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
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
            <li className="nav-item">
              <Link className="nav-link" to="/admin">Admin Panel</Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            <Link to="/cart" className="btn btn-outline-primary position-relative me-3">
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
              <span className="ms-2">Cart</span>
            </Link>
            {cartTotal > 0 && (
              <span className="text-success fw-bold">${cartTotal.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;