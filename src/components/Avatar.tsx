"use client";

import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

const Avatar3D = ({ isSpeaking }: { isSpeaking: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const morphTargetManagerRef = useRef<BABYLON.MorphTargetManager | null>(null);
  const mouthAnimationRef = useRef<number | null>(null);
  const blinkAnimationRef = useRef<number | null>(null);

  const MOUTH_CLOSED = 0;
  const MOUTH_OPEN = 0.7;
  const MOUTH_SPEAK_SPEED = 300;

  const BLINK_INTERVAL_MIN = 3000; // Minimum time between blinks (ms)
  const BLINK_INTERVAL_MAX = 8000; // Maximum time between blinks (ms)
  const BLINK_DURATION = 200; // Duration of a blink (ms)
  const EYES_OPEN = 0;
  const EYES_CLOSED = 1;

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    scene.clearColor = BABYLON.Color4.FromHexString("#FFF");

    // Camera setup
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 2,
      0.2,
      new BABYLON.Vector3(0, 1.65, 0),
      scene
    );

    camera.attachControl(canvasRef.current, true);
    camera.lowerBetaLimit = Math.PI / 3;
    camera.upperBetaLimit = Math.PI / 1.7;

    // Lighting
    new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    const directionalLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(0, -1, 1),
      scene
    );
    directionalLight.intensity = 0.8;

    BABYLON.SceneLoader.ImportMesh(
      "",
      "https://models.readyplayer.me/",
      "67e6d3bd1dcd1166600ef5b7.glb",
      scene,
      (meshes, particleSystems, skeletons) => {
        if (skeletons.length > 0) {
          const skeleton = skeletons[0];

          // Find the morph target manager
          meshes.forEach((mesh) => {
            if (mesh.morphTargetManager) {
              morphTargetManagerRef.current = mesh.morphTargetManager;

              // Get morph targets using the official API
              const targetCount = mesh.morphTargetManager.numTargets;
              const targets = [];
              for (let i = 0; i < targetCount; i++) {
                const target = mesh.morphTargetManager.getTarget(i);
                targets.push(target);
              }

              console.log(
                "Morph Targets:",
                targets.map((t) => t.name)
              );

              mesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5); // Example scale (increase size by 1.5x)
              mesh.position.y = -0.65;

              // Start blinking animation once model is loaded
              startBlinking();
            }
          });
        }
      }
    );

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => engine.resize());

    return () => {
      if (mouthAnimationRef.current) {
        cancelAnimationFrame(mouthAnimationRef.current);
      }
      if (blinkAnimationRef.current) {
        cancelAnimationFrame(blinkAnimationRef.current);
      }
      engine.dispose();
    };
  }, []);

  // Mouth animation
  useEffect(() => {
    if (!morphTargetManagerRef.current) return;

    // Cancel any existing mouth animation
    if (mouthAnimationRef.current) {
      cancelAnimationFrame(mouthAnimationRef.current);
    }

    const animateMouth = () => {
      if (!isSpeaking) {
        // Reset mouth to closed when not speaking
        const mouthTarget = findMorphTarget(["mouth", "viseme"]);
        if (mouthTarget) {
          mouthTarget.influence = MOUTH_CLOSED;
        }
        return;
      }

      const startTime = Date.now();
      const duration = MOUTH_SPEAK_SPEED;

      const step = () => {
        if (!isSpeaking) {
          const mouthTarget = findMorphTarget(["mouth", "viseme"]);
          if (mouthTarget) {
            mouthTarget.influence = MOUTH_CLOSED;
          }
          return;
        }

        const elapsed = Date.now() - startTime;
        const openness =
          MOUTH_CLOSED +
          Math.abs(Math.sin((elapsed / duration) * Math.PI)) *
            (MOUTH_OPEN - MOUTH_CLOSED);

        const mouthTarget = findMorphTarget(["mouth", "viseme"]);
        if (mouthTarget) {
          mouthTarget.influence = openness;
        }

        mouthAnimationRef.current = requestAnimationFrame(step);
      };

      mouthAnimationRef.current = requestAnimationFrame(step);
    };

    animateMouth();

    return () => {
      if (mouthAnimationRef.current) {
        cancelAnimationFrame(mouthAnimationRef.current);
      }
    };
  }, [isSpeaking]);

  // Helper function to find morph targets by name
  // Helper function to find morph targets by name with proper typing
  const findMorphTarget = (keywords: string[]): BABYLON.MorphTarget | null => {
    if (!morphTargetManagerRef.current) return null;

    // Use the official API to get targets
    const targetCount = morphTargetManagerRef.current.numTargets;

    for (let i = 0; i < targetCount; i++) {
      const target = morphTargetManagerRef.current.getTarget(i);
      if (
        keywords.some((keyword) =>
          target.name.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        return target;
      }
    }

    return null;
  };

  // Blinking animation
  const startBlinking = () => {
    const blink = () => {
      const blinkStartTime = Date.now();
      const eyesTarget = findMorphTarget(["blink", "eye"]);

      if (!eyesTarget) return;

      const blinkStep = () => {
        const elapsed = Date.now() - blinkStartTime;

        if (elapsed < BLINK_DURATION) {
          // Closing eyes
          const progress = elapsed / BLINK_DURATION;
          eyesTarget.influence =
            EYES_OPEN + (EYES_CLOSED - EYES_OPEN) * progress;
          blinkAnimationRef.current = requestAnimationFrame(blinkStep);
        } else if (elapsed < BLINK_DURATION * 2) {
          // Opening eyes
          const progress = (elapsed - BLINK_DURATION) / BLINK_DURATION;
          eyesTarget.influence =
            EYES_CLOSED - (EYES_CLOSED - EYES_OPEN) * progress;
          blinkAnimationRef.current = requestAnimationFrame(blinkStep);
        } else {
          // Blink complete, schedule next blink
          eyesTarget.influence = EYES_OPEN;
          const nextBlink =
            BLINK_INTERVAL_MIN +
            Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
          setTimeout(() => {
            blinkAnimationRef.current = requestAnimationFrame(blink);
          }, nextBlink);
        }
      };

      blinkAnimationRef.current = requestAnimationFrame(blinkStep);
    };

    // Start the first blink after a random delay
    const firstBlinkDelay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      blinkAnimationRef.current = requestAnimationFrame(blink);
    }, firstBlinkDelay);
  };

  return (
    <div
      className="w-full h-[500px] overflow-hidden"
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "transparent",
        border: "1px solid rgba(125, 211, 252, 0.3)",
        borderRadius: "20px",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(2, 132, 199, 0.15)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover"
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "transparent",
          display: "block",
        }}
      />
    </div>
  );
};

export default Avatar3D;
