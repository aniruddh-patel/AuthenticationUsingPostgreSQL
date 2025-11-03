import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
    user_id: { type: Number, required: true },
    user_email: { type: String, required: true },
  },
  items: [
    {
      product_id: { type: String, required: true },
      product_name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

export default mongoose.model("Cart", cartSchema);
