// import { queryDB } from "../Utilities/pgPool.js";
// import Product from "../Schemas/productSchema.js";

// export const getSellerReportHelper = async (seller_id, month, year) => {
//     try {
//         const sellerProducts = await Product.find({ "seller_info.seller_id": seller_id });
//         const productIds = sellerProducts.map(p => p._id.toString());

//         if (productIds.length === 0) {
//             return {
//                 month,
//                 year,
//                 total_orders: 0,
//                 total_sales: 0,
//                 pending_orders: 0,
//                 delivered_orders: 0,
//                 cancelled_orders: 0,
//                 products_sold: [],
//             };
//         }

//         const query = `
//       SELECT status, product_id, order_timestamp, delivered_date
//       FROM order_table
//       WHERE product_id = ANY($1)
//         AND EXTRACT(MONTH FROM order_timestamp) = $2
//         AND EXTRACT(YEAR FROM order_timestamp) = $3;
//     `;

//         const { rows } = await queryDB(query, [productIds, month, year]);

//         if (rows.length === 0) {
//             return {
//                 month,
//                 year,
//                 total_orders: 0,
//                 total_sales: 0,
//                 pending_orders: 0,
//                 delivered_orders: 0,
//                 cancelled_orders: 0,
//                 products_sold: [],
//             };
//         }

//         let totalOrders = rows.length;
//         let deliveredOrders = 0;
//         let cancelledOrders = 0;
//         let pendingOrders = 0;
//         let totalSales = 0;

//         const productSalesCount = {};
//         for (const order of rows) {
//             if (order.status.toLowerCase() === "delivered") deliveredOrders++;
//             else if (order.status.toLowerCase() === "cancelled") cancelledOrders++;
//             else pendingOrders++;

//             if (order.status.toLowerCase() === "delivered") {
//                 const product = sellerProducts.find(p => p._id.toString() === order.product_id);
//                 if (product) {
//                     totalSales += product.price;
//                     productSalesCount[order.product_id] = (productSalesCount[order.product_id] || 0) + 1;
//                 }
//             }
//         }


//         //report format
//         const productsSold = sellerProducts
//             .filter(p => productSalesCount[p._id.toString()])
//             .map(p => ({
//                 product_id: p._id,
//                 product_name: p.product_name,
//                 units_sold: productSalesCount[p._id.toString()],
//                 price: p.price,
//                 total_revenue: p.price * productSalesCount[p._id.toString()],
//             }));

//         return {
//             month,
//             year,
//             total_orders: totalOrders,
//             total_sales: totalSales,
//             pending_orders: pendingOrders,
//             delivered_orders: deliveredOrders,
//             cancelled_orders: cancelledOrders,
//             products_sold: productsSold,
//         };
//     } catch (error) {
//         throw new Error("Error generating seller report: " + error.message);
//     }
// };

import Product from "../Schemas/productSchema.js";
import { queryDB } from "../Utilities/pgPool.js";

export const getSellerReportHelper = async (seller_id, month, year) => {
    const sellerProducts = await Product.find({ "seller_info.seller_id": seller_id });
    if (!sellerProducts.length) throw new Error("No products found for this seller");

    const now = new Date();
    const selectedMonth = month ? Number(month) : now.getMonth() + 1;
    const selectedYear = year ? Number(year) : now.getFullYear();
    const productIds = sellerProducts.map(p => p._id.toString());

    const query = `
        SELECT 
            product_id,
            COUNT(*) AS total_orders,
            COUNT(*) FILTER (WHERE LOWER(status) = 'delivered') AS delivered_orders,
            COUNT(*) FILTER (WHERE LOWER(status) IN ('cancelled', 'returned')) AS cancelled_orders,
            COUNT(*) FILTER (WHERE LOWER(status) NOT IN ('delivered', 'cancelled', 'returned')) AS pending_orders
        FROM order_table
            WHERE product_id = ANY($1)
            AND EXTRACT(MONTH FROM order_timestamp) = $2
            AND EXTRACT(YEAR FROM order_timestamp) = $3
        GROUP BY product_id;
    `;

    const { rows } = await queryDB(query, [productIds, selectedMonth, selectedYear]);

    const breakdown = {
        delivered: { total_orders: 0, total_sales: 0, products: [] },
        pending: { total_orders: 0, total_sales: 0, products: [] },
        cancelled: { total_orders: 0, total_sales: 0, products: [] },
    };

    for (const row of rows) {
        const product = sellerProducts.find(p => p._id.toString() === row.product_id);
        if (!product) continue;

        const price = product.price;

        const deliveredRevenue = row.delivered_orders * price;
        const pendingRevenue = row.pending_orders * price;
        const cancelledRevenue = row.cancelled_orders * price;

        // Delivered
        if (row.delivered_orders > 0) {
            breakdown.delivered.products.push({
                product_id: product._id,
                product_name: product.product_name,
                units_sold: row.delivered_orders,
                price,
                total_revenue: deliveredRevenue,
            });
            breakdown.delivered.total_orders += Number(row.delivered_orders);
            breakdown.delivered.total_sales += deliveredRevenue;
        }

        // Pending
        if (row.pending_orders > 0) {
            breakdown.pending.products.push({
                product_id: product._id,
                product_name: product.product_name,
                units_sold: row.pending_orders,
                price,
                total_revenue: pendingRevenue,
            });
            breakdown.pending.total_orders += Number(row.pending_orders);
            breakdown.pending.total_sales += pendingRevenue;
        }

        // Cancelled
        if (row.cancelled_orders > 0) {
            breakdown.cancelled.products.push({
                product_id: product._id,
                product_name: product.product_name,
                units_sold: row.cancelled_orders,
                price,
                total_revenue: cancelledRevenue,
            });
            breakdown.cancelled.total_orders += Number(row.cancelled_orders);
            breakdown.cancelled.total_sales += cancelledRevenue;
        }
    }

    for (const key of ["delivered", "pending", "cancelled"]) {
        const section = breakdown[key];
        const sumParts = section.products.map(p => p.total_revenue).join(" + ");
        section.formula = sumParts ? `${sumParts} = ${section.total_sales}` : "0";
    }

    //Summary
    const summary = {
        orders: {
            delivered: breakdown.delivered.total_orders,
            pending: breakdown.pending.total_orders,
            cancelled: breakdown.cancelled.total_orders,
            formula: `${breakdown.delivered.total_orders} + ${breakdown.pending.total_orders} = ${breakdown.delivered.total_orders + breakdown.pending.total_orders}`,
            net_total_orders: breakdown.delivered.total_orders + breakdown.pending.total_orders ,
        },
        sales: {
            delivered: breakdown.delivered.total_sales,
            pending: breakdown.pending.total_sales,
            cancelled: breakdown.cancelled.total_sales,
            formula: `${breakdown.delivered.total_sales} + ${breakdown.pending.total_sales}  = ${breakdown.delivered.total_sales + breakdown.pending.total_sales }`,
            net_total_sales: breakdown.delivered.total_sales + breakdown.pending.total_sales ,
        },
    };

    return {
        summary,
        breakdown,
    };
};
