import Cart from "../Schemas/cartSchema.js";

// REMOVE ITEM FROM CART
export const removeCartItemHelper = async (user_id, productId) => {
  try {
    const updated = await Cart.findOneAndUpdate(
      { "user.user_id": user_id },
      { $pull: { items: { product_id: productId } } },
      { new: true }
    );

    return updated; // returns null if nothing updated
  } catch (error) {
    throw new Error("Error while removing item from cart");
  }
};


// LIST CART
export const listCartHelper = async (user_id) => {
  try {
    return await Cart.findOne({ "user.user_id": user_id });
  } catch (error) {
    throw new Error("Error during querying cart");
  }
};


// CLEAR CART
export const clearCartHelper = async (user_id) => {
  try {
    return await Cart.findOneAndUpdate(
      { "user.user_id": user_id },
      { $set: { items: [] } },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error while clearing cart");
  }
};


// ADD ITEM TO CART
export const addToCartHelper = async (user_id, user_email, productId, product_name, price) => {
  try {
    // Try add item only if not already present
    const result = await Cart.findOneAndUpdate(
      {
        "user.user_id": user_id,
        "items.product_id": { $ne: productId },      // prevents duplicates
      },
      {
        $push: { items: { product_id: productId, product_name, price } },
        $setOnInsert: { user: { user_id, user_email } },  // if new cart
      },
      {
        new: true,
        upsert: true,  // creates cart if not found
      }
    );

    const exists = result.items.some(i => i.product_id === productId);
    if (!exists) {
      return { success: false, message: "Item already in cart" };
    }

    return { success: true, message: "Item added to cart", cart: result };

  } catch (error) {
    throw new Error(error.message || "Error adding item to cart");
  }
};
