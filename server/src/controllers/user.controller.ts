import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
    async register(req: Request, res: Response) {
        const userService = new UserService();

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
        const userService = new UserService();

        try {
        const result = await userService.login(req.body);
        return res.status(200).json(result);
        } catch (error: any) {
            
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
        }
    }
}