import dotenv from 'dotenv'
dotenv.config({
    path: './env'
})

import { dbconnect } from "../db/db.index.js";
import { app } from './app.js';

dbconnect()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`app is listening on Port :${process.env.PORT}`);
    })
}).catch((error)=>{
    console.log("Mongodb connection failed", error);
    
})