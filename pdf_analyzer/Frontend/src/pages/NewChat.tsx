import ChatBox from '@/components/NewChat/chat-box'
import NavBar from '@/components/Home/navbar'

const NewChat = () => {
  return (
    <div className='min-h-screen flex flex-col font-inter'>
        <NavBar  back/>
        <ChatBox />
    </div>
  )
}

export default NewChat