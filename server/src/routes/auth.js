const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (userModel) => {
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const result = await userModel.register({ email, password, name });
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await userModel.login(email, password);
      
      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  });

  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await userModel.getById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      const { name, email } = req.body;

      if (!name && !email) {
        return res.status(400).json({ error: 'No data to update' });
      }

      const updatedUser = await userModel.updateProfile(req.user.id, { name, email });
      
      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      await userModel.changePassword(req.user.id, currentPassword, newPassword);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/verify', authenticateToken, (req, res) => {
    res.json({
      valid: true,
      user: req.user
    });
  });

  router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  return router;
};