import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const API_URL = 'http://localhost:5000/api';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      
      const categoriesResponse = await axios.get(`${API_URL}/categories`);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <Router>
      <div className="App">
        <Header cartCount={cart.length} cartTotal={cartTotal} />
        
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={
              <>
                <div className="text-center mb-5">
                  <h1 className="display-4">Welcome to iPod & Headphones Store</h1>
                  <p className="lead">Discover the best selection of iPods and premium headphones</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={fetchProducts}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Refresh Products'}
                  </button>
                </div>

                <div className="row">
                  <div className="col-md-3">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5>Categories</h5>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled">
                          {categories.map(category => (
                            <li key={category.id} className="mb-2">
                              <Link 
                                to={`/category/${category.id}`}
                                className="text-decoration-none"
                              >
                                {category.name} ({category.count})
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-9">
                    {loading ? (
                      <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <ProductList 
                        products={products} 
                        addToCart={addToCart} 
                      />
                    )}
                  </div>
                </div>
              </>
            } />
            
            <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
            <Route path="/category/:category" element={<ProductList addToCart={addToCart} />} />
            <Route path="/cart" element={
              <Cart 
                cart={cart} 
                removeFromCart={removeFromCart} 
                updateQuantity={updateQuantity} 
                total={cartTotal}
              />
            } />
            <Route path="/admin" element={<AdminPanel fetchProducts={fetchProducts} />} />
          </Routes>
        </div>

        <footer className="bg-dark text-white mt-5 py-4">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h5>iPod & Headphones Store</h5>
                <p>Your one-stop shop for all Apple audio products and premium headphones.</p>
              </div>
              <div className="col-md-6 text-end">
                <p>© 2024 iPod & Headphones Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;