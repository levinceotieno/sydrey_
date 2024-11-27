const db = require('../db');

exports.createOrder = async (userId, productId, quantity, deliveryAddress, deliveryLocation, deliveryDate) => {

  const query = `INSERT INTO orders (user_id, product_id, quantity, delivery_address, delivery_location, delivery_date, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await db.query(query, [userId, productId, quantity, deliveryAddress, deliveryLocation, deliveryDate, 'Pending']);
};

exports.getOrderHistory = async (userId) => {
  const query = `SELECT o.id, p.name AS product_name, o.quantity, o.status, o.delivery_address, o.delivery_date
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 WHERE o.user_id = ?`;
  const [rows] = await db.query(query, [userId]);
  return rows;
};
