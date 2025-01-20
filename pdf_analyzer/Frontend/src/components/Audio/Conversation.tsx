import { useState, useEffect, useRef, useCallback } from 'react';
import { Buffer } from 'buffer';
import AudioRecorder from './RecorderComponent';
import { Button } from '../ui/button';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mic, Square } from 'lucide-react';
import apiClient from '@/api/axiosClient';
import { cn } from '@/lib/utils';

const wsUrl = import.meta.env.VITE_WS_URL;

const Conversation = ({analysis}:{
    analysis: any
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([...analysis.chat,""]);
  const [trans, setTrans] = useState<any[]>([...analysis.transcripts, {role: 'assistant', text: ''}]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackNodeRef = useRef<AudioWorkletNode | null>(null);
  const {user} = useUser()
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);


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
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.close();
      }
      
    };
  }, []);

  useEffect(() => {
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

          setTrans((prev) => {
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].role === 'assistant') {
                return prev.map((transcript, index) => {
                  if (index === i) {
                    // Update the found transcript
                    return { ...transcript, text: transcript.text + message.data };
                  }
                  return transcript;
                });
              }
            }
            return prev;
          });
          
          
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
          setTrans(prev => [...prev, {role: 'user', text: ''},{role: 'assistant', text: ''}])
          break;
        }
        case 'id':{
          console.log('Received ID:', message.data);
          sessionStorage.setItem('ws_id', message.data);
          break;
        }
        case 'user_transcript':{
          setTranscripts(prev => [...prev, message.transcript, ""]);
          setTrans((prev) => {
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].role === 'user') {
                return prev.map((transcript, index) => {
                  if (index === i) {
                    // Update the found transcript
                    return { ...transcript, text: transcript.text + message.transcript };
                  }
                  return transcript;
                });
              }
            }
            return prev;
          });
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

  

  const saveAndAnalyse =useCallback( async () => {
    setLoading(true)
     try {
      await apiClient.post('/api/pdf/saveconversation',{
        ...analysis,
        chat: transcripts,
        transcripts: trans
      })
      navigate("/home")
     } catch (error) {
       console.error('Error processing audio message:', error);
     }finally{
        setLoading(false)
     }
  }, [transcripts, trans,user]);


  const onStart = () => {
    if(wsRef.current && wsRef.current.readyState === WebSocket.OPEN){
      wsRef.current?.send(JSON.stringify({
        type: 'process_pdf_file',
        wsId: sessionStorage.getItem('ws_id'),
        analysis: analysis
      }));
      setIsStarted(true)
    }
   

  }


  return (
    <div className="flex-1 flex flex-col pb-24">
      <div className='flex-1 overflow-y-auto'>
      {trans &&
        trans.map(
          (transcript, index) =>
            transcript.text && (
              <div
                key={index}
                className={cn(`mt-2 p-3 rounded-lg ${transcript.role === 'user' ? 'bg-blue-200 border border-blue-500' : 'bg-orange-100 border border-orange-500'}`)}
              >
                <h3 className={`font-semibold mb-1 ${transcript.role === 'user' ? "text-blue-500":"text-orange-500"}`}>{transcript.role.toUpperCase()}</h3>
                <p className="whitespace-pre-wrap">{transcript.text}</p>
              </div>
            )
        )}
      </div>


      <div className="flex flex-col gap-4 items-center fixed bottom-0 py-4 bg-white w-full">
       
        <div className="flex gap-4">
          
          
          {wsRef.current && (
            <>
              {
                !isStarted && <Button
                onClick={onStart}
                className="bg-blue-500 hover:bg-blue-600" ><Mic /> Start</Button>
              }
              {
                isStarted && <AudioRecorder
                resume={async () => {
                  if (
                    audioContextRef.current &&
                    audioContextRef.current.state === 'suspended'
                  )
                    await audioContextRef.current.resume();
                }}
                ws={wsRef.current}
                addUserTranscript={()=>{
                  setTrans(prev => [...prev, {role: 'user', text: ''},{role: 'assistant', text: ''}])
                }}
              />
              }
            </>
          )}


          {<Button
            onClick={stopAudio}
            className="bg-blue-500 hover:bg-blue-600 hidden"
            disabled={!isPlaying}
          >
            {<Square className='text-white bg-white rounded-sm w-5 h-5' />}
          </Button>}
          <Button
            onClick={saveAndAnalyse}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? <Loader2 className='w-4 h-4 text-white animate-spin' /> : "Save and Close"}
          </Button>
          
        </div>
      </div>
</div>

  );
};

export default Conversation;
 
