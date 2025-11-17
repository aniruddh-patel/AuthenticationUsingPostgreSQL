import Cart from "../Schemas/cartSchema.js";

export const removeCartItemHelper = async (user_id, productId) => {
  try {
    const result = await Cart.deleteOne({ user_id, product_id: productId });    
    return result.deletedCount;
  } catch (error) {
    throw new Error("Error while removing item from cart");
  }
};

export const listCartHelper = async (user_id) => {
  try {
    return await Cart.aggregate([
      { 
        $match: { user_id } 
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { 
        $unwind: "$product" 
      },
      {
        $project: {
          _id: 0,
          user_id: 1,
          product: {
            product_id: "$product._id",
            name: "$product.product_name",
            price: "$product.price"
          }
        }
      }
    ]);
  } catch (error) {
    throw new Error("Error during querying cart");
  }
};

export const clearCartHelper = async (user_id) => {
  try {
    const result = await Cart.deleteMany({ user_id });
    return result.deletedCount;
  } catch (error) {
    throw new Error("Error while clearing cart");
  }
};

export const addToCartHelper = async (user_id, productId) => {
  try {
    const result = await Cart.updateOne(
      { user_id, product_id: productId },
      { $setOnInsert: { user_id, product_id: productId } },
      { upsert: true }
    );
    return result.upsertedCount;
  } catch (error) {
    throw new Error(error.message || "Error adding item to cart");
  }
};
