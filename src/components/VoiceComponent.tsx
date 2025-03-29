// VoiceComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import Avatar3D from "./AvatarFemale";
import AvatarFemale from "./AvatarFemale";
import AvatarMale from "./AvatarMale";

const VoiceChat = ({ gender }: { gender: boolean }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    },
    onError: (error: string | Error) => {
      setErrorMessage(typeof error === "string" ? error : error.message);
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
  }, []);

  const handleStartConversation = async () => {
    try {
      const conversationId = await conversation.startSession({
        agentId: gender ? "dqte1WRSWX3A2bDNwJt5" : "zEMF3122dPrA9bMvf0Wl",
      });
      console.log("Started conversation:", conversationId);
    } catch (error) {
      setErrorMessage("Failed to start conversation");
      console.error("Error starting conversation:", error);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      setErrorMessage("Failed to end conversation");
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
    <div className="flex items-center gap-[5vw] flex-col sm:flex-row">
      {/* Animated background elements */}
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

      <Card className="max-w-md mx-auto z-10 bg-slate-800/70 backdrop-blur-sm border-slate-700/50 shadow-xl transition-all duration-500 transform hover:scale-[1.01] hover:shadow-2xl w-[40vw]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 font-semibold">
              Your AI Interviewer
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                disabled={status !== "connected"}
                className="bg-slate-700/50 hover:bg-slate-600/70 text-slate-200 hover:text-white transition-colors"
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
            <div className="flex justify-center">
              {status === "connected" ? (
                <Button
                  variant="destructive"
                  onClick={handleEndConversation}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  End Interview
                </Button>
              ) : (
                <Button
                  onClick={handleStartConversation}
                  disabled={!hasPermission}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105 rounded-full"
                  size="lg"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Start Interview
                </Button>
              )}
            </div>

            <div className="text-center text-sm space-y-2">
              {status === "connected" && (
                <p
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    isSpeaking
                      ? "bg-sky-500/20 text-sky-400 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {isSpeaking ? "Agent is speaking..." : "Listening..."}
                </p>
              )}
              {errorMessage && (
                <p className="text-rose-400 bg-rose-900/30 px-3 py-1 rounded-full inline-block">
                  {errorMessage}
                </p>
              )}
              {!hasPermission && (
                <p className="text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full inline-block">
                  Please allow microphone access to use voice chat
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className="z-10 w-[35vw] transition-all duration-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {gender ? (
          <AvatarFemale gender={gender} isSpeaking={isSpeaking} />
        ) : (
          <AvatarMale gender={gender} isSpeaking={isSpeaking} />
        )}
      </div>
    </div>
  );
};

export default VoiceChat;
