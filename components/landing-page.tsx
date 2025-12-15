"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold text-[#2C2C2C]">Ivory's Choice</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-[#2C2C2C] hover:text-[#B8956A] transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-[#2C2C2C] hover:text-[#B8956A] transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm font-medium text-[#2C2C2C] hover:text-[#B8956A] transition-colors">Pricing</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/auth')}
                className="text-sm font-medium text-[#2C2C2C] hover:text-[#B8956A]"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth?signup=true')}
                className="bg-[#2C2C2C] text-white hover:bg-[#B8956A] transition-all duration-300 px-6"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-serif text-5xl lg:text-7xl font-bold text-[#2C2C2C] leading-tight">
                Your Perfect
                <br />
                <span className="text-[#B8956A]">Nail Design</span>
                <br />
                Awaits
              </h1>
              <p className="text-lg text-[#6B6B6B] leading-relaxed max-w-xl">
                Experience the future of nail artistry. AI-powered designs tailored to your style, 
                connected with expert technicians who bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => router.push('/auth?signup=true')}
                  className="bg-[#2C2C2C] text-white hover:bg-[#B8956A] transition-all duration-300 px-8 py-6 text-base"
                >
                  Start Creating
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/auth')}
                  className="border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white transition-all duration-300 px-8 py-6 text-base"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-[#FFF5F0] via-[#F5E6D3] to-[#FFE4E1]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Elegance Meets Innovation
            </h2>
            <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
              Discover a seamless experience from inspiration to appointment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-[#FAFAF8] hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-[#B8956A]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#B8956A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-3">AI-Powered Design</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                Transform your ideas into stunning nail designs with our advanced AI technology
              </p>
            </div>

            <div className="p-8 rounded-xl bg-[#FAFAF8] hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-[#B8956A]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#B8956A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-3">Expert Technicians</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                Connect with skilled nail artists who understand your vision and style
              </p>
            </div>

            <div className="p-8 rounded-xl bg-[#FAFAF8] hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-[#B8956A]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#B8956A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-3">Seamless Booking</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                Schedule appointments effortlessly and track your design journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Your Journey to Perfect Nails
            </h2>
            <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
              Four simple steps to transform your nail dreams into reality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Capture", desc: "Take a photo of your hands or upload inspiration" },
              { step: "02", title: "Design", desc: "AI generates personalized nail designs for you" },
              { step: "03", title: "Connect", desc: "Share your design with expert technicians" },
              { step: "04", title: "Book", desc: "Schedule your appointment and get pampered" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-serif font-bold text-[#B8956A]/20 mb-4">{item.step}</div>
                <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-3">{item.title}</h3>
                <p className="text-[#6B6B6B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
              Choose the plan that fits your style
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl border-2 border-[#E5E5E5] hover:border-[#B8956A] transition-all duration-300">
              <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#2C2C2C]">$9</span>
                <span className="text-[#6B6B6B]">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#B8956A] mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6B6B6B]">10 AI designs per month</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#B8956A] mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6B6B6B]">Basic support</span>
                </li>
              </ul>
              <Button className="w-full bg-[#2C2C2C] text-white hover:bg-[#B8956A] transition-all duration-300">
                Get Started
              </Button>
            </div>

            <div className="p-8 rounded-2xl border-2 border-[#B8956A] bg-[#B8956A]/5 hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#B8956A] text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#2C2C2C]">$29</span>
                <span className="text-[#6B6B6B]">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#B8956A] mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6B6B6B]">Unlimited AI designs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#B8956A] mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6B6B6B]">Priority support</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#B8956A] mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6B6B6B]">Advanced customization</span>
                </li>
              </ul>
              <Button className="w-full bg-[#B8956A] text-white hover:bg-[#2C2C2C] transition-all duration-300">
                Get Started
              </Button>
            </div>

            <div className="p-8 rounded-2xl border-2 border-[#E5E5E5] hover:border-[#B8956A] transition-all duration-300">
              <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#2C2C2C]">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#B8956A] mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6B6B6B]">Everything in Professional</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#B8956A] mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6B6B6B]">Dedicated account manager</span>
                </li>
              </ul>
              <Button className="w-full bg-[#2C2C2C] text-white hover:bg-[#B8956A] transition-all duration-300">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#2C2C2C] to-[#4A4A4A]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Style?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have discovered their perfect nail designs with Ivory's Choice
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/auth?signup=true')}
            className="bg-[#B8956A] text-white hover:bg-white hover:text-[#2C2C2C] transition-all duration-300 px-8 py-6 text-base"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif text-xl font-bold mb-4">Ivory's Choice</h3>
              <p className="text-white/60 text-sm">
                Redefining nail artistry with AI-powered design and expert craftsmanship
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#features" className="hover:text-[#B8956A] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[#B8956A] transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-[#B8956A] transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="/about" className="hover:text-[#B8956A] transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-[#B8956A] transition-colors">Contact</a></li>
                <li><a href="/careers" className="hover:text-[#B8956A] transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="/privacy-policy" className="hover:text-[#B8956A] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-[#B8956A] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2024 Ivory's Choice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
