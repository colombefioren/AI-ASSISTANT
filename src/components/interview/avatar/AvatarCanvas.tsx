"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { interviewerIds, interviewers, type Interviewer } from "@/lib/interviewers";
import { Avatar, preloadAvatar } from "./Avatar";
import type { AudioBridge } from "./types";

interface AvatarCanvasProps {
  interviewer: Interviewer;
  audio: React.RefObject<AudioBridge>;
  reduceMotion: boolean;
  onReady?: () => void;
}

export default function AvatarCanvas({ interviewer, audio, reduceMotion, onReady }: AvatarCanvasProps) {
  useEffect(() => {
    // Warm the cache for every avatar so switching interviewers is instant.
    interviewerIds.forEach((id) => preloadAvatar(interviewers[id].avatarUrl));
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 20, near: 0.05, far: 50, position: [0, 1.5, 2] }}
      aria-label={`${interviewer.name}, your interviewer`}
      role="img"
    >
      <hemisphereLight args={["#f3f6f4", "#2b302d", 1.1]} />
      <directionalLight position={[1.4, 2.2, 2.6]} intensity={1.8} />
      <directionalLight position={[-2.2, 1.4, 1.2]} intensity={0.55} />
      <directionalLight position={[0, 2.2, -2.6]} intensity={1.1} />
      <Suspense fallback={null}>
        <Avatar key={interviewer.id} interviewer={interviewer} audio={audio} reduceMotion={reduceMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
