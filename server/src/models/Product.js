class Product {
  constructor(db) {
    this.db = db;
  }

  // Получить все товары
  async getAll() {
    try {
      return await this.db.all('SELECT * FROM products ORDER BY createdAt DESC');
    } catch (error) {
      throw new Error(`Error getting products: ${error.message}`);
    }
  }

  // Получить товар по ID
  async getById(id) {
    try {
      return await this.db.get('SELECT * FROM products WHERE id = ?', id);
    } catch (error) {
      throw new Error(`Error getting product ${id}: ${error.message}`);
    }
  }

  // Получить товары по категории
  async getByCategory(category) {
    try {
      return await this.db.all('SELECT * FROM products WHERE category = ? ORDER BY createdAt DESC', category);
    } catch (error) {
      throw new Error(`Error getting products by category ${category}: ${error.message}`);
    }
  }

  // Создать новый товар
  async create(productData) {
    try {
      const { title, description, price, category, image, inStock } = productData;
      
      const result = await this.db.run(
        `INSERT INTO products (title, description, price, category, image, inStock) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, price, category, image || null, inStock ? 1 : 0]
      );

      // Возвращаем созданный товар
      return await this.getById(result.lastID);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Обновить товар
  async update(id, productData) {
    try {
      const { title, description, price, category, image, inStock } = productData;
      
      await this.db.run(
        `UPDATE products 
         SET title = ?, description = ?, price = ?, category = ?, 
             image = ?, inStock = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [title, description, price, category, image || null, inStock ? 1 : 0, id]
      );

      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error updating product ${id}: ${error.message}`);
    }
  }

  // Удалить товар
  async delete(id) {
    try {
      const product = await this.getById(id);
      if (!product) {
        return null;
      }

      await this.db.run('DELETE FROM products WHERE id = ?', id);
      return product;
    } catch (error) {
      throw new Error(`Error deleting product ${id}: ${error.message}`);
    }
  }

  // Получить статистику по категориям
  async getCategoryStats() {
    try {
      return await this.db.all(`
        SELECT 
          category,
          COUNT(*) as count,
          SUM(CASE WHEN inStock = 1 THEN 1 ELSE 0 END) as inStockCount,
          AVG(price) as avgPrice
        FROM products 
        GROUP BY category
      `);
    } catch (error) {
      throw new Error(`Error getting category stats: ${error.message}`);
    }
  }

  // Поиск товаров
  async search(query) {
    try {
      return await this.db.all(`
        SELECT * FROM products 
        WHERE title LIKE ? OR description LIKE ?
        ORDER BY createdAt DESC
      `, [`%${query}%`, `%${query}%`]);
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }
}

module.exports = Product;