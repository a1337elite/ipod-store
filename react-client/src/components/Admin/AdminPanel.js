import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = ({ fetchProducts }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'ipod',
    image: '',
    inStock: true
  });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || undefined, // undefined вместо пустой строки
      inStock: formData.inStock
    };

    if (editingProduct) {
      // Используем PUT для обновления
      await axios.put(`${API_URL}/products/${editingProduct.id}`, productData);
      alert('Product updated successfully!');
    } else {
      // Используем POST для создания
      await axios.post(`${API_URL}/products`, productData);
      alert('Product added successfully!');
    }
    
    // Сброс формы
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'ipod',
      image: '',
      inStock: true
    });
    setEditingProduct(null);
    
    // Обновление списка продуктов
    loadProducts();
    if (fetchProducts) fetchProducts();
    
  } catch (error) {
    console.error('Error saving product:', error);
    alert(`Error: ${error.response?.data?.error || error.message}`);
  }
};

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      inStock: product.inStock
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        alert('Product deleted successfully!');
        loadProducts();
        if (fetchProducts) fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  return (
    <div className="admin-panel">
      <h1 className="mb-4">Admin Panel</h1>
      
      <div className="row">
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h5>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Price *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="ipod">iPod</option>
                      <option value="headphones">Headphones</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    id="inStock"
                  />
                  <label className="form-check-label" htmlFor="inStock">
                    In Stock
                  </label>
                </div>
                
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  
                  {editingProduct && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                          title: '',
                          description: '',
                          price: '',
                          category: 'ipod',
                          image: '',
                          inStock: true
                        });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">All Products ({products.length})</h5>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={loadProducts}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No products found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={product.image} 
                                alt={product.title}
                                style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }}
                              />
                              <div>
                                <strong>{product.title}</strong>
                                <div className="text-muted small">
                                  {product.description.substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${product.category === 'ipod' ? 'bg-info' : 'bg-warning'}`}>
                              {product.category}
                            </span>
                          </td>
                          <td>${product.price}</td>
                          <td>
                            <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'}`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(product)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(product.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Statistics</h5>
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="h2 text-primary">{products.length}</div>
                    <div className="text-muted">Total Products</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="h2 text-success">
                      {products.filter(p => p.inStock).length}
                    </div>
                    <div className="text-muted">In Stock</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="h2 text-warning">
                      {products.filter(p => p.category === 'headphones').length}
                    </div>
                    <div className="text-muted">Headphones</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="h2 text-info">
                      {products.filter(p => p.category === 'ipod').length}
                    </div>
                    <div className="text-muted">iPods</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;