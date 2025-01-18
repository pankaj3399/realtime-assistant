import AudioChat from '@/components/Audio/AudioChat'
import NavBar from '@/components/Home/navbar'

const AudioChatPage = () => {
  return (
    <div className='p-2 min-h-screen flex flex-col font-inter'>
        <NavBar back />
        <AudioChat />
    </div>
  )
}

export default AudioChatPage