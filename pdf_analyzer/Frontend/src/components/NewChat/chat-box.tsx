import { ChevronDown, ChevronRight, Clipboard, Loader2Icon } from "lucide-react";
import { useState } from "react";
import PdfForm from "./pdf-form";

const ChatBox = () => {
  const [pdfText, setPdfText] = useState("");
  const [response, setResponse] = useState("");

  const [isPdftextVisible, setIsPdfTextVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className=" flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
      {loading && <div className='w-full h-full flex justify-center gap-1 items-center text-orange-400'><Loader2Icon className='w-5 h-5 text-orange-400 animate-spin' /> Analyzing...</div>}
        <div className="p-2 flex flex-col gap-3">
          
          
          {pdfText && (
            <div className="bg-blue-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
                <div className="flex gap-1 items-center">
                    <h1 className="text-blue-500 font-bold">PDF Content:</h1>
                    <button className="text-blue-500" onClick={()=> setIsPdfTextVisible(!isPdftextVisible)}>{!isPdftextVisible ? <ChevronRight />:<ChevronDown />}</button>
                </div>
                {
                    isPdftextVisible && (
                        <div>
                            {pdfText}
                        </div>
                    )
                }
            </div>
          )}
        
          {response && (
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
        </div>
      </div>
      <PdfForm loading={loading} setResponse={setResponse} setLoading={setLoading} setPdfText={setPdfText} />
    </div>
  );
};

export default ChatBox;
