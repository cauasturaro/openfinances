import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { RefreshTokenController } from '../controllers/refreshToken.controller.js'; 
import { validate } from '../middlewares/validate.js';
import { createUserSchema } from '../schemas/user.schema.js';

const userRoutes = Router();
const userController = new UserController();
const refreshTokenController = new RefreshTokenController();

userRoutes.post('/', validate(createUserSchema), userController.register);
userRoutes.post('/login', userController.login);

userRoutes.post('/refresh-token', refreshTokenController.handle);

export { userRoutes };