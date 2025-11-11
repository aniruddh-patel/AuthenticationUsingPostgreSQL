import { createProductHelpher, deleteProductHelpher, filterAndListProductsHelper, ProductHelper, sellerProductsHelpher, updateProductHelpher } from "../Models/ProductModel.js";
import { Category } from "../Schemas/productSchema.js";

export const listProductsHandler = async (req, res) => {
  try {
    const {keyword = null,minPrice = null,maxPrice = null,category = null,brand = null,page = 1,limit = 5,} = req.query;

    const filters = {
      keyword: keyword ? keyword.trim() : null,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      category,
      brand,
      page: Number(page),
      limit: Number(limit),
    };

    const { products, totalCount, totalPages } = await filterAndListProductsHelper(filters);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts: totalCount,
      totalPages,
      currentPage: page,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

export const ProductHandler = async (req, res) => {
  try {
    const productID = req.params.id;
    if (!productID) return res.status(404).json({ success: false, message: "No productId found" })
    const product = await ProductHelper(productID);
    if (!product) {
      return res.status(404).json({ success: false, message: "product not found" });
    }
    res.status(200).json({ success: true, message: "product found", result: product })
  } catch (error) {

  }
}

export const createProductHandler = async (req, res) => {
  const { seller_id, shop_name } = req.seller;
  const { product_name, product_description, price, discount, stock_quantity, category, brand, images } = req.body;
  try {
    if (!product_name || !price) {
      return res.status(400).json({ success: false, message: "Product name and price are required" });
    }
    let categoryIds = [];
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: `Category "${category}" does not exist in master`,
        });
      }
      categoryIds = [categoryDoc._id];
    }

    const newProduct = await createProductHelpher({ seller_info: [{ shop_name, seller_id }], product_name, product_description, price, discount, stock_quantity, categoryIds, brand, images });
    res.status(201).json({ success: true, message: "Product created successfully", data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while creating product", error: error.message });
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
      return res.status(404).json({ success: false, message: "Product not found or you are not authorized to update it" });
    }

    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while updating product", error: error.message });
  }
};

export const deleteProductHandler = async (req, res) => {
  const { seller_id } = req.seller;
  const product_id = req.params.id;
  try {
    if (!product_id) return res.status(400).json({ success: false, error: "Product Id is required" })
    const deleteProduct = await deleteProductHelpher(seller_id, product_id);
    if (!deleteProduct) return res.status(404).json({ success: false, message: "Product not found" })
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while deleting seller product", error: error.message });
  }
}


export const sellerProductsHandler = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    const products = await sellerProductsHelpher(seller_id);
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this seller" });
    }
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching seller products", error: error.message });
  }
};
