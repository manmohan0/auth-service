import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
}))

app.options('{/*path}', cors()); 

app.use('/auth', authRoutes)
app.use('/user', userRoutes)

app.all('{/*path}', (err : ErrorRequestHandler, req : Request, res : Response, next : NextFunction) => {
    res.json({ success: true, message: 'Page Not Found' });
})

export default app;