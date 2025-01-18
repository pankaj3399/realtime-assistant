import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  Edit2Icon,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import apiClient from "@/api/axiosClient";

const ChatBox = ({
  pdfText,
  response,
  name,
  date,
  id,
  chat,
  editNameAndResponse
}: {
  pdfText: string;
  response: string;
  name: string;
  date: string;
  id: string;
  chat: string[];
  editNameAndResponse: (name: string, response: string) => void;
}) => {
  const [isPdftextVisible, setIsPdfTextVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formdata, setFormdata] = useState({ 
    name: name,
    response: response
   })


   const onChange = (e: any) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
   }

  const save = async () => {
    try {
      setLoading(true);
      await apiClient.put(`/api/pdf/analyze/${id}`, {
        response: formdata.response,
        name: formdata.name,
      });
      setIsEditing(false);
      editNameAndResponse(formdata.name, formdata.response);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className=" flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 flex flex-col gap-3">
            {name && date && (
              <div className="flex items-center">
                <div className="flex-1">
                  <input
                    className="font-bold text-xl p-2 border border-gray-400 rounded-md"
                    value={formdata.name}
                    name="name"
                    onChange={onChange}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-none"
                    onClick={() => save()}
                  >
                    {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <><Save /> Save</>}
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white shadow-none"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <X /> Cancel
                  </Button>
                </div>
              </div>
            )}

            {response && (
              <div className="bg-orange-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
                <h5 className="text-orange-500 font-bold flex justify-between">
                  ReportWise Assistant:{" "}
                </h5>
                <textarea
                  className="w-full min-h-[50vh] p-4 mt-3 border border-gray-400 rounded-md"
                  value={formdata.response}
                  name="response"
                  onChange={onChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 flex flex-col gap-3">
          {name && date && (
            <div className="flex items-center">
              <div className="flex-1">
                <p className="font-bold text-xl">{name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(Number(date)).toDateString()}
                </p>
                
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  className="bg-blue-500 text-white shadow-none"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2Icon /> Edit
                </Button>
                <Button onClick={()=> setShowChat(!showChat)} className="bg-blue-500 hover:bg-blue-600 ">
                  {!showChat ? "Show Chat" : "Show Report"} 
                </Button>
              </div>
            </div>
          )}
          {pdfText && (
            <div className="bg-blue-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
              <div className="flex gap-1 items-center">
                <h1 className="text-blue-500 font-bold">PDF Content:</h1>
                <button
                  className="text-blue-500"
                  onClick={() => setIsPdfTextVisible(!isPdftextVisible)}
                >
                  {!isPdftextVisible ? <ChevronRight /> : <ChevronDown />}
                </button>
              </div>
              {isPdftextVisible && <p>{pdfText}</p>}
            </div>
          )}

          {response && !showChat && (
            <div className="bg-orange-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
              <h5 className="text-orange-500 font-bold flex justify-between">
                ReportWise Assistant:{" "}
              </h5>
              <pre className="text-wrap font-inter">{response}</pre>
              <button
                className="w-5 h-5 block text-orange-500 mt-3"
                onClick={() => {
                  window.navigator.clipboard.writeText(response);
                }}
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          )}

          {chat && chat.length > 0 && showChat && (
            <div className="space-y-3">
              {chat.map((msg, index) => (
                <div key={index} className="bg-orange-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
                <h5 className="text-orange-500 font-bold flex justify-between">
                  ReportWise Assistant:{" "}
                </h5>
                <pre className="text-wrap font-inter">{msg}</pre>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
