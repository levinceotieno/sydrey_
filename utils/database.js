async function getOrdersFromDatabase(db) {
  if (!db) {
     throw new Error('Database connection not established.');
  }
  try {
    const [rows] = await db.execute(`
      SELECT
        orders.id AS order_id,
        users.name AS customer_name,
        orders.delivery_address,
        orders.status,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', products.name,
            'quantity', order_products.quantity
          )
        ) AS products
      FROM orders
      LEFT JOIN users ON orders.user_id = users.id
      LEFT JOIN order_products ON orders.id = order_products.order_id
      LEFT JOIN products ON order_products.product_id = products.id
      GROUP BY orders.id
    `);
    return rows;
  } catch (error) {
    throw new Error('Error fetching orders from the database.');
  }
}

module.exports = { getOrdersFromDatabase };
