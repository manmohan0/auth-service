import { z } from "zod"
import { connectdb } from "../config/db"
import { Request, Response } from "express"

export const updateAccount = async (req : Request, res : Response) : Promise<void> => {
    const nameSchema = z.object({
        firstname: z.string().min(1, "Firstname is required").max(50, "Firstname is too long"),
        lastname: z.string().min(1, "Lastname is required").max(50, "Lastname is too long")
    })
    
    const emailSchema = z.object({
        email: z.string().email("Invalid Email")
    })
    
    const phoneSchema = z.object({
        phone: z.string().length(10, "Phone No should have 10 digits")
    })

    const client = await connectdb()

    if (!client) {
        const reason = { success: false, reason: "Internal Server Error" }
        res.json(reason)
        return
    }
    
    try {

        const { newDetails, user } = req.body

        const parsedName = nameSchema.safeParse(newDetails)
        const parsedEmail = emailSchema.safeParse(newDetails)
        const parsedPhone = phoneSchema.safeParse(newDetails)

        if (parsedName.success) {
            
            const query = `UPDATE users SET firstname = $1, lastname = $2 WHERE email = $3 RETURNING *`
            const result = await client.query(query, [newDetails.firstname, newDetails.lastname, user.email])

            const reason = { success: true, reason: "Name Updated Successfully", user: result.rows[0] }
            res.json(reason)

        } else if (parsedEmail.success) {

            const query = `UPDATE users SET email = $1 WHERE email = $2 RETURNING *`
            const result = await client.query(query, [newDetails.email, user.email])

            const reason = { success: true, reason: "Email Updated Successfully", user: result.rows[0] }
            res.json(reason)

        } else if (parsedPhone.success) {

            const query = `UPDATE users SET phone = $1 WHERE email = $2 RETURNING *`
            const result = await client.query(query, [newDetails.phone, user.email])

            const reason = { success: true, reason: "Phone No Updated Successfully", user: result.rows[0] }
            res.json(reason)

        } else {
            const reason = { success: false, reason: "Invalid Input" }
            res.json(reason)
        }
        return
        
    } catch (error) {
        
        const reason = { success: false, reason: "Internal Server Error" }
        res.json(reason)
        
    }

    client.release()
    return
}