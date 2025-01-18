import Analysis from "../model/analysisModel.js";
import User from "../model/userModel.js";

export const signup = async (req, res)=>{
    try{
        const data = req.body
        const existUser = await User.findOne({clerkId: data.clerkId})
        if(existUser){
            existUser.$set(data)
            await existUser.save()
            return res.status(200).json({existUser})
        }
        const user = await User.create(data)
        res.status(200).json({
            user
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error in Signup"
        })
    }
    
}

export const getUser = async (req, res)=>{
    try{
        const clerkId = req.params.clerkId
        
        const user = await User.findOne({clerkId})
        if(!user) return res.status(404).json({
            message: "User Not Found"
        })
        res.status(200).json({
            user
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error in Getting user"
        })
    }
}

export const deleteAnalysis = async (req, res) => {
    try{
        const id = req.params.id
        const analysis = await Analysis.findByIdAndDelete(id)
        if(!analysis) return res.status(404).json({
            message: "Analysis Not Found"
        })
        res.status(200).json({
            message:`Deleted ${analysis.name} Successfully.`
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error in Deleting Ananlysis"
        })
    }
}

export const getAllAnalysis = async (req, res) => {
    try{
        const clerkId = req.auth.userId;
        
        
        const user = await User.findOne({clerkId})
        if(!user) return res.status(404).json({
            message: "User Not Found"
        })

        const analysis = await Analysis.find({userId: user._id})
        res.status(200).json({
            analysis
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error in Getting Analysis"
        })
    }
}

export const getAnalysis = async (req, res) => {
    try{
        const id = req.params.id
        const analysis = await Analysis.findById(id)
        if(!analysis) return res.status(404).json({
            message: "Analysis Not Found"
        })
        res.status(200).json({
            analysis
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error in Getting Analysis"
        })
    }
}

