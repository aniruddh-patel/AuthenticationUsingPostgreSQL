import express from "express";
import {
  listOrdersHandler,
  createOrderHandler,
  cancelOrderHandler,
  deliveredOrderHandler
} from "../Controllers/OrderController.js";
import { UserAuthToken } from "../Middlewares/tokenValidation.js";

const router = express.Router();

router.get("/items", UserAuthToken, listOrdersHandler);
router.post("/create/:id", UserAuthToken, createOrderHandler);
router.delete("/cancel/:id", UserAuthToken, cancelOrderHandler);
router.put('/delivered/:id',UserAuthToken,deliveredOrderHandler);

export default router;
