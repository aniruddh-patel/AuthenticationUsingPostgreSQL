import mongoose from "mongoose"
import { addToCartHelper, clearCartHelper, listCartHelper, removeCartItemHelper } from "../Models/CartModel.js";

export const addToCartHandler = async (req, res) => {
  try {
    const { productId } = req.params;
    const { user_id } = req.user;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const result = await addToCartHelper(user_id, productId);
    if (result === 0) {
      return res.status(400).json({ success: false, message: "Item already in cart" });
    }
    res.status(200).json({ success: true, message: "Item added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while adding to cart" });
  }
};


export const removeFromCartHandler = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const deletedCount = await removeCartItemHelper(user_id, productId);

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }
    return res.status(200).json({ success: true, message: "Item removed from cart" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while removing item" });
  }
};

export const listCartHandler = async (req, res) => {
  try {
    const { user_id } = req.user;

    const cartItems = await listCartHelper(user_id);

    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({ success: true, message: "Cart is empty", items: [] });
    }
    res.status(200).json({ success: true, message: "Cart fetched successfully", items: cartItems });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching cart" });
  }
};

export const clearCartHandler = async (req, res) => {
  try {
    const { user_id } = req.user;

    const deletedCount = await clearCartHelper(user_id);

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Cart not found or already empty" });
    }
    return res.status(200).json({ success: true, message: "Cart cleared successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while clearing cart" });
  }
};
