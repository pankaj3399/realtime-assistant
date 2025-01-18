
import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'
import apiClient from '@/api/axiosClient'

const PdfForm = ({setResponse, setPdfText, setLoading, loading}:{
  setResponse: React.Dispatch<React.SetStateAction<string>>,
  setPdfText: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading:boolean
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [isResponded, setIsResponded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    if (!pdfFile) return

    const formData = new FormData()
    formData.append('pdf', pdfFile)
    formData.append('question', question)

    try {
      const res = await apiClient.post('/api/pdf/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Handle successful upload
      setResponse(res.data.analysis)
      setPdfText(res.data.pdfData)
      console.log('PDF and question submitted successfully')
      // Reset form
      setPdfFile(null)
      setQuestion('')
      setIsResponded(true)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      // Handle error
      console.error('Error submitting PDF and question:', error)
    }finally{
      setLoading(false)
    }
  }

  return (
      <div>
        {
            pdfFile && <div>
            <div className='flex gap-2 p-3 items-center'>Attached File:
                <div className='bg-blue-200/50 text-xs px-2 py-1 rounded-full flex items-center gap-1'>{pdfFile.name} <button onClick={()=>{
                  setPdfFile(null)
                }} className='font-light'><X className='w-3 h-3'/></button></div>    
             </div>
        </div>
        }
        <form onSubmit={handleSubmit} className="flex items-center space-x-4 bg-[#EAEAEA] p-4 rounded-md shadow-md">
      <div className="flex-grow">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id="pdf-upload"
          disabled={loading || isResponded}
        />
        <Label
          htmlFor="pdf-upload"
          className="flex items-center justify-center px-4 py-2 bg-[#1E88E5] text-white rounded-md cursor-pointer hover:bg-[#1565C0] transition-colors h-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {pdfFile ? 'Change' : 'Attach'}
        </Label>
      </div>
      
      <Input
        type="text"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="flex-grow border-[#D47517] focus:ring-[#1565C0]"
        disabled={!pdfFile}
      />
      
      <Button
        type="submit"
        className="bg-[#F28B19] hover:bg-[#D47517] text-white"
        disabled={!pdfFile || isResponded || loading}
      >
        Send
      </Button>
    </form>
    </div>
  )
}

export default PdfForm

