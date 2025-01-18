import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#1f1f1f] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">ReportWise</h3>
            <p className="text-sm">Revolutionizing reporting with AI technology</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="#features" className="hover:text-[#D47517]">Features</Link></li>
              <li><Link to="#contact" className="hover:text-[#D47517]">Contact</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <p className="text-sm mb-2">Email: info@reportwise.com</p>
            <p className="text-sm">Phone: (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">&copy; 2023 ReportWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

