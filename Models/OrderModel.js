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
const result = await queryDB(
    "INSERT INTO order_table (product_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING *;",
    [productId, userId]
  );
  return result.rows[0];
};

export const findUserOrderById = async (orderId, userId) => {
  const result = await queryDB(
    "SELECT * FROM order_table WHERE order_id = $1 AND user_id = $2;",
    [orderId, userId]
  );
  return result.rows[0];
};

export const cancelOrderHelpher = async (orderId) => {
  const result = await queryDB(
    "UPDATE order_table SET status = 'cancelled' WHERE order_id = $1 RETURNING *;",
    [orderId]
  );
  return result.rows[0];
};
