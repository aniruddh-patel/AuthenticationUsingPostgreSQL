import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }},
  { versionKey: false }
);
export const Category = mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({
  seller_info: [
    {
      shop_name: { type: String, required: true },
      seller_id: { type: String, required: true }
    },
  ],
  product_name: { type: String, required: true },
  product_description: String,
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock_quantity: { type: Number, default: 0 },
  categoryIds: [{type: mongoose.Schema.Types.ObjectId, ref:"Category",required:true}],
  brand: String,
  images: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
},{ versionKey: false });

export default mongoose.model("Product", productSchema);
