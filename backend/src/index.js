import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";


// local files
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import connectDB from "./lib/db.js";

import {app,server,io} from "./lib/socket.js"

import path from "path";

dotenv.config();



app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use('/api/messages',messageRoutes)

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve()

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port http://localhost:${PORT}`);
});
