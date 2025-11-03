import express from "express";
import {ProductHandler,listProductHandler,createProductHandler,updateProductHandler,deleteProductHandler,sellerProductsHandler} from "../Controllers/ProductController.js";
import { UserAuthToken, SellerAuthToken } from "../Middlewares/tokenValidation.js";

const router = express.Router();
// for user
router.get("/items",listProductHandler);
router.get("/item/:id",ProductHandler);

// for seller
router.get("/account/myitems",SellerAuthToken,sellerProductsHandler)
router.post("/create", SellerAuthToken, createProductHandler);
router.put("/update/:id", SellerAuthToken, updateProductHandler);
router.delete("/delete/:id", SellerAuthToken, deleteProductHandler);

export default router;
