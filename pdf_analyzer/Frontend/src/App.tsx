import {  useAuth } from '@clerk/clerk-react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import LandingPage from './pages/LandingPage';
import { useEffect } from 'react';
import { setAuthToken } from './api/axiosClient';
import Home from './pages/Home';
import AudioChatPage from './pages/AudioChatPage';
import GenerateReportPage from './pages/GenerateReport';


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isSignedIn } = useAuth();
  if(isSignedIn !== undefined)
  return isSignedIn ? children : <Navigate to="/signup" />;
};

export default function App() {
  const {isSignedIn, getToken} = useAuth()
  useEffect(()=>{
      const authUser = async () => {
        if(isSignedIn === undefined) return;
        const token = await getToken()
        setAuthToken(token)
      }
      authUser()
    },[isSignedIn])
  return (
    <Router>
      <Routes>
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/signin' element={<SignInPage />} />
        <Route path='/' element={<LandingPage />} />
        <Route path='/home' element={<Home />} />
        <Route path='/newaudiochat/:id' element={
          <ProtectedRoute>
            <AudioChatPage />
          </ProtectedRoute>
        } />
        <Route path='/generatereport/:id' element={
          <ProtectedRoute>
            <GenerateReportPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}
