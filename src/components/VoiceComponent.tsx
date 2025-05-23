"use client";

import React, { useEffect, useState } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarFemale from "./AvatarFemale";
import AvatarMale from "./AvatarMale";
import { FeedbackPopup } from "./ui/FeedbackPopup";

const VoiceChat = ({ gender }: { gender: boolean }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasConversationEnded, setHasConversationEnded] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateFeedback = () => {
    return [
      "Work on speaking more clearly in technical explanations",
      "Try to structure your answers using the STAR method",
      "Good demonstration of problem-solving skills",
      "Could provide more specific examples from your experience",
      "Excellent communication of complex concepts",
    ];
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsLoading(false);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsLoading(false);
    },
    onMessage: (message) => {
      console.log("Received message:", message);
      setShowGreeting(false);
    },
    onError: (error: string | Error) => {
      setErrorMessage(typeof error === "string" ? error : error.message);
      setIsLoading(false);
      console.error("Error:", error);
    },
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (error) {
        setErrorMessage("Microphone access denied");
        console.error("Error accessing microphone:", error);
      }
    };

    requestMicPermission();

    // Auto-hide greeting after 5 seconds if no message arrives
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleStartConversation = async () => {
    try {
      setIsLoading(true);
      const conversationId = await conversation.startSession({
        agentId: gender ? "dqte1WRSWX3A2bDNwJt5" : "zEMF3122dPrA9bMvf0Wl",
      });
      console.log("Started conversation:", conversationId);
    } catch (error) {
      setErrorMessage("Failed to start conversation");
      setIsLoading(false);
      console.error("Error starting conversation:", error);
    }
  };

  const handleEndConversation = async () => {
    try {
      setIsLoading(true);
      await conversation.endSession();
      setHasConversationEnded(true);
      setIsLoading(false);
      // Generate or fetch actual feedback here
      setFeedbackItems(generateFeedback());
    } catch (error) {
      setErrorMessage("Failed to end conversation");
      setIsLoading(false);
      console.error("Error ending conversation:", error);
    }
  };

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (error) {
      setErrorMessage("Failed to change volume");
      console.error("Error changing volume:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-[5vw] flex-col sm:flex-row"
    >
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-95" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent" />

        {isSpeaking && (
          <>
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-sky-500/10 filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div
              className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full bg-sky-400/15 filter blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </div>

      {/* Greeting Speech Bubble */}
      <AnimatePresence>
        {showGreeting && status === "connected" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-[25%] left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="relative bg-white rounded-xl p-4 shadow-lg max-w-xs sm:max-w-sm">
              <div className="text-slate-800 font-medium">
                Hello! Let's start your interview.
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="max-w-md mx-auto z-10 bg-slate-800/70 backdrop-blur-sm border-slate-700/50 shadow-xl transition-all duration-500 transform hover:scale-[1.01] hover:shadow-2xl w-[40vw]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 font-semibold">
              {gender ? "Ms. Coco" : "Mr. Mimi"}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                disabled={status !== "connected" || isLoading}
                className="bg-slate-700/50 hover:bg-slate-600/70 text-slate-200 hover:text-white transition-all duration-300 hover:scale-105"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              {status === "connected" ? (
                <Button
                  variant="destructive"
                  onClick={handleEndConversation}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300 hover:scale-105 rounded-full"
                  size="lg"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  End Interview
                </Button>
              ) : (
                <Button
                  onClick={handleStartConversation}
                  disabled={!hasPermission || isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105 rounded-full"
                  size="lg"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Start Interview
                </Button>
              )}

              <Button
                onClick={() => setShowFeedback(true)}
                disabled={!hasConversationEnded || isLoading}
                className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-105 rounded-full ${
                  !hasConversationEnded
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-purple-700 hover:to-indigo-700"
                }`}
                size="lg"
              >
                Show Feedback
              </Button>
            </div>

            <div className="text-center text-sm space-y-2">
              {status === "connected" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                    isSpeaking
                      ? "bg-sky-500/20 text-sky-400 animate-pulse border border-sky-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {isSpeaking ? "Agent is speaking..." : "Listening..."}
                </motion.p>
              )}
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 bg-rose-900/30 px-4 py-2 rounded-full inline-block border border-rose-500/30"
                >
                  {errorMessage}
                </motion.p>
              )}
              {!hasPermission && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-amber-400 bg-amber-900/30 px-4 py-2 rounded-full inline-block border border-amber-500/30"
                >
                  Please allow microphone access to use voice chat
                </motion.p>
              )}
              {isLoading && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sky-400 bg-sky-900/30 px-4 py-2 rounded-full inline-block border border-sky-500/30"
                >
                  Processing...
                </motion.p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <FeedbackPopup
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        feedbackItems={feedbackItems}
      />

      <motion.div
        className="z-10 w-[35vw] transition-all duration-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isHovered ? 1.05 : 1,
          rotate: isHovered ? 2 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {gender ? (
          <AvatarFemale gender={gender} isSpeaking={isSpeaking} />
        ) : (
          <AvatarMale gender={gender} isSpeaking={isSpeaking} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default VoiceChat;
