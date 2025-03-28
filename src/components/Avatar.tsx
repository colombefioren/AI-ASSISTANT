"use client";

import { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

const Avatar3D = ({ isSpeaking }: { isSpeaking: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const morphTargetManagerRef = useRef<BABYLON.MorphTargetManager | null>(null);
  const mouthAnimationRef = useRef<number | null>(null);
  const blinkAnimationRef = useRef<number | null>(null);

  // Animation parameters
  const MOUTH_CLOSED = 0;
  const MOUTH_OPEN = 0.7;
  const MOUTH_SPEAK_SPEED = 300;

  const BLINK_INTERVAL_MIN = 2000;
  const BLINK_INTERVAL_MAX = 5000;
  const BLINK_DURATION = 150;
  const EYES_OPEN = 0;
  const EYES_CLOSED = 1;

  // Store eye targets
  const leftEyeRef = useRef<BABYLON.MorphTarget | null>(null);
  const rightEyeRef = useRef<BABYLON.MorphTarget | null>(null);
  const bothEyesRef = useRef<BABYLON.MorphTarget | null>(null);

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
      (meshes) => {
        meshes.forEach((mesh) => {
          if (mesh.morphTargetManager) {
            morphTargetManagerRef.current = mesh.morphTargetManager;

            // Find and store eye targets
            leftEyeRef.current = findMorphTarget([
              "blink_L",
              "eyeBlink_L",
              "left_eye",
              "leftEyeClose",
            ]);
            rightEyeRef.current = findMorphTarget([
              "blink_R",
              "eyeBlink_R",
              "right_eye",
              "rightEyeClose",
            ]);
            bothEyesRef.current = findMorphTarget([
              "blink",
              "eye_close",
              "eyes_close",
            ]);

            console.log("Eye Targets:", {
              left: leftEyeRef.current?.name,
              right: rightEyeRef.current?.name,
              both: bothEyesRef.current?.name,
            });
            mesh.scaling = new BABYLON.Vector3(1.8, 1.8, 1.8); // Example scale (increase size by 1.5x)
            mesh.position.y = -0.9;

            startBlinking();
          }
        });
      }
    );

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());

    return () => {
      if (mouthAnimationRef.current)
        cancelAnimationFrame(mouthAnimationRef.current);
      if (blinkAnimationRef.current)
        cancelAnimationFrame(blinkAnimationRef.current);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (!morphTargetManagerRef.current) return;

    const mouthTarget = findMorphTarget(["mouth", "viseme"]);
    if (!mouthTarget) return;

    const animateMouth = () => {
      const startTime = Date.now();

      const animate = () => {
        if (!isSpeaking) {
          mouthTarget.influence = MOUTH_CLOSED;
          return;
        }

        const elapsed = Date.now() - startTime;
        const openness =
          MOUTH_CLOSED +
          Math.abs(Math.sin((elapsed / MOUTH_SPEAK_SPEED) * Math.PI)) *
            (MOUTH_OPEN - MOUTH_CLOSED);

        mouthTarget.influence = openness;
        mouthAnimationRef.current = requestAnimationFrame(animate);
      };

      mouthAnimationRef.current = requestAnimationFrame(animate);
    };

    if (mouthAnimationRef.current)
      cancelAnimationFrame(mouthAnimationRef.current);
    animateMouth();

    return () => {
      if (mouthAnimationRef.current)
        cancelAnimationFrame(mouthAnimationRef.current);
    };
  }, [isSpeaking]);

  const findMorphTarget = (keywords: string[]): BABYLON.MorphTarget | null => {
    if (!morphTargetManagerRef.current) return null;

    const targetCount = morphTargetManagerRef.current.numTargets;
    for (let i = 0; i < targetCount; i++) {
      const target = morphTargetManagerRef.current.getTarget(i);
      if (
        target.name &&
        keywords.some((k) =>
          target.name.toLowerCase().includes(k.toLowerCase())
        )
      ) {
        return target;
      }
    }
    return null;
  };

  const startBlinking = () => {
    const blink = () => {
      const blinkStartTime = Date.now();

      const animateBlink = () => {
        const elapsed = Date.now() - blinkStartTime;
        const progress = Math.min(elapsed / BLINK_DURATION, 1);

        // Smooth easing function
        const ease = (t: number) =>
          t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        if (elapsed < BLINK_DURATION) {
          // Closing eyes
          const closeProgress = ease(progress);
          const influence =
            EYES_OPEN + (EYES_CLOSED - EYES_OPEN) * closeProgress;

          if (leftEyeRef.current) leftEyeRef.current.influence = influence;
          if (rightEyeRef.current) rightEyeRef.current.influence = influence;
          if (bothEyesRef.current) bothEyesRef.current.influence = influence;

          blinkAnimationRef.current = requestAnimationFrame(animateBlink);
        } else if (elapsed < BLINK_DURATION * 2) {
          // Opening eyes
          const openProgress = ease(
            (elapsed - BLINK_DURATION) / BLINK_DURATION
          );
          const influence =
            EYES_CLOSED - (EYES_CLOSED - EYES_OPEN) * openProgress;

          if (leftEyeRef.current) leftEyeRef.current.influence = influence;
          if (rightEyeRef.current) rightEyeRef.current.influence = influence;
          if (bothEyesRef.current) bothEyesRef.current.influence = influence;

          blinkAnimationRef.current = requestAnimationFrame(animateBlink);
        } else {
          // Blink complete - reset to open
          if (leftEyeRef.current) leftEyeRef.current.influence = EYES_OPEN;
          if (rightEyeRef.current) rightEyeRef.current.influence = EYES_OPEN;
          if (bothEyesRef.current) bothEyesRef.current.influence = EYES_OPEN;

          // Schedule next blink
          const nextBlink =
            BLINK_INTERVAL_MIN +
            Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);

          setTimeout(() => {
            blinkAnimationRef.current = requestAnimationFrame(blink);
          }, nextBlink);
        }
      };

      blinkAnimationRef.current = requestAnimationFrame(animateBlink);
    };

    // Start first blink after delay
    setTimeout(() => {
      blinkAnimationRef.current = requestAnimationFrame(blink);
    }, 1000 + Math.random() * 1000);
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
