import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors";
import propertyRoute from "./routes/property.js"
import authRoute from "./routes/auth.js"
import userRoute from "./routes/user.js"
import passport from "passport";
import "./lib/passport.js"
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({ 
    origin: "http://localhost:5173", 
    credentials:true
}))
app.use(passport.initialize())

//------------
app.use("/api/property", propertyRoute)
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute)
app.listen(8800, ()=>{
    console.log("Server connesso");
})