import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  return (
    <header className="bg-white border-b border-gray-200 font-universe">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#1565C0]">
          <img src='/logo.svg' className='w-24' />
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li><a href="#features" className="text-[#1C1B1B] hover:text-[#1565C0]">Features</a></li>
            <li><a href="#contact" className="text-[#1C1B1B] hover:text-[#1565C0]">Contact</a></li>
          </ul>
        </nav>
        <Button onClick={()=>{
          navigate("/signin")
        }} className="bg-[#1E88E5] hover:bg-[#585857] text-white">Get Started</Button>
      </div>
    </header>
  )
}

