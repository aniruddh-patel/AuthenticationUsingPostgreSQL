import express from "express";
import {
  listOrdersHandler,
  createOrderHandler,
  cancelOrderHandler
} from "../Controllers/OrderController.js";
import { UserAuthToken } from "../Middlewares/tokenValidation.js";

const router = express.Router();

router.get("/items", UserAuthToken, listOrdersHandler);
router.post("/create/:id", UserAuthToken, createOrderHandler);
router.delete("/cancel/:id", UserAuthToken, cancelOrderHandler);

export default router;
