const db = require('../db');

exports.updateCartItem = updateCartItem;
exports.removeCartItem = removeCartItem;

exports.addToCart = async (userId, productId, quantity) => {
  const query = `
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
  `;
  await db.query(query, [userId, productId, quantity, quantity]);
};

exports.getCart = async (userId) => {
  const query = `
    SELECT 
      c.product_id, 
      p.name, 
      c.quantity, 
      p.price, 
      (c.quantity * p.price) AS total_price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  const [rows] = await db.query(query, [userId]);
  return rows;
};

exports.clearCart = async (userId) => {
  const query = `DELETE FROM cart WHERE user_id = ?`;
  await db.query(query, [userId]);
};

async function updateCartItem(userId, productId, quantity) {
  const query = `
    UPDATE cart
    SET quantity = ?
    WHERE user_id = ? AND product_id = ?;
  `;
  await db.query(query, [quantity, userId, productId]);
}

async function removeCartItem(userId, productId) {
  const query = `
    DELETE FROM cart
    WHERE user_id = ? AND product_id = ?;
  `;
  await db.query(query, [userId, productId]);
}
