import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// interface AuthRequest extends Request {
//   user?: string | object;
// }

const authMiddleware = (req: any, res: any, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

export default authMiddleware;
