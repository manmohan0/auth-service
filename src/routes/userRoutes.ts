import { Router } from "express";
import { updateAccount } from "../controllers/userController";

const userRoutes = Router();

userRoutes.post("/updateAccount", updateAccount);

export default userRoutes;