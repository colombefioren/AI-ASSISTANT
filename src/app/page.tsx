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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Animated background */}
      <ParticleBackground />

      <nav className="fixed top-0 left-0 right-0 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-sky-400" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              AI Interview Coach
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="#"
              className="text-slate-300 hover:text-white transition"
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-slate-300 hover:text-white transition"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-slate-300 hover:text-white transition"
            >
              About
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

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Hero Section */}
        <div className="w-full max-w-7xl mx-auto pt-24 pb-16 lg:pt-32 lg:pb-20 flex flex-col items-center">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
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
              className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto"
            >
              Practice with realistic AI interviewers, receive instant feedback,
              and gain the confidence to land your dream job.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex justify-center gap-4"
            >
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all flex items-center space-x-2 text-lg font-medium shadow-lg hover:shadow-sky-500/30"
              >
                <span>Start Practicing</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-lg font-medium border border-white/10 backdrop-blur-sm"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Features Section - Updated positioning */}
        <div className="w-full max-w-7xl mx-auto -mt-8">
          <motion.div
            id="features"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors"
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

        {/* Demo Preview Section - Perfect centering */}
        <div className="w-full max-w-7xl mx-auto flex justify-center items-center py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full max-w-3xl mx-6 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900/50 backdrop-blur-sm"
          >
            <div className="bg-slate-800/50 p-4 backdrop-blur-sm border-b border-white/10">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-12 aspect-video flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-sky-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">
                  AI Interview Simulation
                </h3>
                <p className="text-slate-300 text-lg mb-6">
                  Experience realistic interviews with our AI-powered coach
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all font-medium"
                >
                  Try Demo Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
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

            <div className="space-y-4">
              <h3 className="text-white font-medium">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-400 hover:text-white transition text-sm"
                  >
                    Features
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
                <li>
                  <Link
                    href="#"
                    className="text-slate-400 hover:text-white transition text-sm"
                  >
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
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

            <div className="space-y-4">
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

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400 mb-4 md:mb-0">
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
    </div>
  );
};

export default LandingPage;
