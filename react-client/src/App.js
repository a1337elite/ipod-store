import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Компоненты
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AdminPanel from './components/Admin/AdminPanel';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserProfile from './components/UserProfile';

// Компонент-обертка для защищенных маршрутов
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // Проверяем токен
      axios.post(`${API_URL}/auth/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (response.data.valid) {
          setUser(response.data.user);
        } else {
          // Токен невалиден, очищаем localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
    
    fetchProducts();
  }, []);

  // Загрузка продуктов
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      
      // Получаем категории
      const categoriesResponse = await axios.get(`${API_URL}/categories`);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Добавление в корзину
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
    alert(`${product.title} added to cart!`);
  };

  // Удаление из корзины
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Обновление количества
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

  // Общая стоимость корзины
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Выход из системы
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCart([]); // Очищаем корзину при выходе
  };

  return (
    <Router>
      <div className="App">
        <Header 
          cartCount={cart.length} 
          cartTotal={cartTotal}
          user={user}
          onLogout={handleLogout}
        />
        
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={
            <div className="container mt-4">
              <div className="text-center mb-5">
                <h1 className="display-4">Welcome to iPod & Headphones Store</h1>
                <p className="lead">Discover the best selection of iPods and premium headphones</p>
                {!user && (
                  <div className="mt-3">
                    <a href="/login" className="btn btn-primary me-2">Login</a>
                    <a href="/register" className="btn btn-outline-primary">Register</a>
                  </div>
                )}
                {user && (
                  <div className="mt-3">
                    <span className="badge bg-success me-2">
                      Welcome back, {user.name || user.email}!
                    </span>
                    {/* УБРАЛИ "Go to Profile" кнопку */}
                  </div>
                )}
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
                            <a 
                              href={`/category/${category.id}`}
                              className="text-decoration-none"
                            >
                              {category.name} ({category.count})
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-9">
                  {loading ? (
                    <div className="text-center py-5">
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
            </div>
          } />
          
          <Route path="/product/:id" element={
            <div className="container mt-4">
              <ProductDetail addToCart={addToCart} />
            </div>
          } />
          
          <Route path="/category/:category" element={
            <div className="container mt-4">
              <ProductList addToCart={addToCart} />
            </div>
          } />
          
          <Route path="/cart" element={
            <div className="container mt-4">
              <Cart 
                cart={cart} 
                removeFromCart={removeFromCart} 
                updateQuantity={updateQuantity} 
                total={cartTotal}
                user={user}
              />
            </div>
          } />
          
          {/* Маршруты аутентификации */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile user={user} setUser={setUser} />
            </ProtectedRoute>
          } />
          
          {/* Админ маршруты */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <div className="container mt-4">
                <AdminPanel fetchProducts={fetchProducts} user={user} />
              </div>
            </ProtectedRoute>
          } />
        </Routes>

        <footer className="bg-dark text-white mt-5 py-4">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h5>iPod & Headphones Store</h5>
                <p>Your one-stop shop for all Apple audio products and premium headphones.</p>
              </div>
              <div className="col-md-6 text-md-end">
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