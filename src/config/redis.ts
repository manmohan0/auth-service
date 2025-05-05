import { createClient } from 'redis';

export const connectRedis = async () => {
    try {
        const redisClient = createClient({
            url: process.env.REDIS,
        })
        redisClient.on('error', (err) => {
            console.log('Redis Client Error', err)
            throw err
        });
        await redisClient.connect()
        console.log("Connected to Redis")
        return redisClient
    } catch (e) {
        console.log('Redis Connection Error', e)
        return null
    }
}