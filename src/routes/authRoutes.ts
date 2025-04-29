import { Router } from 'express'
import { signInController, signUpController } from '../controllers/authController';

const authRoutes: Router = Router();

authRoutes.post('/signin', signInController)
authRoutes.post('/signup', signUpController)

export default authRoutes