import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Buffer } from 'buffer';
import AudioRecorder from './RecorderComponent';
import { Button } from '../ui/button';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Square } from 'lucide-react';

const wsUrl = import.meta.env.VITE_WS_URL;

const AudioChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([""]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackNodeRef = useRef<AudioWorkletNode | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const {user} = useUser()
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || 
          (window as any).webkitAudioContext)({ sampleRate: 24000 });

        await audioContextRef.current.audioWorklet.addModule('/pcm_processor.js');
        await audioContextRef.current.audioWorklet.addModule('/playback_processor.js');

        playbackNodeRef.current = new AudioWorkletNode(
          audioContextRef.current,
          'playback-worklet'
        );

        playbackNodeRef.current.connect(audioContextRef.current.destination);

        console.log('Audio system initialized');
      } catch (error) {
        console.error('Failed to initialize audio system:', error);
      }
    };

    initAudio();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if(playbackNodeRef.current){
      playbackNodeRef.current.port.onmessage = (event) => {
        const data = event.data;
        if (data === 'done') {
          setIsPlaying(false);
        }
      };
    }
    console.log(isConnected);
    
  },[playbackNodeRef.current, audioContextRef.current])

  const stopAudio = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'running' && playbackNodeRef.current) {
      audioContextRef.current.suspend();
      playbackNodeRef.current.disconnect();
      playbackNodeRef.current = null;
      playbackNodeRef.current = new AudioWorkletNode(
        audioContextRef.current,
        'playback-worklet'
      );
      playbackNodeRef.current.connect(audioContextRef.current.destination);
      setIsPlaying(false);
    }
  }

  const connectWebSocket = () => {
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
      wsRef.current?.send(JSON.stringify({
        type: "session_update",
        session: {
          turn_detection: {
            type: "server_vad",
          },
          input_audio_transcription: {
            model: "whisper-1"
          },
        }
      }));
      wsRef.current?.send(JSON.stringify({
        type: 'start_new_chat',
        wsId: sessionStorage.getItem('ws_id'),
      }));
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    };

    wsRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'transcript':{
          setTranscripts(prev => prev.map((transcript, index) => {
            if (index === prev.length - 1) {
              return `${transcript}${message.data}`;
            }
            return transcript;
          }));
          setUploading(false)
        }
          break;
        case 'audio':
          try {
            console.log('Received audio chunk');
            await playAudioChunk(message.data);
          } catch (error) {
            console.error('Error processing audio message:', error);
          }
          break;
        case 'done':{
          console.log('Done processing');
          setTranscripts(prev => [...prev, ""]);
          break;
        }
        case 'id':{
          console.log('Received ID:', message.data);
          sessionStorage.setItem('ws_id', message.data);
          break;
        }
        case 'save_and_analyse_success':{
          setLoading(false)
          navigate("/home")
          break;
        }
        default:{
          console.log('Unknown message type:', message.type);
          setLoading(false)
        }
      }
      
      
    };
  };

  const playAudioChunk = async (base64Data: string) => {
    if (!playbackNodeRef.current) {
      console.error('Playback node not initialized');
      return;
    }

    try {
      const rawData = Buffer.from(base64Data, 'base64');
      const int16Data = new Int16Array(rawData.buffer);

      if (audioContextRef.current && audioContextRef.current?.state == 'suspended') 
        await audioContextRef.current.resume();
              

      
      setIsPlaying(true);
      // Send the data to the playback worklet
      playbackNodeRef.current.port.postMessage(Array.from(int16Data));

    } catch (error) {
      console.error('Error playing audio chunk:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    
    try {
      setUploading(true)
      // Read file as base64
      setFileName(file.name);
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      
  
      // Send to WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'process_pdf_file',
          wsId: sessionStorage.getItem('ws_id'),
          filename: file.name,
          fileData: base64
        }));
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
    } finally {
      console.log("Done");
      
    }
  };

  const saveAndAnalyse =useCallback( async () => {
    if (user && wsRef.current?.readyState === WebSocket.OPEN) {
      setLoading(true)
      wsRef.current.send(JSON.stringify({
        type: 'save_and_analyse',
        wsId: sessionStorage.getItem('ws_id'),
        transcripts: transcripts,
        fileName: fileName,
        clerkId: user.id
      }));
    }
  }, [transcripts, fileName, user]);


  return (
    <div className="flex-1 flex flex-col pb-24">

    
      <div className="flex items-center gap-4">
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      <div className='flex-1 overflow-y-auto'>
      {transcripts &&
        transcripts.map(
          (transcript, index) =>
            transcript && (
              <div
                key={index}
                className=" mt-1 p-4 bg-orange-100 border border-orange-500 rounded-lg"
              >
                <h3 className="font-semibold mb-2 text-orange-500">ReportWise:</h3>
                <p className="whitespace-pre-wrap">{transcript}</p>
              </div>
            )
        )}
      </div>


      <div className="flex flex-col gap-4 items-center fixed bottom-0 py-4 bg-white w-full">
       
        <div className="flex gap-4">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {uploading ? <Loader2 className='w-4 h-4 text-white animate-spin' /> : "Upload PDF"}
          </Button>
          
          {wsRef.current && (
            <AudioRecorder
              resume={async () => {
                if (
                  audioContextRef.current &&
                  audioContextRef.current.state === 'suspended'
                )
                  await audioContextRef.current.resume();
              }}
              ws={wsRef.current}
            />
          )}
          <Button
            onClick={saveAndAnalyse}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? <Loader2 className='w-4 h-4 text-white animate-spin' /> : "Save and Analyse"}
          </Button>
          {isPlaying && <Button
            onClick={stopAudio}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {<Square className='text-white w-5 h-5' />}
          </Button>}
        </div>
      </div>
</div>

  );
};

export default AudioChat;