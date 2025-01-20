import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Buffer } from 'buffer';
import { Mic, MicOff } from 'lucide-react';
window.Buffer = Buffer;

const AudioRecorder = ({ ws, resume, addUserTranscript }: { ws: WebSocket, resume : () => Promise<void>, addUserTranscript: ()=>void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(ws.readyState === WebSocket.OPEN);
  const [status, setStatus] = useState(ws.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected');
  const wsRef = useRef<WebSocket | null>(ws);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(()=>{
    wsRef.current = ws;
    setIsConnected(ws.readyState === WebSocket.OPEN);
    setStatus(ws.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected');
    console.log(status);
    
  }, [ws, ws.readyState])
  let buffer: Uint8Array = new Uint8Array();

  function processAudioRecordingBuffer(data: Float32Array) {
    const pcmBuffer = convertFloat32ToPCM(data);
    combineArray(pcmBuffer);

    while (buffer.length >= 4800) {
      const toSend = new Uint8Array(buffer.slice(0, 4800));
      buffer = new Uint8Array(buffer.slice(4800));

      const regularArray = String.fromCharCode(...toSend);
      const base64 = btoa(regularArray);

      sendToWebSocket(base64);
    }
  }

  function combineArray(newData: Uint8Array) {
    const tempBuffer = new Uint8Array(buffer.length + newData.length);
    tempBuffer.set(buffer, 0);
    tempBuffer.set(newData, buffer.length);
    buffer = tempBuffer;
  }

  function sendToWebSocket(base64Data: string) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'audio_input',
          wsId: sessionStorage.getItem('ws_id'),
          data: base64Data,
        })
      );
    } else {
      console.error('WebSocket is not connected');
    }
  }

  function convertFloat32ToPCM(float32Array: Float32Array): Uint8Array {
    const pcmBuffer = new Uint8Array(float32Array.length * 2);
    const view = new DataView(pcmBuffer.buffer);

    for (let i = 0; i < float32Array.length; i++) {
      let sample = float32Array[i];
      sample = Math.max(-1, Math.min(1, sample)); // Clamp between -1 and 1
      view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); // Convert to 16-bit PCM
    }
    return pcmBuffer;
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording.');
      return;
    }

    try {
      await resume();
      addUserTranscript()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 24000 });
      const source = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // Get left channel
        processAudioRecordingBuffer(inputData);
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;
      scriptProcessorRef.current = scriptProcessor;

      

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };

  const stopRecording = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }
    setIsRecording(false);
  };

  return (
    <div className="">

      <div className="flex items-center gap-4">


        {
          isRecording ? <Button
          onClick={stopRecording}
          disabled={!isRecording}
          className='bg-orange-600 hover:bg-orange-700'
        >
          <MicOff /> Turn Off
        </Button>:<Button
          onClick={startRecording}
          disabled={isRecording || !isConnected}
          className='bg-orange-500 hover:bg-orange-600'
          >
          <Mic /> Turn On
        </Button>
        }

        
      </div>
    </div>
  );
};

export default AudioRecorder;
