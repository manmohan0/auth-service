import { User } from "@/types";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const jwtSign = (user : User) => {
    const token = jwt.sign(JSON.stringify(user), process.env.SECRET_KEY ?? "")
    return token
}