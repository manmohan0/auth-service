import app from './app';
import { connectdb } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
  // 1. Check environment variables
  if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY must be defined');
  }

  try {
    await connectdb();
    
  } catch (err) {
    console.error(err);
    process.exit(1); // crash if cannot connect
  }

  // 3. Start server
  app.listen(3002, () => {
    console.log('Auth Service listening on port 3002');
  });
};

start();
