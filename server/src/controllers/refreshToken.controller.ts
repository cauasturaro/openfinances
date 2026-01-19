import { Request, Response } from "express";
import { RefreshTokenService } from "../services/refreshtoken.service.js";

export class RefreshTokenController {
  async handle(req: Request, res: Response) {
    const refreshTokenId = req.cookies.refreshToken; 

    if (!refreshTokenId) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const refreshTokenService = new RefreshTokenService();
    
    try {
      const { token } = await refreshTokenService.execute(refreshTokenId);
      return res.json({ token });
    } catch (error) {
      return res.status(401).json({ message: "Refresh token expired" });
    }
  }
}