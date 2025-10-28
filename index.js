import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import UserRoute from "./Routes/UserRoute.js"

dotenv.config({ path: './Configuration/.env' }); /*FOR MULTIPLE ENV FILE WE CAN SEND ARRAY IN PATH */
const PORT=process.env.PORT || 8001
const HOST=process.env.HOST_ADDRESS

const app = express();
app.use(express.json())                           /*THIS IS USED TO PARSE BODY JSON DATA INTO JS OBJECT FORMAT AND PUT INTO BODY OBJ */
app.use(cookieParser());
// app.use(express.urlencoded({extended:true}))   /*THIS IS USED FOR FORMDATA RECIVED FROM HTML FORM ON BUTTON SUBMIT*/

app.use("/api/v1",UserRoute)

app.listen(PORT, ()=>{
    console.log(`Server is running on http://${HOST}:${PORT}`);
})