import apiClient from '@/api/axiosClient'
import Conversation from '@/components/Audio/Conversation'
import NavBar from '@/components/Home/navbar'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const AudioChatPage = () => {
  const params = useParams()
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(()=>{
    if(params.id){
      getAnalysis()
    }
  },[params])

  const getAnalysis = async () => {
    try{
      const res = await apiClient.get(`/api/users/analysis/${params.id}`);
      if(res.data){
          setAnalysis(res.data.analysis)
      }
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div className='p-2 min-h-screen flex flex-col font-inter'>
        <NavBar back />
        {analysis && <Conversation analysis={analysis} />}
    </div>
  )
}

export default AudioChatPage
