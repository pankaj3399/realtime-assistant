import express from 'express';
import pdfAnalyzerRouter from './routes/pdfAnalyzer.js';
import cors from "cors"
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import {clerkMiddleware} from "@clerk/express"
import dotenv from "dotenv"

import {createServer} from "http"
import { WebSocketServer } from 'ws';
import { getClient, handleRealTimeMessages, processPdf, processPdfWithDB } from './config/audioai.js';
import { extractPdfText } from './utils/extractPdfText.js';
import { processWithAssistantText } from './config/assistant.js';
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from './config/uploadthing.js';
dotenv.config()
const app = express();
const corsOptions = {
    origin: "*", 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    credentials: true, 
  };
app.use(express.json())
app.use(cors(corsOptions))
connectDB()

const server = createServer(app)
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', async (ws) => {
    try {
        console.log("Client connected");
    
        const connectionId = crypto.randomUUID();
        
        const aiClient = await getClient();
        
        clients.set(connectionId, { ws, aiClient, messages: [] });
        
        ws.send(JSON.stringify({ type: 'id', data: connectionId }));
    
        await aiClient.send({
          type: "session.update",
          session: {
            turn_detection: {
              type: "server_vad",
            },
            input_audio_transcription: {
              model: "whisper-1"
            },
          }
        });

        
    
        
        ws.on("message", async (message) => {
            try {
              const data = JSON.parse(message);
              const clientData = clients.get(data.wsId);
              
              if (!clientData) {
                throw new Error("Invalid connection ID");
              }
      
              const { ws, aiClient, messages } = clientData;
              
              switch (data.type) {
                case "process_pdf": {
                  const prevConvo = data.analysis.transcripts.map(trs => `${trs.role}:${trs.text}`).join(" ");
                  const pdfData = data.analysis.pdfData.join(" ")
                  await processPdfWithDB(aiClient, ws, pdfData, prevConvo);
                  break;
                }
                case "session_update": {
                  await aiClient.send({
                    ...data,
                    type: "session.update",
                  });
                  break;
                }
                case "audio_input": {
                  await aiClient.send({
                    type: "input_audio_buffer.append",
                    audio: data.data,
                  });
                  break;
                }
                case "process_pdf_file": {
                  const prevConvo = data.analysis.transcripts.map(trs => `${trs.role}:${trs.text}`).join(" ");
                  const pdfData = data.analysis.pdfData.join(" ")
                  await processPdfWithDB(aiClient, ws, pdfData, prevConvo);
                  await aiClient.send({
                    type: "response.create",
                    response: {
                      modalities: ["audio", "text"],
                      instructions: `Respond according to users question or instructions`,
                    },
                  });
                  break;
                }
                case "save_and_analyse":{
                  messages.push(...data.transcripts.map(trs => `This is response of audio assistant for reference: \n ${trs}`));
                  await processWithAssistantText(messages, data.fileName, data.clerkId, data.transcripts);
                  ws.send(JSON.stringify({
                    type: "save_and_analyse_success",
                    message: "Analysis Successful"
                  }))
                  break;
                }

                case "test":{
                  
                    ws.send(JSON.stringify({
                        type: "test",
                        message: "Test Successful"
                    }))
                    break;
                }
              }
      
              await handleRealTimeMessages(aiClient, null, ws);
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: error.message,
              }));
            }
          });

          ws.on("close", () => {
            console.log(`Client ${connectionId} disconnected`);
            const clientData = clients.get(connectionId);
            if (clientData) {
              clientData.aiClient.close();
              clients.delete(connectionId);
            }
          });

          ws.on("error", (error) => {
            console.error(`WebSocket error for client ${connectionId}:`, error);
            clients.delete(connectionId);
          });


    }catch (error) {
       console.error("Error during WebSocket connection setup:", error);
        ws.close();
    }
} )

app.use(clerkMiddleware())


app.use('/api/pdf', pdfAnalyzerRouter);
app.use('/api/users',userRouter);

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter
  }),
);

app.get("/", (req, res) => {
    res.send("Healthy Server")
})


const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
