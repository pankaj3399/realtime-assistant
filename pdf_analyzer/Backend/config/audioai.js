import { AzureKeyCredential } from "@azure/core-auth";
import { LowLevelRTClient } from "rt-client";
import dotenv from "dotenv";
dotenv.config();

const getClient=  async () => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = "Abfrage_EVIM";
  if (!endpoint || !deployment) {
    throw new Error("You didn't set the environment variables.");
  }
  const client = new LowLevelRTClient(
    new URL(endpoint),
    new AzureKeyCredential(apiKey),
    { deployment: deployment }
  );

  return client;
}

const processPdf = async (client, ws, pdfText = null) => {
  try {
    const text =
      pdfText || "Tell user that no pdfText reached to you in polite manner";
    const id = new Date().getTime();
    await client.send({
      type: "conversation.item.create",
      item: {
        role: "user",
        content: [
          {
            text: `This is the pdf text you need to analyze: ${text}`,
            type: "input_text",
          },
        ],
        type: "message",
        id: id.toString(),
      },
    });
    await client.send({
      type: "response.create",
      response: {
        modalities: ["audio", "text"],
        instructions: `User has uploaded the text as an conversation item just now, proceed with it.`,
      },
    });

    await handleRealTimeMessages(client, null, ws);
  } catch (error) {
    console.error("Error occurred:", error);
    throw error;
  } finally {
    client.close();
  }
};

const handleRealTimeMessages = async (client, messageCallback, ws) => {
  for await (const message of client.messages()) {
    if (messageCallback) {
      await messageCallback(message);
    }
    // console.log("Received message:", message.type);

    switch (message.type) {
      case "response.done": {
        ws.send(
          JSON.stringify({
            type: "done",
            data: message,
          })
        );
        break;
      }
      case "error": {
        console.error(message.error);
        break;
      }
      case "response.audio_transcript.delta": {
        ws.send(
          JSON.stringify({
            type: "transcript",
            data: message.delta,
          })
        );
        break;
      }
      case "response.audio.delta": {
        ws.send(
          JSON.stringify({
            type: "audio",
            data: message.delta,
          })
        );
        break;
      }
      case "conversation.item.created": {
        const buffer = Buffer.from(message.item.content, "base64");
        console.log(`Received ${buffer.length} bytes of data.`);
        break;
      }
      case "input_audio_buffer.speech_started": {
        console.log("Speech started");
        break;
      }
      case "input_audio_buffer.speech_stopped": {
        console.log("Speech stopped");
        break;
      }
      case "conversation.item.input_audio_transcription.completed": {
        console.log("Transcription completed");
        ws.send(
          JSON.stringify({
            type: "user_transcript",
            transcript: message.transcript,
          })
        );
        break;
      }
      case "conversation.item.input_audio_transcription.failed": {
        console.log("Transcription Failed");
        break;
      }
      case "session.updated": {
        console.log("Session updated");
        break;
      }
      case "error": {
        ws.send(
          JSON.stringify({
            type: "error",
            message: message.error,
          })
        );
        break;
      }
    }

    if (message.type === "response.done" || message.type === "error") {
      break;
    }
  }
};


export { getClient, processPdf, handleRealTimeMessages };