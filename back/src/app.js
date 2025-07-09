import express from "express";
const app = express();

import cors from "cors";
app.use(cors());

import * as dotenv from "dotenv";
dotenv.config()

app.use(express.json());

// import db from "./database/mongoConfig.js"
// db.connect();

import usuarioRoutes from "./routes/usuarioRouter.js"

import espRoutes from "./routes/espRouter.js";
app.use("/api/esp", espRoutes);

import scheduleRoutes from "./routes/scheduleRoutes.js";
app.use("/api/schedules", scheduleRoutes); // <- precisa estar assim



app.use("/usuario", usuarioRoutes)

app.post("/api/users", (req, res) => {
    console.log(req.body);
})



export default app;