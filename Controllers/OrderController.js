import {findUserOrderById, listOrdersHelper, createOrderHelpher, cancelOrderHelpher, deliveredOrderHelper} from "../Models/OrderModel.js";
import mongoose from "mongoose";

export const listOrdersHandler = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const orders = await listOrdersHelper(userId);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error listing orders:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const createOrderHandler = async (req, res) => {
  const userId = req.user.user_id;
  const product_id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(product_id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
      }

  try {
    const newOrder = await createOrderHelpher (product_id, userId);
    res.status(201).json({success: true,message: "Order created successfully",order: newOrder});
  } catch (error) {
    if (error.message === "Out of stock") {
      return res.status(400).json({success: false,message: "Product is out of stock"});
    }
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


export const cancelOrderHandler = async (req, res) => {
  const userId = req.user.user_id;
  const orderId = req.params.id;

  try {
    const order = await findUserOrderById(orderId, userId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found or not yours" });
    }
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({success: false,error: "Cannot cancel a delivered or already cancelled order",});
    }

    const cancelledOrder = await cancelOrderHelpher(orderId);

    res.status(200).json({success: true,message: "Order cancelled successfully",order: cancelledOrder});
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


export const deliveredOrderHandler =async(req,res)=>{
  try{
  const userId = req.user.user_id
  const order_id=req.params.id;
  
  if(!order_id)return res.status(400).json({ success:false, message: "Missing order_id" });

  const result=deliveredOrderHelper(userId,order_id);
  if (result.rowCount === 0) {
      return res.status(404).json({success: false, message: "Order not found or not authorized" });
    }

    res.status(200).json({success: true, message: "Order marked as Delivered successfully" });
  } catch (error) {
    console.error("Error marking order as delivered:", error);
    res.status(500).json({success: false, message: "Internal Server Error" });
  }
};


