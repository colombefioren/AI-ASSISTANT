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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-sky-400/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
            }}
          />
        ))}
      </div>

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-sky-400" />
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            AI Interview Coach
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="#" className="text-slate-300 hover:text-white transition">
            Features
          </Link>
          <Link href="#" className="text-slate-300 hover:text-white transition">
            Pricing
          </Link>
          <Link href="#" className="text-slate-300 hover:text-white transition">
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
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-32">
        <div className="text-center">
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

        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 rounded-lg bg-white/10">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-xl"
        >
          <div className="bg-slate-800/50 p-4 backdrop-blur-sm border-b border-white/10">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 aspect-video flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="h-10 w-10 text-sky-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">
                AI Interview Simulation
              </h3>
              <p className="text-slate-300 mt-2">
                Experience realistic interviews with our AI-powered coach
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors font-medium text-sm"
              >
                Try Demo Now
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-white/10 mt-16 py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
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
