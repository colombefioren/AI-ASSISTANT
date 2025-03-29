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

// Hero Section Component
const HeroSection = () => {
  return (
    <div className="w-full max-w-7xl mx-auto pt-24 pb-12 lg:pt-32 lg:pb-16 px-4 sm:px-6">
      <div className="text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white"
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
          className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto"
        >
          Practice with realistic AI interviewers, receive instant feedback,
          and gain the confidence to land your dream job.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4"
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
const FeaturesSection = ({ features }) => {
  return (
    <div id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Key Features</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Everything you need to master your interview skills and land your dream job
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-lg bg-white/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
            </div>
            <p className="text-slate-300">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Demo Preview Section Component
const DemoPreviewSection = () => {
  return (
    <div className="w-full bg-gradient-to-r from-slate-800/70 to-slate-900/70 py-20 mt-8 border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Try Our AI Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Simulator</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8">
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
                  <span className="ml-3 text-slate-300">{item}</span>
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
            className="lg:w-1/2"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-slate-800/80 p-4 backdrop-blur-sm border-b border-white/10">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 px-2 py-0.5 text-xs text-slate-400 border border-slate-700 rounded bg-slate-800/90">AI Interview Session</div>
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
                    <p className="text-slate-300">Tell me about a time when you had to solve a complex problem. What was your approach?</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                        <UserCheck className="h-4 w-4 text-slate-300" />
                      </div>
                      <span className="font-medium text-white">You</span>
                    </div>
                    <div className="flex items-center text-slate-300 animate-pulse">
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

// Navbar Component
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
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
            className="text-slate-300 hover:text-white transition"
          >
            Features
          </Link>
          <Link
            href="#demo"
            className="text-slate-300 hover:text-white transition"
          >
            Demo
          </Link>
          <Link
            href="#"
            className="text-slate-300 hover:text-white transition"
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
        {/* Mobile menu button would go here */}
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-sky-400" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                AI Interview Coach
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Your personal AI interviewer that helps you practice, improve,
              and land your dream job.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link
                href="#"
                className="text-slate-400 hover:text-sky-400 transition"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-sky-400 transition"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-sky-400 transition"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-medium">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#demo"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Demo
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-medium">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-medium">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-slate-400 mb-4 sm:mb-0">
            © {new Date().getFullYear()} Infinite Loopers. All rights
            reserved.
          </p>
          <Link
            href="/login"
            className="text-sky-400 hover:text-sky-300 font-medium flex items-center text-sm"
          >
            Get Started <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const features = [
    {
      icon: <Mic className="w-6 h-6 text-sky-500" />,
      title: "Realistic Interviews",
      description: "Practice with AI that mimics real interview scenarios",
    },
    {
      icon: <UserCheck className="w-6 h-6 text-sky-500" />,
      title: "Personalized Feedback",
      description: "Get actionable insights to improve your performance",
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-sky-500" />,
      title: "Progress Tracking",
      description: "Monitor your improvement over time",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated background */}
      <ParticleBackground />

      {/* Navbar */}
      <Navbar />

      <main className="relative z-10 flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection features={features} />

        {/* Demo Preview Section */}
        <section id="demo">
          <DemoPreviewSection />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;