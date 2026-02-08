import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

const userService = new UserService();

export class UserController {
    async register(req: Request, res: Response) {

        try {
        const result = await userService.register(req.body);
        return res.status(201).json(result);
        } catch (error: any) {
            
        if (error.message === 'User already exists') {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
        }
    }

async login(req: Request, res: Response) {
        const { email, password, rememberMe } = req.body; 

        try {
            const { user, token, refreshToken } = await userService.login({ email, password });

            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            const maxAge = rememberMe ? thirtyDays : undefined;

            res.cookie('refreshToken', refreshToken.id, {
                httpOnly: true,
                secure: true, 
                sameSite: 'none',
                maxAge: maxAge 
            });

            return res.status(200).json({ 
                user, 
                token 
            });

        } catch (error: any) {
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}