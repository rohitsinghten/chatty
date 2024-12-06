import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return; // Add return statement here
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      res.status(401).json({ message: "Token is invalid" });
      return; // Add return statement here
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return; // Add return statement here
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    console.log("error in protect route middleware");
    res.status(500).json({ message: "Server error" });
    return; // Add return statement here
  }
};