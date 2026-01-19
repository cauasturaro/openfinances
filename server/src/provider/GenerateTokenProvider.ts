import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta";

export class GenerateTokenProvider {
  async execute(userId: number) {
    const token = jwt.sign({}, JWT_SECRET, {
      subject: String(userId),
      expiresIn: "15m", 
    });

    return token;
  }
}