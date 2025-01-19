import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { File as FileIcon } from 'lucide-react';
import { uploadFiles } from './UploadButton';
import jsPDF from 'jspdf';
import apiClient from '@/api/axiosClient';
import { useNavigate } from 'react-router-dom';

interface Props {
  text: string;
  name: string;
  id: string;
}

const CustomUploadButton = ({ text, name, id }: Props) => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const stripMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\n\n/g, '\n')
      .replace(/\\\n/g, '\n')
      .replace(/\\/g, '');
  };

  const createAndUploadPdf = async () => {
    setIsCreating(true);
    try {
      // Initialize jsPDF
      const doc = new jsPDF();
  
      // Extract data
      const cleanedText = stripMarkdown(text);
      const fileName = name.replace(".pdf", "");
      
      // Page setup
      const margin = { top: 20, left: 15, right: 15, bottom: 20 };
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - margin.left - margin.right;
  
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(fileName, margin.left, margin.top);
      doc.setLineWidth(0.5);
      doc.line(margin.left, margin.top + 5, pageWidth - margin.right, margin.top + 5);
  
      // Main content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
  
      const textLines = doc.splitTextToSize(cleanedText, contentWidth);
      let y = margin.top + 15;
  
      textLines.forEach((line:any) => {
        // Check if there's enough space for the next line
        if (y + 10 > pageHeight - margin.bottom) {
          doc.addPage();
          y = margin.top;
        }
        doc.text(line, margin.left, y);
        y += 7; // Line spacing
      });
  
     
  
      // Generate and upload PDF
      const pdfBlob = doc.output("blob");
      const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: "application/pdf" });
  
      const res = await uploadFiles("imageUploader", {
        files: [pdfFile],
      });
  
      if (res[0].url) {
        console.log("Uploaded Successfully at: ", res[0].url);
        await apiClient.put(`/api/pdf/analyze/${id}`, { reportUrl: res[0].url });
        navigate("/home");
      }
    } catch (error) {
      console.error("Error creating or uploading PDF:", error);
    } finally {
      setIsCreating(false);
    }
  };
  

  return (
    <div className="space-y-4 w-full max-w-lg">
      <Button 
        onClick={createAndUploadPdf}
        disabled={isCreating || !text.trim()}
        className="bg-blue-500 hover:bg-blue-600 w-full"
      >
        <FileIcon className="mr-2 h-4 w-4" />
        {isCreating ? 'Saving...' : 'Save as Document'}
      </Button>
    </div>
  );
};

export default CustomUploadButton;
