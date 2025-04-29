import pkg from "pg"
import dotenv from "dotenv"
const { Pool } = pkg

dotenv.config()

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.PUSERNAME,
    port: Number(process.env.PORT),
    password: process.env.PASSWORD,
    database: process.env.DATABASE    
})

export const connectdb = async () => {
    try {
        const client = await pool.connect()
        console.log("Connected to database")
        return client
    } catch(e){
        console.log(`Error connecting to database: \n ${e}`)
    }
}
