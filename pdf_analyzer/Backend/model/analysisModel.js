import mongoose from "mongoose"

const analysisSchema = new mongoose.Schema({
    pdfData:{type:[String], required: true, default:[]},
    userId:{type:mongoose.Types.ObjectId, ref:"User"},
    name:{type:String, required:true, default:"New Analysis"},
    createdAt:{type:String, default: Date.now()},
    response:{type:String, required:true, default:""},
    chat: {type: [String], default: []},
    transcripts: {type: [{
        role: {type: String, default: ""},
        text: {type: String, default: ""}
    }], default: []},
    analysed: {type: Boolean, default: false},
    reportUrl: {type: String, default: ""}
})

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis
