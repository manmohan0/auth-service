import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
}))

app.use('/auth', authRoutes)
app.use('/user', userRoutes)

app.all('{/*path}', (err : ErrorRequestHandler, req : Request, res : Response, next : NextFunction) => {
    res.json({ success: true, message: 'Page Not Found' });
})

export default app;