const express = require('express');
const router = express.Router();

module.exports = (productModel) => {
  router.get('/', async (req, res) => {
    try {
      const products = await productModel.getAll();
      res.json(products);
    } catch (error) {
      console.error('Error in GET /products:', error);
      res.status(500).json({ error: 'Failed to get products', details: error.message });
    }
  });

  router.get('/category/:category', async (req, res) => {
    try {
      const products = await productModel.getByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      console.error(`Error in GET /products/category/${req.params.category}:`, error);
      res.status(500).json({ error: 'Failed to get products by category', details: error.message });
    }
  });

  router.get('/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const products = await productModel.search(q);
      res.json(products);
    } catch (error) {
      console.error('Error in GET /products/search:', error);
      res.status(500).json({ error: 'Failed to search products', details: error.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const product = await productModel.getById(req.params.id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error in GET /products/:id:', error);
      res.status(500).json({ error: 'Failed to get product', details: error.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { title, description, price, category, image, inStock } = req.body;

      if (!title || !description || !price || !category) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['title', 'description', 'price', 'category']
        });
      }

      if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      const product = await productModel.create({
        title,
        description,
        price: parseFloat(price),
        category,
        image,
        inStock: inStock !== undefined ? inStock : true
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Error in POST /products:', error);
      res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { title, description, price, category, image, inStock } = req.body;

      if (!title || !description || !price || !category) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['title', 'description', 'price', 'category']
        });
      }

      if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      const product = await productModel.update(req.params.id, {
        title,
        description,
        price: parseFloat(price),
        category,
        image,
        inStock: inStock !== undefined ? inStock : true
      });

      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error in PUT /products/:id:', error);
      res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const product = await productModel.delete(req.params.id);
      if (product) {
        res.json({ 
          message: 'Product deleted successfully',
          product: product
        });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error in DELETE /products/:id:', error);
      res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
  });

  router.get('/stats/categories', async (req, res) => {
    try {
      const stats = await productModel.getCategoryStats();
      res.json(stats);
    } catch (error) {
      console.error('Error in GET /products/stats/categories:', error);
      res.status(500).json({ error: 'Failed to get category stats', details: error.message });
    }
  });

  return router;
};