import { SignedIn, SignOutButton, UserButton } from '@clerk/clerk-react'
import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const NavBar = ({back}:{
  back?:boolean
}) => {
  const navigate = useNavigate()
  return (
    <nav className='flex items-center justify-between p-3'>
          <div className='text-xl font-bold flex items-center gap-2'>
            {!!back && <button onClick={()=> navigate(-1)}><ChevronLeft className='w-5 h-5' /></button>}
            <Link to={"/"}><img src='/logoNoText.png' className='w-16' /></Link>
          </div>
          <div className='flex items-center gap-2'>
            <SignedIn>
              <UserButton />
              <SignOutButton />
            </SignedIn>
          </div>
        </nav>
  )
}

export default NavBar