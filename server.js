// console.log('server', process,module.exports)
import express from "express";

// import router from "./routes/auth";
import { readdirSync } from 'fs'
import cors from "cors";
import mongoose from "mongoose";
const morgan = require("morgan");//doesnt support import export esm
require("dotenv").config();//.env file
const app = express();
app.use(cors())//route middleware
app.use(express.json())//alternate to body-parser
app.use(morgan('dev'));//console.log on private terminal rather than chrome console
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
}).then(() => console.log('connected DB')).catch((err) => console.log("error is ", err))

readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)))//for sync read all routes from routes folder and require them to apply as a middleware
// app.use('/api', router);
const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Server is running at ${port}`))