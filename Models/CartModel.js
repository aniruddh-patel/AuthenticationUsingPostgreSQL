import Cart from "../Schemas/cartSchema.js"

export const removeCartItemHelpher = async (user_id, productId) => {
  try {
    const cart = await Cart.findOne({ "user.user_id": user_id });
    if (!cart) return null;

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.product_id !== productId);
    if (cart.items.length === initialLength) {
      return null;
    }
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error("Error while removing item from cart");
  }
};

export const listCartHelpher = async (user_id) => {
  try {
    const cart = await Cart.findOne({ "user.user_id": user_id });
    return cart;
  } catch (error) {
    throw new Error("Error during querying cart");
  }
};

export const clearCartHelpher = async (user_id) => {
  try {
    const cart = await Cart.findOne({ "user.user_id": user_id });
    if (!cart) return null;
    cart.items = [];
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error("Error while clearing cart");
  }
};


export const addToCartHelpher = async (user_id, user_email, productId, product_name, price) => {
  try {
    let cart = await Cart.findOne({ "user.user_id": user_id });

    // cart already presnt
    if (cart) {
      const exists = cart.items.some((item) =>item.product_id===productId);
      if (exists) {
        return { success: false, message: "Item already in cart" };
      }
      cart.items.push({product_id: productId,product_name,price});
      await cart.save();
      return { success: true, message: "Item added to cart", cart };
    }

    // no cart present
    const newCart = new Cart({
      user: { user_id, user_email },
      items: [{product_id: productObjectId,product_name,price,}]
    });
    await newCart.save();
    return { success: true, message: "Item added to cart", cart: newCart };

  } catch (error) {
    throw new Error(error.message || "Error adding item to cart");
  }
};