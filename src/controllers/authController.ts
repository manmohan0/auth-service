import { Request, Response } from "express";
import { z } from "zod";
import { connectdb } from "../config/db";
import { jwtSign, jwtVerify } from "../services/jwtService";
import { connectRedis } from "../config/redis";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config()

export const signInController = async (req: Request , res: Response) : Promise<void> => {
    try {
        const user = req.body

        const userSchema = z.object({
            email: z.string().email("Invalid Email"),
            password: z.string().min(1, "Incorrect Password")
        })

        const parsedUser = userSchema.safeParse(user)

        if (parsedUser.success) {

            const client = await connectdb()
            const redisClient = await connectRedis()
            
            if (!client) {
                const reason = { success: false, reason: "Database Server Error" }
                res.json(reason);
                return
            }

            if (!redisClient) {
                const reason = { success: false, reason: "Redis Server Error" }
                res.json(reason);
                return
            }

            const query = "SELECT * FROM users WHERE email = $1"
            const result = await client.query(query, [user.email])

            if (result.rows.length > 0) {
                const userRow = result.rows[0]
                
                const verifyPassword = await bcrypt.compare(user.password, userRow.passwords)
                
                if (verifyPassword) {
                    const user = { firstname: userRow.firstname, lastname: userRow.lastname, phone: userRow.phone, email: userRow.email, role: userRow.role }
                    const token = jwtSign(user)
                    
                    await redisClient.set("token", token, { "EX": 60 * 60 * 24 * 7 }) // 7 days expiration

                    const reason = { success: true, reason: "", token, role: userRow.role }
                    res.json(reason)
                    return
                } else {
                    const reason = { success: false, reason: "Incorrect Password" }
                    client.release()
                    res.json(reason)
                    return
                }
            } else {
                const reason = { success: false, reason: "User Not Found" }
                
                client.release()
                res.json(reason)
                return
            }
        } else {
            const issues: z.ZodIssue [] = []
            parsedUser.error.issues.forEach(issue => issues.push(issue))

            const reason = { success: false, reason: "Wrong Format", issues: issues }
         
            res.json(reason)
            return
        }
    } catch (e) {
        const reason = { success: false, reason: "Internal Server Error" }
      
        res.json(reason)
        return
    }
}

export const signUpController = async (req : Request, res : Response) : Promise<void> => {
    try {
        const user = req.body
        user.role = user.role ?? "Customer"

        const userSchema = z.object({
            firstName: z.string().min(1, "First name is required"),
            lastName: z.string().min(1, "Last name is required"),
            email: z.string().email("Invalid Email"),
            phone: z.string().length(10, "Phone number must have 10 digits"),
            password: z.string().min(8, "Password should have atleast 8 characters"),
            role: z.enum(["Customer", "Merchant"], { errorMap: () => ({ message: "Role must be either admin or user" }) }),
            confirmPassword: z.string().min(8, "Confirm Password should have atleast 8 characters")
        }).refine((data) => data.password === data.confirmPassword, {
            message: "Password and Confirm Password must match",
            path: ["confirmPassword", "password"]
        })

        const userParsed = userSchema.safeParse(user)

        if (userParsed.success) {
            const client = await connectdb()
            if (!client) {
                const reason = { success: false, reason: "Database Server Error" }
                res.json(reason);
                return
            }

            const checkUserQuery = "SELECT email, phone FROM users WHERE email = $1 OR phone = $2";
            const { rows } = await client.query(checkUserQuery, [user.email, user.phone]);

            if (rows?.length > 0) {
                const reason = { success: false, reason: "Email or Phone No is already in use" }
                client.release()
                res.json(reason)
                return
            } else {
                const salt = await bcrypt.genSalt(12)
                const hashedPassword = await bcrypt.hash(user.password, salt)
                
                const query = "INSERT INTO users (firstname, lastname, phone, email, passwords, role, salt) VALUES ($1, $2, $3, $4, $5, $6, $7)"
                client.query(query, [user.firstName, user.lastName, user.phone, user.email, hashedPassword, user.role, salt])

                const reason = { success: true, reason: "" }
                client.release()
                res.json(reason)
                return
            }
            
        } else {
            const reason = { success: false, reason: "Wrong Format", issues: userParsed.error.issues }
            res.json(reason)
            return
        }        
    } catch (e) {
        const reason = { success: false, reason: "Internal Server Error" }
        res.json(reason)
        return
    }
}

export const tryLoginController = async (req: Request, res: Response) : Promise<void> => {
    const redis = await connectRedis()

    if (!redis) {
        const reason = { success: false, reason: "Redis Server Error" }
        res.json(reason);
        return
    }

    const token = await redis.get("token")

    if (!token) {
        const reason = { success: false, reason: "Token Not Found" }
        res.json(reason);
        return
    }

    const decoded = jwtVerify(token)

    if (!decoded) {
        const reason = { success: false, reason: "Token Expired" }
        res.json(reason);
        return
    }

    const reason = { success: true, reason: "", token, role: decoded.role }
    res.json(reason);
    return
}