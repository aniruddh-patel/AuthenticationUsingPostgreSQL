import express from "express"
import { SellerAuthToken } from "../Middlewares/tokenValidation.js"
import { sellerReportHandler } from "../Controllers/ReportsController.js";

const router = express.Router();

router.get("/getdata", SellerAuthToken, sellerReportHandler);

export default router;


