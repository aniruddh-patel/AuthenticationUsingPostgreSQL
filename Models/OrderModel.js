import{ queryDB} from "../Utilities/pgPool.js"
import Product from "../Schemas/productSchema.js"

export const listOrdersHelper = async (userId) => {
  const result = await queryDB(
    "SELECT * FROM order_table WHERE user_id = $1 ORDER BY order_timestamp DESC;",
    [userId]
  );
  return result.rows;
};

export const createOrderHelpher = async (productId, userId) => {
const resultData = await Product.updateOne({ _id: productId, stock_quantity: { $gt: 0 } },{ $inc: { stock_quantity: -1 } });
if (resultData.modifiedCount === 0) {
  throw new Error('Out of stock');
}
console.log(resultData);

const result = await queryDB(
    "INSERT INTO order_table (product_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING *;",
    [productId, userId]
  );
  return result.rows[0];
};


export const findUserOrderById = async (orderId, userId) => {
  const result = await queryDB(
    "SELECT * FROM order_table WHERE order_id = $1 AND user_id = $2 RETURNING *;",
    [orderId, userId]
  );
  return result.rows[0];
};


export const cancelOrderHelpher = async (orderId) => {
  try {
    const orderResult = await queryDB(
      "SELECT product_id, status FROM order_table WHERE order_id = $1;",
      [orderId]
    );

    const order = orderResult.rows[0];
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status.toLowerCase() === "cancelled" || order.status.toLowerCase() === "delivered") {
      throw new Error("Cannot cancel a delivered or already cancelled order");
    }

    const updatedOrder = await queryDB(
      "UPDATE order_table SET status = 'cancelled' WHERE order_id = $1 RETURNING *;",
      [orderId]
    );
    await Product.updateOne(
      { _id: order.product_id },
      { $inc: { stock_quantity: 1 } }
    );
    return updatedOrder.rows[0];
  } catch (error) {
    console.error("Error in cancelOrderHelpher:", error);
    throw error;
  }
};

 export const deliveredOrderHelper = async (user_id, order_id) => {
  const query = `
    UPDATE order_table
    SET status = 'Delivered',
        delivered_date = NOW()
    WHERE order_id = $1 AND user_id = $2
    RETURNING *;
  `;
  const values = [order_id, user_id];
  const result = await queryDB(query, values);
  return result;
};