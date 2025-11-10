import express from "express"
import { SellerAuthToken } from "../Middlewares/tokenValidation.js"
import { AllSellerSalesReportHandler, sellerReportHandler } from "../Controllers/ReportsController.js";

const router = express.Router();

router.get("/getdata", SellerAuthToken, sellerReportHandler);
router.get("/all", AllSellerSalesReportHandler);

export default router;


