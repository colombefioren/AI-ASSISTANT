"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ParticleBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; left: string; top: string }>
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setParticles(newParticles);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-sky-400/20"
          initial={{
            left: particle.left,
            top: particle.top,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
          }}
          animate={{
            left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0.1, 0.3, 0.1],
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
  );
};

export default ParticleBackground;
