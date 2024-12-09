import dotenv from "dotenv"
import mongoose from "mongoose";
import { db_name } from "../src/constants.js";
dotenv.config({
    path: "./env"
})

export const dbconnect = async()=>{
    try {
        const dbconnection = await mongoose.connect(`${process.env.MONGODB_URI}${db_name}`)
        console.log(`Mongodb connected. DB Host : ${dbconnection.connection.host}`);       
    } catch (err) {
        console.log("ERROR" , err);
        process.exit(1)
    }
}