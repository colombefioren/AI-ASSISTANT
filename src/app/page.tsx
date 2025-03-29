// import Avatar3D from "@/components/Avatar";
// page.tsx

"use client";

import BackButton from "@/components/ui/BackButton";
import Toggle from "@/components/ui/Toggle";
import VoiceComponent from "@/components/VoiceComponent";
import { useState } from "react";

export default function Home() {
  const [isMale, setIsMale] = useState(true);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <BackButton/>
        <Toggle setIsMale={setIsMale}/>
      
      <VoiceComponent gender={isMale}/>
    </main>
  );
}
