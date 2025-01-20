import { Button } from '@/components/ui/button'

export default function CallToAction() {
  return (
    <section className="bg-[#1565C0] py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-universe mb-4">Ready to Transform Your Reporting?</h2>
        <p className="text-lg font-inter  mb-8">Join thousands of satisfied users and experience the power of AI-driven reports.</p>
        <Button className="bg-[#F28B19] hover:bg-[#D47517] text-white font-universe text-lg py-2 px-6">
          Get Started Now
        </Button>
      </div>
    </section>
  )
}

