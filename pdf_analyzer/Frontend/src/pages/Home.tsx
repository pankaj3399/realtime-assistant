import apiClient, { setAuthToken } from "@/api/axiosClient";
import "../index.css";
import NavBar from "@/components/Home/navbar";
import {
  ChevronRight,
  Download,
  File,
  Goal,
  Loader2Icon,
  MinusCircle,
  PlusCircleIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const authUser = async () => {
      if (isSignedIn === undefined) return;
      setLoading(true);
      const token = await getToken();
      setAuthToken(token);
      if (user && token) {
        await sendUserDataToBackend(
          user.id,
          user.emailAddresses[0].emailAddress
        );
        await getAllAnalysis();
      }
    };
    authUser();
  }, [isSignedIn, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("pdf", e.target.files[0]);
      setIsUploading(true);
      try {
        await apiClient.post("/api/pdf/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        await getAllAnalysis();
      } catch (error) {
        console.error("Error submitting PDF and question:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const sendUserDataToBackend = async (
    clerkId: string,
    email: string
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
    try {
      const res = await apiClient.get("/api/users/analysis");
      if (res.data) setAnalysis(res.data.analysis);
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        console.log(error);

        setError(err.message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const deleteAnalysis = async (id: string) => {
    try {
      setDeleteId(id);
      setIsDeleting(true);
      console.log(isDeleting);

      await apiClient.delete(`/api/users/analysis/${id}`);
      setAnalysis((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setIsDeleting(false);
      setDeleteId("");
      
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <NavBar />
      <div className="flex-1 grid grid-cols-12">
        <aside className="col-span-3 min-h-full bg-gray-100 rounded-xl">
          <div>
            {loading && (
              <div className="w-full h-full grid place-items-center py-4">
                <Loader2Icon className="w-8 h-8 text-orange-400 animate-spin" />
              </div>
            )}
            
            <div className=" max-h-[81vh] overflow-y-auto custom-scrollbar border-b-2 border-black">
            {analysis &&
              analysis.map((a, index) => (
                <div
                  key={index}
                  className="px-4 py-2 border-b border-gray-200 flex justify-between items-center"
                >
                  <div className="flex items-center justify-between w-full text-xs">
                    <h2 className=" font-semibold flex items-center">
                      <ChevronRight size={16} />
                      {a.name.length > 25
                        ? a.name.slice(0, 25) + "..."
                        : a.name}
                    </h2>
                    <Button
                      onClick={() => deleteAnalysis(a._id)}
                      className="bg-transparent hover:bg-transparent text-red-500 shadow-none p-0"
                    >
                      {
                        isDeleting && deleteId === a._id ? (
                          <Loader2Icon className="w-4 h-4 text-red-500 animate-spin" />
                        ) : (
                          <MinusCircle size={16} />
                        )
                      }
                    </Button>
                  </div>
                </div>
              )).reverse()}
            
            </div>

            <div className="p-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                id="pdf-upload"
                disabled={loading}
              />
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="bg-transparent hover:bg-transparent text-green shadow-none w-full p-2 flex items-center gap-3 font-semibold"
              >
                {
                  isUploading ? (
                    <Loader2Icon size={24} className=" text-green animate-spin text-green" />
                  ) : (
                    <PlusCircleIcon size={24} className="text-white bg-green-500 rounded-full" />
                  )
                }{" "}
                Add New
              </button>
            </div>
          </div>
        </aside>
        <main className="col-span-9 min-h-full ">
          {analysis.length <= 0 && (
            <div className="w-full text-center text-gray-400 p-3">
              <p>No analysis found</p>
            </div>
          )}
          {analysis.length > 0 && (
            <div className="space-y-2">
              {analysis.map((item) => (
                <div key={item._id} className="p-2 grid grid-cols-6 gap-2 ">
                  <div className="overflow-hidden col-span-3">
                    <h3 className="text-wrap font-semibold">{item.name}</h3>
                    <p className="text-xs">{new Date(Number(item.createdAt)).toDateString()}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/newaudiochat/${item._id}`)}
                      className="flex items-center gap-1 text-xs p-2 bg-blue-500 rounded-md text-white"
                    >
                      <Goal className="w-4 h-4" />  Start Conversation
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/generatereport/${item._id}`)}
                      className="flex items-center gap-1 text-xs p-2 bg-blue-500 rounded-md text-white"
                    >
                      <File className="w-4 h-4" />  Generate Report
                    </button>
                  </div>
                  <div>
                    <a
                      href={item.reportUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        disabled={!item.reportUrl}
                        className="flex items-center gap-1 text-xs p-2 bg-orange-500 rounded-md text-white disabled:bg-orange-300"
                      >
                        <Download className="w-4 h-4" /> Download Report
                      </button>
                    </a>
                  </div>
                </div>
              )).reverse()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
