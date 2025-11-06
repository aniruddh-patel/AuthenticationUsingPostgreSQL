import { getSellerReportHelper } from "../Models/ReportsModel.js";

export const sellerReportHandler = async (req, res) => {
  const { seller_id } = req.seller;
  const { month, year } = req.query;

  try {
    const report = await getSellerReportHelper(seller_id, month, year);

    res.status(200).json({
      success: true,
      message: "Seller report generated successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating seller report",
      error: error.message,
    });
  }
};