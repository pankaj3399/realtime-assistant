import apiClient, { setAuthToken } from '@/api/axiosClient'
import '../index.css'
import NavBar from '@/components/Home/navbar'
import { ArrowUpRight, Loader2Icon, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL;


const Home = () => {
  const {isSignedIn, getToken} = useAuth()
  const {user} = useUser()
  const [analysis, setAnalysis] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  useEffect(()=>{
    const authUser = async () => {
      if(isSignedIn === undefined) return;
      setLoading(true)
      const token = await getToken()
      setAuthToken(token)
      if(user && token){
        await sendUserDataToBackend(user.id, user.emailAddresses[0].emailAddress)
        await getAllAnalysis()
      }
    }
    authUser()
  },[isSignedIn, user])

  const sendUserDataToBackend = async (
    clerkId: string,
    email: string,
  ): Promise<void> => {
    try {
      await axios.post(`${API_URL}/api/users/signup`, {
        email,
        clerkId,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.status);
        console.error(error.response);
      } else {
        console.error(error);
      }
    }
  };


  const getAllAnalysis = useCallback(async () => {
    try{        
      const res = await apiClient.get("/api/users/analysis");
      if(res.data)
        setAnalysis(res.data.analysis)
    }catch(err){
      console.log(err);
      if(axios.isAxiosError(err)){
        console.log(error);
        
        setError(err.message)
      }else{
        setError("Something went wrong!")
      }
    }finally{
      setLoading(false)
    }
  },[apiClient])

  const deleteAnalysis = async (id:string) => {
    try{
      setIsDeleting(true)
      const res = await apiClient.delete(`/api/users/analysis/${id}`);
      if(res.data)
        getAllAnalysis()
    }catch(err){
      console.log(err);
      if(axios.isAxiosError(err)){
        setError(err.message)
      }else{
        setError("Something went wrong!")
      }
    }finally{
      setIsDeleting(false)
    }
  }

  return (
    <div className='min-h-screen flex flex-col font-inter'>
        <NavBar />
        <div className='flex-1 flex flex-col'>
          <div className=' p-3'>

            <Link to={"/newaudiochat"}>
              <button className='flex gap-1 bg-blue-500 rounded-xl text-white px-3 py-2 items-center hover:bg-blue-700'><Plus className='w-5 h-5' /> New</button>
            </Link>
          
          </div>
          <div className='flex-1 overflow-y-auto'>
              {loading && <div className='w-full h-full grid place-items-center'><Loader2Icon className='w-8 h-8 text-orange-400 animate-spin' /></div>}

              { analysis.length <= 0 ? <div className='w-full text-center text-gray-400 p-3'><p></p></div>:<div className='grid grid-cols-1 md:grid-cols-4 gap-3 p-3'>
                  {analysis.map(item => (
                    <div key={item._id} className='p-3 bg-white border border-orange-500 rounded-xl shadow-md flex flex-col'>
                      <h4 className='font-universe font-semibold text-wrap overflow-hidden hover:overflow-visible hover:bg-white hover:w-fit'>{item.name}</h4>
                      <p className='text-xs text-gray-500'>{item.response.substring(0,50)}...</p>
                      <div className='flex justify-between items-end mt-4 flex-1'>
                        <Link to={`/chat/${item._id}`} className='flex gap-1 items-center'>Open <ArrowUpRight className='w-4 h-4' /></Link>
                        <button onClick={()=> deleteAnalysis(item._id)}>{
                          isDeleting ? <Loader2Icon className='w-5 h-5 text-red-500 animate-spin' />:<Trash2 className='w-5 h-5 text-red-500' />  
                        }</button>
                      </div>
                    </div>
                  ))}  
              </div>}
          </div>
        </div>
    </div>
  )
}

export default Home