import express from "express";
import { addToCartHandler, removeFromCartHandler, listCartHandler, clearCartHandler} from "../Controllers/CartController.js";
import { UserAuthToken } from "../Middlewares/tokenValidation.js";

const router = express.Router();

router.get("/items", UserAuthToken, listCartHandler);
router.post("/add/:productId", UserAuthToken, addToCartHandler);
router.delete("/remove/all", UserAuthToken, clearCartHandler);
router.delete("/remove/:productId", UserAuthToken, removeFromCartHandler);

export default router;
