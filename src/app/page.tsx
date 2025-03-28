// import Avatar3D from "@/components/Avatar";
// page.tsx
import Toggle from "@/components/ui/Toggle";
import VoiceComponent from "@/components/VoiceComponent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toggle />
      <VoiceComponent />
    </main>
  );
}
