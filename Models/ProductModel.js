import mongoose from "mongoose";
import Product, { Category } from "../Schemas/productSchema.js"

export const ProductHelper = async (productID)=>{
  try {
    const product = await Product.findById(productID)
      .populate("categoryIds", "name")

    // const product=await Product.aggregate([
    //   {$match :{_id:new mongoose.Types.ObjectId(productID)}},
    //   {
    //     $lookup:{
    //       from:"categories",
    //       localField:"categoryIds",
    //       foreignField:"_id",
    //       as:"categories"
    //     }
    //   },
    //   {
    //     $project: {
    //       product_name: 1,
    //       product_description: 1,
    //       price: 1,
    //       discount: 1,
    //       stock_quantity: 1,
    //       brand: 1,
    //       images: 1,
    //       seller_info: 1,
    //       created_at: 1,
    //       updated_at: 1,
    //       "categories.name": 1
    //     }
    //   }
    // ])

    return product;
  } catch (error) {
    throw new Error("Database query failed");
  }
}


///////////////////////***********************************//////////////////////////////////


export const createProductHelpher = async (productData) => {
  try {
    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
  } catch (error) {
    throw new Error("Failed to create product");
  }
};

export const updateProductHelpher = async (seller_id, product_id, updateData) => {
  try {
    updateData.updated_at = Date.now();
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: product_id, "seller_info.seller_id": seller_id },
      { $set: updateData },
      { new: true }
    ).populate("categoryIds", "name");
    return updatedProduct;
  } catch (error) {
    throw new Error("Failed to update product");
  }
};

export const deleteProductHelpher = async (seller_id, product_id) =>{
  try {
    const deletedproducts=await Product.findOneAndDelete({_id:product_id,"seller_info.seller_id": seller_id})
    return deletedproducts;
  } catch (error) {
    
  }
}

export const sellerProductsHelpher = async (seller_id) => {
  try {
    const products = await Product.find({
      "seller_info.seller_id": seller_id
    }).populate("categoryIds", "name")
    
    return products;
  } catch (error) {
    throw new Error("Database query failed");
  }
};


// ///////////////////////
export const filterAndListProductsHelper = async (filters) => {
  try {
    const {keyword,minPrice,maxPrice,category,brand,page,limit,} = filters;
    const query = {};

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      query.$or = [
        { product_name: regex },
        { product_description: regex },
        { brand: regex },
      ];
    }

    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      query.categoryIds = categoryDoc ? categoryDoc._id : null;
    }
    if (brand) query.brand = brand;

    const totalCount = await Product.countDocuments(query);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .populate("categoryIds", "name");

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
    
  } catch (error) {
    throw new Error("Error filtering products: " + error.message);
  }
};

