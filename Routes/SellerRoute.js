import express from "express"
import {SellerAuthToken } from "../Middlewares/tokenValidation.js"
import { sellerDeleteHandler, sellerLoginHandler, sellerLogoutHandler, sellerProfileHandler, sellerReactivateAccountHandler, sellerSignUpHandler, sellerUpdateHandler } from "../Controllers/SellerController.js";

const router = express.Router();

router.post("/account/login",sellerLoginHandler);
router.post("/account/signup",sellerSignUpHandler);
router.post("/account/reactivate",sellerReactivateAccountHandler);
router.get("/account/profile",SellerAuthToken, sellerProfileHandler);
router.post("/account/logout",SellerAuthToken, sellerLogoutHandler)
router.put("/account/update",SellerAuthToken, sellerUpdateHandler);
router.delete("/account/delete",SellerAuthToken, sellerDeleteHandler);

export default router;


