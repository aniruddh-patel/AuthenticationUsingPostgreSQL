import { createProductHelpher, deleteProductHelpher, listProductHelpher, ProductHelper, sellerProductsHelpher, updateProductHelpher } from "../Models/ProductModel.js";

export const ProductHandler = async (req,res)=>{
  try {
    const productID=req.params.id;
    if(!productID)return res.status(404).json({ success: false, message: "No productId found" })
    const product=await ProductHelper(productID);
    if(!product){
      return res.status(404).json({success:false,message:"product not found"});
    }
    res.status(200).json({success:true,message:"product found",result:product})
    } catch (error) {
    
  }
}

export const listProductHandler = async (req, res) => {
  try {
    const products = await listProductHelpher();
    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products found" });
    }
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({success: false,message: "Server error while fetching products",error: error.message});
  }
};

////////////////////////////////**************************///////////////////////////////////////


export const createProductHandler = async (req, res) => {
  const { seller_id, shop_name } = req.seller;
  const {product_name,product_description,price,discount,stock_quantity,category,brand,images} = req.body;
  try {
    if (!product_name || !price) {
      return res.status(400).json({success: false,message: "Product name and price are required"});
      }
    const newProduct = await createProductHelpher({seller_info: [{ shop_name, seller_id }],product_name,product_description,price,discount,stock_quantity,category,brand,images});
    res.status(201).json({success: true,message: "Product created successfully",data: newProduct});
  } catch (error) {
    res.status(500).json({success: false,message: "Server error while creating product",error: error.message});
  }
};

export const updateProductHandler = async (req, res) => {
  const { seller_id } = req.seller;
  const product_id = req.params.id;
  const updateData = req.body;

  try {
    if (!product_id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    const updatedProduct = await updateProductHelpher(seller_id, product_id, updateData);
    if (!updatedProduct) {
      return res.status(404).json({success: false,message: "Product not found or you are not authorized to update it"});}

    res.status(200).json({success: true,message: "Product updated successfully",data: updatedProduct});
  } catch (error) {
    res.status(500).json({success: false,message: "Server error while updating product",error: error.message});
  }
};

export const deleteProductHandler = async(req,res)=>{
  const {seller_id} = req.seller;
  const product_id=req.params.id;
  try {
    if(!product_id)return res.status(400).json({success:false, error:"Product Id is required"})
    const deleteProduct = await deleteProductHelpher(seller_id,product_id);
    if(!deleteProduct)return res.status(404).json({success:false,message:"Product not found"})
    res.status(200).json({success: true,message:"Product deleted successfully"});
  } catch (error) {
    res.status(500).json({success: false,message: "Server error while deleting seller product",error: error.message});
  }
}


export const sellerProductsHandler = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    const products = await sellerProductsHelpher(seller_id);
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this seller" });
    }
    res.status(200).json({success: true,count: products.length,data: products});
  } catch (error) {
    res.status(500).json({success: false,message: "Server error while fetching seller products",error: error.message});}
};
