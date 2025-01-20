import express from "express"
import { getUser, signup, deleteAnalysis, getAllAnalysis, getAnalysis } from "../controller/userController.js"

const userRouter = express.Router()


userRouter.post("/signup", signup)
userRouter.get("/getUser/:clerkId", getUser)
userRouter.get("/analysis",getAllAnalysis)
userRouter.get("/analysis/:id", getAnalysis)
userRouter.delete("/analysis/:id", deleteAnalysis)

export default userRouter