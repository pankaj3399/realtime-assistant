import apiClient from '@/api/axiosClient';
import ChatBox from '@/components/Chat/chat-box'
import NavBar from '@/components/Home/navbar'
import axios from 'axios';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

const GenerateReportPage = () => {
    const {id} = useParams()
    const [pdfText, setPdfText] = useState("");
    const [response, setResponse] = useState("");
    const [name, setName] = useState("")
    const [date, setDate] = useState("")
    const [loading, setLoading] = useState(false)
    const [chat, setChat] = useState<string[]>([])
    const [transcripts, setTranscripts] = useState<any[]>([])
    const [error, setError] = useState("")
    const [analysis, setAnalysis] = useState<any>(null)
    const [loadingText, setLoadingText] = useState("")

    const editNameAndResponse = (name:string, response:string) => {
        setName(name)
        setResponse(response)
    }

    useEffect(()=>{
        getAnalysis()
    },[id])

    const regenrateReport = async () => {
        try{
          setLoading(true)
          setLoadingText("Regenerating report... This may take a while")
          const {data} = await apiClient.post(`/api/pdf/analyze`,{
            id,
            pdfData: pdfText.split(" "),
            conversation: transcripts.map((t:any) => `${t.role}: ${t.text}`)
          });

          if(data){
            setResponse(data.analysis.response)
            setName(data.analysis.name)
            setDate(data.analysis.createdAt)
            setChat(data.analysis.chat || [])
            setTranscripts(data.analysis.transcripts || [])
            setAnalysis(data.analysis)
          }
        }catch(err){
          console.log(err);
          if(axios.isAxiosError(err)){
            setError(err.message)
          }else{
            setError("Something went wrong!")
          }
        }finally{
          setLoading(false)
          setLoadingText("")
        }
    }

    const getAnalysis = async () => {
        try{
          setLoading(true)
          setLoadingText("Fetching data...")
          const res = await apiClient.get(`/api/users/analysis/${id}`);
          if(res.data){
              if(!res.data.analysis.analysed){
                setLoadingText("Analyzing data... This may take a while")
                const {data} = await apiClient.post(`/api/pdf/analyze`,{
                    id,
                    pdfData: res.data.analysis.pdfData,
                    conversation: res.data.analysis.transcripts.map((t:any) => `${t.role}: ${t.text}`)
                  });
    
                  if(data){
                    setPdfText(res.data.analysis.pdfData.join(" "))
                    setResponse(data.analysis.response)
                    setName(res.data.analysis.name)
                    setDate(res.data.analysis.createdAt)
                    setChat(res.data.analysis.chat || [])
                    setTranscripts(data.analysis.transcripts || [])
                    setAnalysis(data.analysis)
                  }
              }else{
                setPdfText(res.data.analysis.pdfData.join(" "))
                setResponse(res.data.analysis.response)
                setName(res.data.analysis.name)
                setDate(res.data.analysis.createdAt)
                setChat(res.data.analysis.chat || [])
                setTranscripts(res.data.analysis.transcripts || [])
                setAnalysis(res.data.analysis)
              }
          }
        }catch(err){
          console.log(err);
          if(axios.isAxiosError(err)){
            setError(err.message)
          }else{
            setError("Something went wrong!")
          }
        }finally{
          setLoading(false)
          setLoadingText("")
        }
      }
  return (
    <div className='min-h-screen flex flex-col font-inter'>
        <NavBar  back/>
        {loading && <div className='w-full h-full grid place-items-center text-orange-400'><Loader2Icon className='w-8 h-8  animate-spin' />{" "}{loadingText}</div>}
              {error && <div className='w-full text-center text-red-500'><p>{error}</p></div>}
        {response && id && <ChatBox analyzed={analysis.analysed} regenrateReport={regenrateReport} chat={chat} editNameAndResponse={editNameAndResponse} id={id} date={date} name={name} pdfText={pdfText} response={response} transcripts={transcripts} />}
    </div>
  )
}

export default GenerateReportPage
