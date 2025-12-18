import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ cart, removeFromCart, updateQuantity, total, user }) => {
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="card py-5">
            <i className="bi bi-cart-x display-1 text-muted"></i>
            <h3 className="mt-3">Your cart is empty</h3>
            <p className="text-muted">Add some products to your cart!</p>
            <Link to="/" className="btn btn-primary mt-3">
              Continue Shopping
            </Link>
            {!user && (
              <div className="mt-3">
                <p className="text-muted">Want to save your cart?</p>
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  Login to save cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      if (window.confirm('You need to login to checkout. Go to login page?')) {
        navigate('/login');
      }
      return;
    }
    
    // В реальном приложении здесь был бы процесс оформления заказа
    alert(`Order placed successfully! Total: $${total.toFixed(2)}`);
    // Очищаем корзину
    cart.forEach(item => removeFromCart(item.id));
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Shopping Cart</h1>
      
      {user && (
        <div className="alert alert-info mb-4">
          <i className="bi bi-person-check me-2"></i>
          Shopping as: <strong>{user.name || user.email}</strong>
          {user.role === 'admin' && (
            <span className="badge bg-danger ms-2">Admin</span>
          )}
        </div>
      )}
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              {cart.map(item => (
                <div key={item.id} className="cart-item d-flex align-items-center mb-4 pb-4 border-bottom">
                  <div className="flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                      className="border rounded"
                    />
                  </div>
                  
                  <div className="flex-grow-1 ms-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-1">{item.title}</h5>
                        <p className="text-muted mb-2">{item.category}</p>
                        <span className="text-primary h5">${item.price}</span>
                      </div>
                      
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    
                    <div className="d-flex align-items-center mt-3">
                      <div className="input-group" style={{ width: '150px' }}>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input 
                          type="text" 
                          className="form-control text-center"
                          value={item.quantity}
                          readOnly
                        />
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="ms-4">
                        <strong>Total: ${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="d-flex justify-content-between mt-3">
                <Link to="/" className="btn btn-outline-primary">
                  ← Continue Shopping
                </Link>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    if (window.confirm('Clear all items from cart?')) {
                      cart.forEach(item => removeFromCart(item.id));
                    }
                  }}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className={total > 100 ? 'text-success' : ''}>
                  {total > 100 ? 'FREE' : '$9.99'}
                </span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong className="h5">
                  ${(total + (total > 100 ? 0 : 9.99) + (total * 0.08)).toFixed(2)}
                </strong>
              </div>
              
              <button 
                className="btn btn-primary btn-lg w-100 mb-3"
                onClick={handleCheckout}
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>
              
              {!user && (
                <div className="alert alert-warning">
                  <small>
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Please login to save your cart and checkout
                  </small>
                </div>
              )}
              
              <div className="text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-2"></i>
                  Secure checkout · 30-day returns
                </small>
              </div>
            </div>
          </div>
          
          {user && (
            <div className="card mt-4">
              <div className="card-body">
                <h6 className="card-title">Customer Info</h6>
                <div className="mb-2">
                  <small className="text-muted">Email:</small>
                  <div>{user.email}</div>
                </div>
                {user.name && (
                  <div className="mb-2">
                    <small className="text-muted">Name:</small>
                    <div>{user.name}</div>
                  </div>
                )}
                <Link to="/profile" className="btn btn-outline-secondary btn-sm w-100">
                  Update Shipping Info
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;