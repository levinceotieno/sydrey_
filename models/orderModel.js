const db = require('../db');

exports.createOrder = async (userId, productId, quantity, deliveryAddress, deliveryLocation, deliveryDate) => {

  const query = `INSERT INTO orders (user_id, product_id, quantity, delivery_address, delivery_location, delivery_date, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await db.query(query, [userId, productId, quantity, deliveryAddress, deliveryLocation, deliveryDate, 'Pending']);
};

exports.getOrderHistory = async (userId) => {
  const query = `
     SELECT 
  	o.id, 
	p.name AS product_name, 
	o.quantity,
	CAST(o.total_price AS DECIMAL(10, 2)) AS total_price,
	o.status, 
	o.delivery_address, 
	o.delivery_date
     FROM orders o
     JOIN products p ON o.product_id = p.id
     WHERE o.user_id = ?`;
  const [rows] = await db.query(query, [userId]);
  console.log('Order History:', rows);
  return rows;
};

exports.getAdminOrders = async () => {
  const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      JSON_ARRAYAGG(JSON_OBJECT(
	'product_name', p.name,
	'quantity', op.quantity,
	'price', p.price
      )) AS products,
      SUM(op.quantity * p.price) AS total,
      o.delivery_address,
      o.status
    FROM orders o
    JOIN order_products op ON o.id = op.order_id
    JOIN products p ON op.product_id = p.id
    GROUP BY o.id
   `;
   const [rows] = await db.query(query);
   return rows.map(row => ({
      ...row,
      products: JSON.parse(row.products), // Parse the JSON string into an array
   }));
};
