const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/password');

class User {
  constructor(db) {
    this.db = db;
  }

  async register(userData) {
    try {
      const { email, password, name } = userData;

      const existingUser = await this.db.get('SELECT id FROM users WHERE email = ?', email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await hashPassword(password, 10);

      const result = await this.db.run(
        `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
        [email, hashedPassword, name || null, 'user']
      );

      return await this.getById(result.lastID);
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      const user = await this.db.get(
        'SELECT * FROM users WHERE email = ? AND isActive = true',
        email
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      await this.db.run(
        'UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?',
        user.id
      );

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const user = await this.db.get(
        'SELECT id, email, name, role, isActive, createdAt, lastLogin FROM users WHERE id = ?',
        id
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Error getting user: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      return await this.db.all(
        'SELECT id, email, name, role, isActive, createdAt, lastLogin FROM users ORDER BY createdAt DESC'
      );
    } catch (error) {
      throw new Error(`Error getting all users: ${error.message}`);
    }
  }

  async changePassword(id, oldPassword, newPassword) {
    try {
      const user = await this.db.get('SELECT * FROM users WHERE id = ?', id);
      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await comparePassword(oldPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      const hashedPassword = await hashPassword(newPassword, 10);

      await this.db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );

      return true;
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production'
      );
      const user = await this.getById(decoded.id);

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }
}

module.exports = User;