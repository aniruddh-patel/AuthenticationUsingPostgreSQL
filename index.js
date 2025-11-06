import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import UserRoute from "./Routes/UserRoute.js"
import CartRoute from "./Routes/CartRoute.js"
import OrderRoute from "./Routes/OrderRoute.js"
import ProductRoute from "./Routes/ProductRoute.js"
import SellerRoute from "./Routes/SellerRoute.js"
import ReportsRoute from "./Routes/ReportsRoute.js"
import { mongoConnect } from "./Connections/MongoDB.js";

dotenv.config({ path: './Configuration/.env' }); 
const PORT=process.env.PORT || 8001
const HOST=process.env.HOST_ADDRESS

const app = express();
app.use(express.json());
app.use(cookieParser());
mongoConnect();



app.use("/api/v1/user",UserRoute)
app.use("/api/v1/cart",CartRoute)
app.use("/api/v1/order",OrderRoute)
app.use("/api/v1/product",ProductRoute)
app.use("/api/v1/seller",SellerRoute)
app.use("/api/v1/reports",ReportsRoute)



app.listen(PORT, ()=>{
    console.log(`Server is running on http://${HOST}:${PORT}`);
})