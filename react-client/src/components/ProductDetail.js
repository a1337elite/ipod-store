import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Product not found');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.title} added to cart!`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button className="btn btn-link" onClick={() => navigate('/')}>
          Go Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <img 
              src={product.image} 
              className="card-img-top p-4" 
              alt={product.title}
              style={{ height: '400px', objectFit: 'contain' }}
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <span className={`badge ${product.category === 'ipod' ? 'bg-info' : 'bg-warning'} mb-3`}>
                {product.category}
              </span>
              
              <h1 className="card-title h2 mb-3">{product.title}</h1>
              
              <div className="mb-4">
                <h3 className="text-primary display-6">${product.price}</h3>
                <p className={product.inStock ? 'text-success' : 'text-danger'}>
                  <i className={`bi ${product.inStock ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-2">Description</h5>
                <p className="card-text">{product.description}</p>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-2">Product Details</h5>
                <ul className="list-unstyled">
                  <li><strong>Category:</strong> {product.category}</li>
                  <li><strong>Added:</strong> {new Date(product.createdAt).toLocaleDateString()}</li>
                  <li><strong>Product ID:</strong> {product.id}</li>
                </ul>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-heart me-2"></i>
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4>Similar Products</h4>
        <p>Check out other {product.category} in our store!</p>
      </div>
    </div>
  );
};

export default ProductDetail;