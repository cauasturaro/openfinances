import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

export class GenerateRefreshTokenProvider {
  async execute(userId: number) {
    await prisma.refreshToken.deleteMany({ where: { userId } });

    const expiresIn = dayjs().add(30, "days").unix();

    const generateRefreshToken = await prisma.refreshToken.create({
      data: {
        userId,
        expiresIn,
      },
    });

    return generateRefreshToken;
  }
}