import { AssistantsClient, AzureKeyCredential } from "@azure/openai-assistants";
import dotenv from 'dotenv';
import fs from 'fs';
import { extractPdfText, extractPdfTextBuffer } from '../utils/extractPdfText.js';
import { generateReport, processWithAssistant } from '../config/assistant.js';
import Analysis from "../model/analysisModel.js"
import User from "../model/userModel.js"
dotenv.config();



export const saveConversation = async (req, res) => {
  try {
    const analysisId = req.body._id
    const analysis = await Analysis.findById(analysisId)
    if(!analysisId) return res.status(404).json({message: "Analysis Not Found."})
    
    analysis.$set({
      chat: req.body.chat,
      transcripts: req.body.transcripts
    })
    await analysis.save()
    
    res.json({
      success: true
    });

  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const userId = req.auth.userId

    if(!userId) return res.status(403).json({message: "Forbidden, Access Denied."})
    
    const pdfData = await extractPdfTextBuffer(req.file.buffer)
    const pdfDataString = pdfData.join(" ")

    const user = await User.findOne({clerkId: userId})

    if(!user) return res.status(404).json({message:"User Not found"})

    await Analysis.create({
      userId: user._id,
      pdfData: pdfDataString,
      response: "Not generated any response yet.",
      name: req.file.originalname
    })
    
    res.json({
      success: true
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const analyzeWitSavedData = async (req, res) => {
  try {
    const {id, pdfData, conversation } = req.body

    const {messages} = await generateReport(pdfData, conversation)

    const wellFormedMessages = messages.map(message => {
      return {
        role: message.role,
        content: message.content.map(c => c.type === 'text' ? c.text.value : null).filter(Boolean)
      };
    });
    const assistanceResponse = wellFormedMessages.map(message => {
      if(message.role == 'assistant')
        return message.content
      else
        return ""
    })

    const report = assistanceResponse.reduce((res, message) => res+message+" ","").trim()

    const analysis = await Analysis.findById(id)

    if(!analysis) return res.status(404).json({message:"Analysis Not found"})

    analysis.response = report;
    analysis.analysed = true;

    await analysis.save()
    
    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const analyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const userId = req.auth.userId

    if(!userId) return res.status(403).json({message: "Forbidden, Access Denied."})

    const question = req.body.question || null;
    const {messages, pdfData} = await processWithAssistant(req.file.buffer, question);

    // Extract text content from messages
    const analysis = messages.map(message => {
      return {
        role: message.role,
        content: message.content.map(c => c.type === 'text' ? c.text.value : null).filter(Boolean)
      };
    });
    const assistanceResponse = analysis.map(message => {
      if(message.role == 'assistant')
        return message.content
      else
        return ""
    })

    const reducedResponse = assistanceResponse.reduce((res, message) => res+message+" ","").trim()

    const user = await User.findOne({clerkId: userId})

    if(!user) return res.status(404).json({message:"User Not found"})

    await Analysis.create({
      userId: user._id,
      pdfData,
      response: reducedResponse,
      name: req.file.originalname
    })
    
    res.json({
      success: true,
      analysis: reducedResponse,
      pdfData
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const testAssistant =  async (req, res) => {
    try {
      const assistantsClient = new AssistantsClient(
        process.env.AZURE_OPENAI_ENDPOINT,
        new AzureKeyCredential(process.env.AZURE_OPENAI_KEY),
        
      );
      
      const assistant = await assistantsClient.getAssistant(process.env.AZURE_OPENAI_ASSISTANT_ID);
      
      res.json({
        success: true,
        message: 'Connection successful',
        assistantId: assistant.id
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
}

export const testPdf = async (req, res) => {
    try{
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }
      const pdfContent = fs.readFileSync(req.file.path);
      const chunks = await extractPdfText(pdfContent)
      fs.unlinkSync(req.file.path);
      res.send(chunks)
    }catch(Err){
      console.log(Err);
      res.send("err")
      
    }
  }

  export const editAnalysis = async (req, res) => {
    try {
      const { id } = req.params;
      const { response, name, reportUrl } = req.body;
      
  
      const analysis = await Analysis.findById(id);

      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }
      if(response) analysis.response = response;
      if(name) analysis.name = name;
      if(reportUrl) analysis.reportUrl = reportUrl;
      analysis.createdAt = Date.now();
      await analysis.save();

      res.json({
        success: true,
        analysis
      });
    }catch(error){
      console.log(error)
      res.status(500).json({
        success: false,
        error: JSON.stringify(error)
      });
    }
  }
