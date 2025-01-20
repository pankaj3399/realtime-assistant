import CallToAction from "@/components/CallToAction"
import Features from "@/components/Features"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import Hero from "@/components/Hero"

const LandingPage = () => {
  return (
    <div className="font-universe">
      <Header />
      <main>
        <Hero />
        <Features />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage