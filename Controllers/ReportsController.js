import { AllSellerSalesReportHelper, getSellerReportHelper } from "../Models/ReportsModel.js";

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

export const AllSellerSalesReportHandler = async (req, res) => {
  try {
    const sellers = await AllSellerSalesReportHelper();

    res.status(200).json({
      success: true,
      message: "Seller sales report generated successfully",
      sellers
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};