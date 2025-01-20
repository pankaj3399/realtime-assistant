import { SignUp, useUser, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function SignUpPage() {
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();


  useEffect(() => {
    if (isSignedIn === null || !clerkUser) return;

    const clerkId = clerkUser.id;
    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (isSignedIn && clerkId && email) {
      sendUserDataToBackend(clerkId, email);
      navigate("/home");
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (isSignedIn === null) return;
    if (isSignedIn) navigate("/home");
  }, [isSignedIn]);

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

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <SignUp
        signInUrl="/signin"
        forceRedirectUrl={"/home"}
        signInForceRedirectUrl={"/home"}
        
      />
    </div>
  );
}
