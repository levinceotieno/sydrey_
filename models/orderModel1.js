const db = require('../db');

exports.createOrder = async (userId, products, deliveryAddress, deliveryLocation, deliveryDate) => {
  // Start a transaction to ensure data integrity
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    
    // Calculate total price
    const totalPrice = products.reduce((total, product) => 
	  total + (product.price * product.quantity), 0);

    // Insert main order
    const [orderResult] = await connection.query(
	`INSERT INTO orders 
	(user_id, delivery_address, delivery_location, delivery_date, total_price, status)
	VALUES (?, ?, ?, ?, ?, ?)`, 
	[userId, deliveryAddress, deliveryLocation, deliveryDate, totalPrice, 'Pending']
    );

    const orderId = orderResult.insertId;

    for (const product of products) {
       await connection.query(
	 `INSERT INTO order_products 
	 (order_id, product_id, quantity) 
	 VALUES (?, ?, ?)`, 
	 [orderId, product.product_id, product.quantity]
       );
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.getOrderHistory = async (userId) => {
  const query = `
     SELECT 
  	o.id,
	o.total_price,
	o.status,
	o.delivery_address,
	o.delivery_date,
	JSON_ARRAYAGG(
	  JSON_OBJECT(
	    'product_name', p.name,
	    'quantity', op.quantity,
	    'price', p.price
	  )
	) AS products
     FROM orders o
     JOIN order_products op ON o.id = op.order_id
     JOIN products p ON op.product_id = p.id
     WHERE o.user_id = ?
     GROUP BY o.id
    `;

    const [rows] = await db.query(query, [userId]);
    console.log('Order History:', rows);
    
    return rows.map(row => ({
	...row,
	products: JSON.parse(row.products)
    }));
};

exports.getAdminOrders = async () => {
  const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.total_price,
      o.delivery_address,
      o.status,
      JSON_ARRAYAGG(
	JSON_OBJECT(
	  'product_name', p.name,
	  'quantity', op.quantity,
	  'price', p.price
	)
      ) AS products
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
