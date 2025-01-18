import apiClient from '@/api/axiosClient';
import ChatBox from '@/components/Chat/chat-box'
import NavBar from '@/components/Home/navbar'
import axios from 'axios';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

const Chat = () => {
    const {id} = useParams()
    const [pdfText, setPdfText] = useState("");
    const [response, setResponse] = useState("");
    const [name, setName] = useState("")
    const [date, setDate] = useState("")
    const [loading, setLoading] = useState(false)
    const [chat, setChat] = useState<string[]>([])
    const [error, setError] = useState("")

    const editNameAndResponse = (name:string, response:string) => {
        setName(name)
        setResponse(response)
    }

    useEffect(()=>{
        getAnalysis()
    },[id])

    const getAnalysis = async () => {
        try{
          setLoading(true)
          const res = await apiClient.get(`/api/users/analysis/${id}`);
          if(res.data){
              setPdfText(res.data.analysis.pdfData.join(" "))
              setResponse(res.data.analysis.response)
              setName(res.data.analysis.name)
              setDate(res.data.analysis.createdAt)
              setChat(res.data.analysis.chat || [])
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
        }
      }
  return (
    <div className='min-h-screen flex flex-col font-inter'>
        <NavBar  back/>
        {loading && <div className='w-full h-full grid place-items-center'><Loader2Icon className='w-8 h-8 text-orange-400 animate-spin' /></div>}
              {error && <div className='w-full text-center text-red-500'><p>{error}</p></div>}
        {response && id && <ChatBox chat={chat} editNameAndResponse={editNameAndResponse} id={id} date={date} name={name} pdfText={pdfText} response={response} />}
    </div>
  )
}

export default Chat