import React from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const ProductList = ({ products: propProducts, addToCart }) => {
  const { category } = useParams();
  const [products, setProducts] = React.useState(propProducts || []);
  const [loading, setLoading] = React.useState(!propProducts);

  const API_URL = 'http://localhost:5000/api';

  React.useEffect(() => {
    if (!propProducts) {
      fetchProducts();
    } else {
      setProducts(propProducts);
    }
  }, [propProducts, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = category 
        ? `${API_URL}/products` 
        : `${API_URL}/products`;
      
      const response = await axios.get(url);
      
      let filteredProducts = response.data;
      if (category) {
        filteredProducts = response.data.filter(p => p.category === category);
      }
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      <h2 className="mb-4">
        {category ? 
          `${category === 'ipod' ? 'iPods' : 'Headphones'} (${products.length})` : 
          'All Products'
        }
      </h2>
      
      <div className="row">
        {products.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              No products found in this category.
            </div>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 product-card">
                <div className="card-img-top-container">
                  <img 
                    src={product.image} 
                    className="card-img-top" 
                    alt={product.title}
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
                  {!product.inStock && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.title}</h5>
                  <p className="card-text flex-grow-1">
                    {product.description.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description
                    }
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="h5 text-primary">${product.price}</span>
                    <span className={`badge ${product.category === 'ipod' ? 'bg-info' : 'bg-warning'}`}>
                      {product.category}
                    </span>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between">
                    <Link 
                      to={`/product/${product.id}`} 
                      className="btn btn-outline-primary btn-sm"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => addToCart(product)}
                      className="btn btn-success btn-sm"
                      disabled={!product.inStock}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;