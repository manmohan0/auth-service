import { User } from "@/types";
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const jwtSign = (user : User) => {
    const token = jwt.sign(JSON.stringify(user), process.env.SECRET_KEY ?? "")
    return token
}

export const jwtVerify = (token : string) => {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY ?? "")
        return decoded as JwtPayload
    } catch (error) {
        console.error("JWT verification error:", error)
        return null
    }
}