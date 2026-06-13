import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";


dotenv.config({
    path:"./.env"
})
const app = express();



connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`The Server is running at ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log("MongoDB connection failed",error)
})


/*
import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
        app.on("error", (error) => {
            console.log("ERROR", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(error)
        throw error
    }
})()
*/