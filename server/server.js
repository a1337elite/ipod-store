const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    products: [
      {
        id: 1,
        title: "Apple iPod Touch 7th Generation",
        description: "7th generation iPod Touch with A10 Fusion chip, 4-inch Retina display, and up to 256GB storage.",
        price: 199,
        category: "ipod",
        image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipod-touch-select-2019?wid=940&hei=1112&fmt=png-alpha&.v=1550676486177",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "AirPods Pro (2nd Generation)",
        description: "Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio.",
        price: 249,
        category: "headphones",
        image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2nd-gen-hero?wid=940&hei=1112&fmt=png-alpha&.v=1660927557148",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "Apple iPod Nano 7th Gen",
        description: "7th generation iPod Nano with 2.5-inch Multi-Touch display and 16GB storage.",
        price: 149,
        category: "ipod",
        image: "https://support.apple.com/library/content/dam/edam/applecare/images/en_US/ipod/ipodnano-7thgen.png",
        inStock: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        title: "Beats Studio Pro",
        description: "Over-ear wireless headphones with Active Noise Cancelling and 40-hour battery life.",
        price: 349,
        category: "headphones",
        image: "https://www.beatsbydre.com/content/dam/beats/web/product/headphones/studio-pro/plp/bbd.studiopro.plp.black.png",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        title: "AirPods Max",
        description: "Over-ear headphones with high-fidelity audio and Adaptive EQ.",
        price: 549,
        category: "headphones",
        image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-hero-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604022365000",
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 6,
        title: "iPod Shuffle",
        description: "Compact, clip-on music player with 2GB storage and VoiceOver.",
        price: 49,
        category: "ipod",
        image: "https://support.apple.com/library/content/dam/edam/applecare/images/en_US/ipod/ipodshuffle-4thgen.png",
        inStock: true,
        createdAt: new Date().toISOString()
      }
    ]
  };
  
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log(`Created initial data file: ${DATA_FILE}`);
  } catch (error) {
    console.error('Error creating initial data file:', error);
  }
}

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.error(`Data file not found: ${DATA_FILE}`);
      return { products: [] };
    }
    
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    if (!parsed.products || !Array.isArray(parsed.products)) {
      console.warn('Invalid data structure, returning empty array');
      return { products: [] };
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading data file:', error);
    return { products: [] };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

app.get('/api/products', (req, res) => {
  try {
    const data = readData();
    res.json(data.products);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    res.status(500).json({ 
      error: 'Failed to read products data',
      details: error.message 
    });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const data = readData();
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const product = data.products.find(p => p.id === productId);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error in GET /api/products/:id:', error);
    res.status(500).json({ 
      error: 'Failed to read product data',
      details: error.message 
    });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { title, description, price, category, image, inStock } = req.body;
    
    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const data = readData();
    
    const maxId = data.products.length > 0 
      ? Math.max(...data.products.map(p => p.id)) 
      : 0;
    
    const newProduct = {
      id: maxId + 1,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image: image && image.trim() || 'https://via.placeholder.com/300x300?text=No+Image',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.products.push(newProduct);
    
    if (writeData(data)) {
      res.status(201).json(newProduct);
    } else {
      res.status(500).json({ error: 'Failed to save product' });
    }
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    res.status(500).json({ 
      error: 'Failed to add product',
      details: error.message 
    });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { title, description, price, category, image, inStock } = req.body;
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const data = readData();
    const productIndex = data.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updatedProduct = {
      ...data.products[productIndex],
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image: image && image.trim() || data.products[productIndex].image,
      inStock: inStock !== undefined ? Boolean(inStock) : data.products[productIndex].inStock,
      updatedAt: new Date().toISOString()
    };
    
    data.products[productIndex] = updatedProduct;
    
    if (writeData(data)) {
      res.json(updatedProduct);
    } else {
      res.status(500).json({ error: 'Failed to update product' });
    }
  } catch (error) {
    console.error('Error in PUT /api/products/:id:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const data = readData();
    const productIndex = data.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    data.products.splice(productIndex, 1);
    
    if (writeData(data)) {
      res.json({ 
        success: true, 
        message: 'Product deleted successfully',
        deletedId: productId 
      });
    } else {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } catch (error) {
    console.error('Error in DELETE /api/products/:id:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const data = readData();
    const products = data.products || [];
    
    const categories = [
      { 
        id: 'ipod', 
        name: 'iPod', 
        count: products.filter(p => p.category === 'ipod').length 
      },
      { 
        id: 'headphones', 
        name: 'Headphones', 
        count: products.filter(p => p.category === 'headphones').length 
      }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    res.status(500).json({ 
      error: 'Failed to get categories',
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dataFileExists: fs.existsSync(DATA_FILE),
    dataFilePath: DATA_FILE
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Data file: ${DATA_FILE}`);
  console.log(`📁 Data file exists: ${fs.existsSync(DATA_FILE)}`);
  
  const data = readData();
  console.log(`📊 Total products loaded: ${data.products.length}`);
});