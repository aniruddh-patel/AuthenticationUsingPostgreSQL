import mongoose, { version } from "mongoose";

const cartSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  product_id: {type: mongoose.Schema.Types.ObjectId, ref:"Product",required:true}
},{ versionKey: false });


export default mongoose.model("Cart", cartSchema);
