import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface IPayload {
  sub: string;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: "Token missing" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "secret-development-key";
    const { sub } = jwt.verify(token, JWT_SECRET) as IPayload;

    request.user = {
      id: Number(sub),
    };

    return next();
  } catch (err) {
    return response.status(401).json({ message: "Invalid token" });
  }
}