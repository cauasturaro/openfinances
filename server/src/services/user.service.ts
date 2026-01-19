import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUserInput } from "../schemas/user.schema.js"

import { GenerateTokenProvider } from "../provider/GenerateTokenProvider.js";
import { GenerateRefreshTokenProvider } from "../provider/GenerateRefreshTokenProvider.js";

const JWT_SECRET = process.env.JWT_SECRET || 'secret-development-key';

export class UserService {
    async register(data: CreateUserInput) {
        const userAlreadyExists = await prisma.user.findUnique({
        where: { email: data.email },
        });

        if (userAlreadyExists) {
        throw new Error('User already exists');
        }

        const passwordHash = await bcrypt.hash(data.password, 8);

        const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: passwordHash,
        },
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(data: { email: string; password: string }) {
        const user = await prisma.user.findUnique({
        where: { email: data.email },
        });

        if (!user) {
        throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
        throw new Error('Invalid credentials');
        }

        const tokenProvider = new GenerateTokenProvider();
        const token = await tokenProvider.execute(user.id);

        const refreshTokenProvider = new GenerateRefreshTokenProvider();
        const refreshToken = await refreshTokenProvider.execute(user.id);

        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token, refreshToken };
    }
}