import {
  Clipboard,
  Edit2Icon,
  Loader2,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import apiClient from "@/api/axiosClient";
import CustomUploadButton from "../Uploadthing/CustomUploadButton";
import { cn } from "@/lib/utils";

const ChatBox = ({
  response,
  name,
  date,
  id,
  editNameAndResponse,
  regenrateReport,
  analyzed,
  transcripts
}: {
  pdfText: string;
  response: string;
  name: string;
  date: string;
  id: string;
  chat: string[];
  editNameAndResponse: (name: string, response: string) => void;
  regenrateReport: () => Promise<void>;
  analyzed: boolean;
  transcripts: any[];
}) => {
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
          <div className="p-2 grid grid-cols-6 gap-3">
            

            {response && (
              <div className="col-span-5 md:max-h-[85vh] ">
                <div className="bg-orange-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
                <h5 className="text-orange-500 font-bold flex justify-between">
                  ReportWise Assistant:{" "}
                </h5>
                <textarea
                  className="w-full min-h-[75vh] p-4 mt-3 border custom-scrollbar border-gray-400 rounded-md"
                  value={formdata.response}
                  name="response"
                  onChange={onChange}
                />
              </div>
              </div>
            )}

              {name && date && (
              <div className="space-y-2 px-2">
                <div className="">
                  <input
                    className="font-bold text-xl p-2 border border-gray-400 rounded-md bg-transparent w-full"
                    value={formdata.name}
                    name="name"
                    onChange={onChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-none"
                    onClick={() => save()}
                  >
                    {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <><Save /> Save</>}
                  </Button>
                  <CustomUploadButton id={id} text={formdata.response} name={formdata.name} />
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white shadow-none"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <X /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex-1 flex flex-col">
      <div className="flex-1 ">
        <div className="p-2 grid grid-cols-6  gap-3">
          
          

          {response && !showChat && (
           <div className="md:max-h-[85vh] overflow-y-auto custom-scrollbar col-span-5 px-2 py-2">
             <div className="bg-orange-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter  ">
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
           </div>
          )}

         

          {transcripts && transcripts.length > 0 && showChat && (
            <div className="space-y-3 col-span-5 md:max-h-[85vh] overflow-y-auto py-2 px-2 custom-scrollbar">
              {transcripts.map((msg, index) => msg.text ? (
                
                <div key={index} className={cn(`border border-blue-500 p-3 rounded-md text-justify font-inter ${msg.role === 'user' ? 'bg-blue-200' : 'bg-orange-200'}`)}>
                <h5 className={cn(`text-${msg.role === 'user' ? 'blue' : 'orange'}-500 font-bold flex justify-between`)}>
                  {msg.role.toUpperCase()}
                </h5>
                <pre className="text-wrap font-inter">{msg.text}</pre>
              </div>
              ):null)}
            </div>
          )}
          {name && date && (
            <div className="flex flex-col w-full items-center">
              <div className="my-2">
                <p className="font-bold text-xl text-wrap">{name.length > 20 ? `${name.substring(0,20)}...`:name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(Number(date)).toDateString()}
                </p>
                
              </div>
              <div className="space-y-2">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-none w-full"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading || showChat}
                >
                  <Edit2Icon /> Edit
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-none w-full"
                  onClick={regenrateReport}
                  disabled={loading || !analyzed || showChat}
                >
                   <RefreshCw /> Regenerate
                </Button>
                <CustomUploadButton id={id} text={formdata.response} name={formdata.name} />
                <Button onClick={()=> setShowChat(!showChat)} className="bg-blue-500 hover:bg-blue-600 w-full">
                  {!showChat ? "Show Dialog" : "Show Report"} 
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
