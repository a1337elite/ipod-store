const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

module.exports = (userModel, productModel) => {
  router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const productStats = await productModel.getCategoryStats();
      const userStats = await userModel.getAllUsers();
      
      res.json({
        products: {
          total: productStats.reduce((sum, stat) => sum + stat.count, 0),
          byCategory: productStats
        },
        users: {
          total: userStats.length,
          admins: userStats.filter(u => u.role === 'admin').length,
          active: userStats.filter(u => u.isActive).length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await userModel.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/change-admin-password', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      await userModel.changePassword(req.user.id, currentPassword, newPassword);
      
      res.json({ message: 'Admin password changed successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};