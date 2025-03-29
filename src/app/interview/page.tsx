"use client";

import BackButton from "@/components/ui/BackButton";
import MessageBubble from "@/components/ui/MessageBubble";
import Toggle from "@/components/ui/Toggle";
import VoiceComponent from "@/components/VoiceComponent";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const goBack = () => router.push("/");
  const [isMale, setIsMale] = useState(true);
  const [showBubble, setShowBubble] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!hasShown) {
      // Wait 1.5 seconds before showing
      const showTimer = setTimeout(() => {
        setShowBubble(true);
      }, 1500);

      // Hide after 5 seconds (3.5 seconds visible)
      const hideTimer = setTimeout(() => {
        setShowBubble(false);
        setHasShown(true);
      }, 5000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [hasShown]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MessageBubble show={showBubble} />
      <BackButton goBack={goBack} />
      <Toggle setIsMale={setIsMale} />

      <VoiceComponent gender={isMale} />
    </main>
  );
}
