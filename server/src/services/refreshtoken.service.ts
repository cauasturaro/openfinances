import { prisma } from "../lib/prisma.js";
import { GenerateTokenProvider } from "../provider/GenerateTokenProvider.js";
import dayjs from "dayjs";

export class RefreshTokenService {
  async execute(refresh_token_id: string) {
    const refreshToken = await prisma.refreshToken.findFirst({
      where: { id: refresh_token_id },
    });

    if (!refreshToken) {
      throw new Error("Refresh token invalid");
    }

    const refreshTokenExpired = dayjs().isAfter(dayjs.unix(refreshToken.expiresIn));

    if (refreshTokenExpired) {
        throw new Error("Refresh Token Expired");
    }

    const generateTokenProvider = new GenerateTokenProvider();
    const token = await generateTokenProvider.execute(refreshToken.userId);

    return { token };
  }
}