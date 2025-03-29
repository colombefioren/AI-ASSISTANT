"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mic,
  UserCheck,
  BarChart2,
  Sparkles,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react";
import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";
import VoiceComponent from "@/components/VoiceComponent";

// Navbar Component
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-900/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-sky-400" />
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            AI Interview Coach
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="#features"
            className="text-white hover:text-sky-400 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#demo"
            className="text-white hover:text-sky-400 transition-colors"
          >
            Demo
          </Link>
          <Link
            href="#pricing"
            className="text-white hover:text-sky-400 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all flex items-center space-x-1"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <div className="w-full max-w-7xl mx-auto pt-24 pb-12 lg:pt-32 lg:pb-16 px-4 sm:px-6 relative z-10">
      <div className="text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white motion-safe:animate-fade-in relative z-20"
        >
          Ace Your Next Interview with
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            {" "}
            AI Coaching
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg sm:text-xl text-white max-w-3xl mx-auto motion-safe:animate-fade-in relative z-20"
        >
          Practice with realistic AI interviewers, receive instant feedback,
          and gain the confidence to land your dream job.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4 motion-safe:animate-fade-in relative z-20"
        >
          <Link
            href="/login"
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 text-lg font-medium shadow-lg hover:shadow-sky-500/30"
          >
            <span>Start Practicing</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#features"
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-lg font-medium border border-white/10 backdrop-blur-sm"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: <Mic className="h-6 w-6 text-sky-400" />,
      title: "Real-time Voice Interaction",
      description: "Practice with AI interviewers that respond naturally to your voice, creating a realistic interview experience.",
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-sky-400" />,
      title: "Performance Analytics",
      description: "Get detailed insights into your interview performance with comprehensive analytics and feedback.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-sky-400" />,
      title: "AI-Powered Feedback",
      description: "Receive instant, personalized feedback on your responses to help you improve your interview skills.",
    },
  ];

  return (
    <div id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-12 motion-safe:animate-fade-in relative z-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Key Features</h2>
        <p className="text-white text-lg max-w-2xl mx-auto">
          Everything you need to master your interview skills and land your dream job
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-20"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 backdrop-blur-sm hover:bg-white/10 transition-colors motion-safe:animate-fade-in"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-lg bg-white/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
            </div>
            <p className="text-white text-base">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Demo Preview Section Component
const DemoPreviewSection = () => {
  return (
    <div id="demo" className="w-full bg-gradient-to-r from-slate-800/70 to-slate-900/70 py-20 mt-8 border-t border-b border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative z-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Try Our AI Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Simulator</span>
            </h2>
            <p className="text-white text-lg mb-8">
              Experience realistic interview scenarios with our AI-powered coach. Get instant feedback on your responses and improve your interview skills in real-time.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Practice common interview questions",
                "Receive instant feedback on your responses",
                "Track your progress over time",
                "Customize interviews for specific roles"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-sky-500/20 flex items-center justify-center mt-0.5">
                    <ArrowRight className="h-3 w-3 text-sky-400" />
                  </div>
                  <span className="ml-3 text-white">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-sky-500/30"
            >
              Start Your Demo Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative z-20"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-slate-800/80 p-4 backdrop-blur-sm border-b border-white/10">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 px-2 py-0.5 text-xs text-white border border-slate-700 rounded bg-slate-800/90">AI Interview Session</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8">
                <div className="flex flex-col h-64 md:h-80">
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700/50">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center mr-3">
                        <Sparkles className="h-4 w-4 text-sky-400" />
                      </div>
                      <span className="font-medium text-white">AI Interviewer</span>
                    </div>
                    <p className="text-white">Tell me about a time when you had to solve a complex problem. What was your approach?</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                        <UserCheck className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-white">You</span>
                    </div>
                    <div className="flex items-center text-white animate-pulse">
                      <span className="h-3 w-3 bg-sky-400 rounded-full mr-2"></span>
                      <span>Recording response...</span>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-center pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div className="px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/10">
                        Press Space to pause
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="w-full bg-slate-900/50 border-t border-white/10 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-sky-400" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                AI Interview Coach
              </span>
            </div>
            <p className="text-white">
              Empowering job seekers with AI-powered interview practice.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-white hover:text-sky-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-white hover:text-sky-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white hover:text-sky-400 transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white hover:text-sky-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white hover:text-sky-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white hover:text-sky-400 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-white hover:text-sky-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-white hover:text-sky-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-white hover:text-sky-400 transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-white">
          <p>&copy; {new Date().getFullYear()} AI Interview Coach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <div className="relative z-20">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <DemoPreviewSection />
        <Footer />
      </div>
    </main>
  );
}