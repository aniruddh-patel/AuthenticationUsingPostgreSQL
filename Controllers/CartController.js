import mongoose from "mongoose"
import { addToCartHelper, clearCartHelper, listCartHelper, removeCartItemHelper } from "../Models/CartModel.js";

export const addToCartHandler = async (req, res) => {
  try {
    const { productId } = req.params;
    const { user_id, user_email } = req.user;
    const { product_name, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const result = await addToCartHelper(user_id,user_email,productId,product_name,price);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.status(200).json({success: true,message: result.message});
  } catch (error) {
    res.status(500).json({success: false,message: "Server error while adding to cart",error: error.message,});
  }
};


export const removeFromCartHandler = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const updatedCart = await removeCartItemHelper(user_id, productId);
    if (!updatedCart) {
      return res.status(404).json({ success: false, message: "Cart or product not found" });
    }
    res.status(200).json({ success: true, message: "Item removed from cart", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while removing item", error: error.message });
  }
};

export const listCartHandler = async (req, res) => {
  try {
    const { user_id } = req.user;
    const cart = await listCartHelper(user_id);
    if (!cart) {
      return res.status(404).json({ success: false, message: "No cart found for this user" });
    }
    if (cart.items.length === 0) {
      return res.status(200).json({ success: true, message: "Cart is empty", items: [] });
    }
    res.status(200).json({success: true,message: "Cart fetched successfully",items: cart.items});
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching cart", error: error.message });
  }
};

export const clearCartHandler = async (req, res) => {
  try {
    const { user_id } = req.user;

    const cleared = await clearCartHelper(user_id);
    if (!cleared) {
      return res.status(404).json({ success: false, message: "Cart not found or already empty" });
    }

    res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while clearing cart", error: error.message });
  }
};