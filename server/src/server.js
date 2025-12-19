const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config({ path: '.env' });

console.log('Starting server with environment:', process.env.NODE_ENV);

const { connectToDatabase } = require('./database/db');
const Product = require('./models/Product');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

async function startServer() {
  try {
    console.log('🔧 Initializing database...');
    
    const db = await connectToDatabase();
    app.locals.db = db;

    const productModel = new Product(db);
    const userModel = new User(db);

    const productsRouter = require('./routes/products')(productModel);
    const authRouter = require('./routes/auth')(userModel);
    const adminRouter = require('./routes/admin')(userModel, productModel);

    app.use('/api/products', productsRouter);
    app.use('/api/auth', authRouter);
    
    const { authenticateToken } = require('./middleware/auth');
    app.use('/api/admin', authenticateToken, adminRouter);

    app.get('/api/categories', async (req, res) => {
      try {
        const stats = await productModel.getCategoryStats();
        const categories = stats.map(stat => ({
          id: stat.category,
          name: stat.category === 'ipod' ? 'iPod' : 'Headphones',
          count: stat.count
        }));
        res.json(categories);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'Connected',
        environment: process.env.NODE_ENV,
        version: '1.1.0'
      });
    });

    app.get('/api/routes', (req, res) => {
      const routes = [
        'GET /api/test - Test endpoint',
        'GET /api/health - Health check',
        'GET /api/routes - List all routes',
        'GET /api/categories - Product categories',
        'GET /api/products - All products',
        'GET /api/products/:id - Product by ID',
        'POST /api/products - Create product',
        'PUT /api/products/:id - Update product',
        'DELETE /api/products/:id - Delete product',
        'POST /api/auth/register - Register user',
        'POST /api/auth/login - User login',
        'GET /api/auth/profile - User profile (requires auth)',
        'PUT /api/auth/profile - Update profile (requires auth)',
        'POST /api/auth/change-password - Change password (requires auth)',
        'POST /api/auth/verify - Verify token (requires auth)',
        'POST /api/auth/logout - Logout (requires auth)',
        'GET /api/admin/stats - Admin stats (requires admin)',
        'GET /api/admin/users - All users (requires admin)',
        'POST /api/admin/change-admin-password - Change admin password (requires admin)'
      ];
      res.json({ routes });
    });

    app.use('/api/*', (req, res) => {
      console.log(`404: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ 
        error: 'Endpoint not found',
        requested: `${req.method} ${req.originalUrl}`,
        available_routes: 'Check /api/routes for available endpoints'
      });
    });

    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
      });
    });

    app.listen(PORT, () => {
      console.log(`
🚀 Server running on port ${PORT}
🌐 API: http://localhost:${PORT}/api
🔐 Auth: http://localhost:${PORT}/api/auth
📊 Products: http://localhost:${PORT}/api/products
🏥 Health: http://localhost:${PORT}/api/health
📋 Routes: http://localhost:${PORT}/api/routes
💾 Database: SQLite (database.db)
🔒 Authentication: JWT
      `);
      console.log(`\nDefault admin credentials:`);
      console.log(`📧 Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@ipodstore.com'}`);
      console.log(`🔑 Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

startServer();