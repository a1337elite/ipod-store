import React from 'react';
import { Link } from 'react-router-dom';

const Cart = ({ cart, removeFromCart, updateQuantity, total }) => {
  if (cart.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="card py-5">
          <i className="bi bi-cart-x display-1 text-muted"></i>
          <h3 className="mt-3">Your cart is empty</h3>
          <p className="text-muted">Add some products to your cart!</p>
          <Link to="/" className="btn btn-primary mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1 className="mb-4">Shopping Cart</h1>
      
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
              
              <button className="btn btn-primary btn-lg w-100 mb-3">
                Proceed to Checkout
              </button>
              
              <div className="text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-2"></i>
                  Secure checkout · 30-day returns
                </small>
              </div>
            </div>
          </div>
          
          <div className="card mt-4">
            <div className="card-body">
              <h6 className="card-title">Promo Code</h6>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Enter code" />
                <button className="btn btn-outline-secondary">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;