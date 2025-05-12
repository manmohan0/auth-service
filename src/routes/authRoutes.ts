import { Router } from 'express'
import { signInController, signUpController, tryLoginController } from '../controllers/authController';

const authRoutes: Router = Router();

authRoutes.post('/signin', signInController)
authRoutes.post('/signup', signUpController)
authRoutes.get('/trylogin', tryLoginController)


export default authRoutes