import { AssistantsClient, AzureKeyCredential } from "@azure/openai-assistants";
import dotenv from 'dotenv';
import { extractPdfTextBuffer } from '../utils/extractPdfText.js';
import Analysis from "../model/analysisModel.js";
import User from "../model/userModel.js";
dotenv.config()

export async function processWithAssistant(pdfBuffer, question) {
  const assistantsClient = new AssistantsClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
  );

  try {
    // Create an assistant
    const assistant = await assistantsClient.getAssistant(process.env.AZURE_OPENAI_ASSISTANT_ID);

    

    // Upload the PDF file
    const textChunks = await extractPdfTextBuffer(pdfBuffer)
    const thread = await assistantsClient.createThread();
    for (const chunk of textChunks) {
      await assistantsClient.createMessage(
        thread.id,
        "user",
        "Here's a part of the text: " + chunk
      );
    }

    // Create a thread

    // Add message to thread
    await assistantsClient.createMessage(
      thread.id,
      "user",
      question || "Please analyze this text given to you and provide key insights."
    );

    // Create and monitor run
    let run = await assistantsClient.createRun(thread.id, {
      assistantId: assistant.id
    });

    // Poll for completion
    while (run.status === "queued" || run.status === "in_progress") {
      let timeout = 10000
      await new Promise(resolve => setTimeout(resolve, timeout));
      if(timeout > 2000) timeout -= 2000
      run = await assistantsClient.getRun(thread.id, run.id);
    }

    // Get messages
    const messages = await assistantsClient.listMessages(thread.id);
    
    // Clean up

    return {messages: messages.data, pdfData: textChunks};
  } catch (error) {
    console.log(error);
    
    throw error;
  }
}

export async function processWithAssistantText(textToAnalyse, fileName, clerkId, chat) {
  const assistantsClient = new AssistantsClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
  );

  try {
    // Create an assistant
    const assistant = await assistantsClient.getAssistant(process.env.AZURE_OPENAI_ASSISTANT_ID);

    const thread = await assistantsClient.createThread();
    for (const chunk of textToAnalyse) {
      await assistantsClient.createMessage(
        thread.id,
        "user",
        "Here's a part of the text I got from audio assistant as response : " + chunk
      );
    }

    // Create a thread

    // Add message to thread
    await assistantsClient.createMessage(
      thread.id,
      "user",
      "Please analyze this text given to you and provide key insights."
    );

    // Create and monitor run
    let run = await assistantsClient.createRun(thread.id, {
      assistantId: assistant.id
    });

    // Poll for completion
    while (run.status === "queued" || run.status === "in_progress") {
      let timeout = 10000
      await new Promise(resolve => setTimeout(resolve, timeout));
      if(timeout > 2000) timeout -= 2000
      run = await assistantsClient.getRun(thread.id, run.id);
    }

    // Get messages
    const messages = await assistantsClient.listMessages(thread.id);

     const analysis = messages.data.map(message => {
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
    
    const user = await User.findOne({clerkId});
    if(user)
    await Analysis.create({
      pdfData: textToAnalyse,
      userId: user._id,
      name: fileName,
      response: reducedResponse,
      chat: chat || []
    })

    return {messages: messages.data, pdfData: textToAnalyse};
  } catch (error) {
    console.log(error);
    
    throw error;
  }
}


export async function generateReport(pdfData, prevConvo) {
  try{
    const assistantsClient = new AssistantsClient(
      process.env.AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
    );    
    const assistant = await assistantsClient.getAssistant(process.env.AZURE_OPENAI_ASSISTANT_ID);
    const thread = await assistantsClient.createThread();
    for (const chunk of pdfData) {
      await assistantsClient.createMessage(
        thread.id,
        "user",
        "Here's a part of the file text: " + chunk
      );
    }
    for (const chunk of prevConvo) {
      await assistantsClient.createMessage(
        thread.id,
        "user",
        "This is part of previous conversation: " + chunk
      );
    }
    await assistantsClient.createMessage(
      thread.id,
      "user",
      "Please analyze this text given to you and provide key insights."
    );

    // Create and monitor run
    let run = await assistantsClient.createRun(thread.id, {
      assistantId: assistant.id
    });

    // Poll for completion
    while (run.status === "queued" || run.status === "in_progress") {
      let timeout = 10000
      await new Promise(resolve => setTimeout(resolve, timeout));
      if(timeout > 2000) timeout -= 2000
      run = await assistantsClient.getRun(thread.id, run.id);
    }

    // Get messages
    const messages = await assistantsClient.listMessages(thread.id);

    return {messages: messages.data};
  }catch(error){
    console.error("Error occurred:", error);
    return {error}; 
  }
}

