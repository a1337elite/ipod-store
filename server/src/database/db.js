const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

// Проверяем переменные окружения
require('dotenv').config({ path: '.env' });

// Проверяем, что переменные окружения загружены
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL ? 'set' : 'not set',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD ? 'set' : 'not set'
});

// Подключаемся к базе данных
async function connectToDatabase() {
  try {
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    });

    console.log('✅ Connected to SQLite database');

    // Создаем таблицу товаров
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image TEXT,
        inStock BOOLEAN DEFAULT true,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаем таблицу пользователей
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'user',
        isActive BOOLEAN DEFAULT true,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME
      )
    `);

    // Создаем таблицу сессий
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        token TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables ready');

    // Проверяем наличие администратора
    await createDefaultAdmin(db);

    // Проверяем, есть ли товары
    const count = await db.get('SELECT COUNT(*) as count FROM products');
    if (count.count === 0) {
      await seedProducts(db);
      console.log('✅ Sample products added');
    }

    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
}

// Создаем администратора по умолчанию
async function createDefaultAdmin(db) {
  try {
    // Используем значения по умолчанию, если переменные окружения не установлены
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@ipodstore.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    
    console.log('Creating admin with:', { adminEmail, adminPassword: '***' });

    const adminExists = await db.get(
      "SELECT id FROM users WHERE email = ? AND role = 'admin'",
      adminEmail
    );

    if (!adminExists) {
      // Проверяем, что пароль не undefined
      if (!adminPassword) {
        throw new Error('Admin password is not defined');
      }
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await db.run(
        `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
        [
          adminEmail,
          hashedPassword,
          'Administrator',
          'admin'
        ]
      );
      
      console.log('✅ Default admin user created');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    console.error('Stack:', error.stack);
  }
}

/* 
async function seedProducts(db) {
  const sampleProducts = [
    {
      title: "Apple iPod Touch 7th Generation",
      description: "7th generation iPod Touch with A10 Fusion chip, 4-inch Retina display, and up to 256GB storage.",
      price: 199.99,
      category: "ipod",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipod-touch-select-2019?wid=940&hei=1112&fmt=png-alpha&.v=1550676486177",
      inStock: 1
    },
    {
      title: "AirPods Pro (2nd Generation)",
      description: "Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio.",
      price: 249.99,
      category: "headphones",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2nd-gen-hero?wid=940&hei=1112&fmt=png-alpha&.v=1660927557148",
      inStock: 1
    }
  ];

  const stmt = await db.prepare(`
    INSERT INTO products (title, description, price, category, image, inStock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const product of sampleProducts) {
    await stmt.run(
      product.title,
      product.description,
      product.price,
      product.category,
      product.image,
      product.inStock
    );
  }

  await stmt.finalize();
}
*/

module.exports = { connectToDatabase };