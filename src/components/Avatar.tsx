"use client";

import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

const Avatar3D = ({ isSpeaking }: { isSpeaking: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const jawBoneRef = useRef<BABYLON.Bone | null>(null);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const animationRef = useRef<number | null>(null);

  // More aggressive mouth movement values
  const MOUTH_CLOSED = 0;
  const MOUTH_OPEN = 0.5; // Increased from 0.3 to make more visible

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    // Camera setup - adjusted for better view
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 2, // Slightly more angled down
      0.20, // Even closer zoom
      new BABYLON.Vector3(0, 1.65, 0), // Adjusted head level
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerBetaLimit = Math.PI / 3;
    camera.upperBetaLimit = Math.PI / 1.7;

    // Improved lighting
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
        if (meshes.length > 0) {
          const avatarMesh = meshes[0];
          avatarMesh.scaling = new BABYLON.Vector3(1.8, 1.8, 1.8);
          avatarMesh.position.y = -1.0;

          // Enable bone matrix recalculation each frame
          avatarMesh.computeBonesUsingShaders = true;
        }

        if (skeletons.length > 0) {
          const skeleton = skeletons[0];
          console.log(
            "Available bones:",
            skeleton.bones.map((b) => b.name)
          );

          // Try common jaw bone names
          jawBoneRef.current =
            skeleton.bones.find(
              (b) =>
                b.name.toLowerCase().includes("jaw") ||
                b.name.toLowerCase().includes("mouth") ||
                b.name.toLowerCase().includes("chin") ||
                b.name.toLowerCase().includes("head")
            ) || null;

          if (!jawBoneRef.current) {
            console.error(
              "No suitable jaw bone found. Available bones:",
              skeleton.bones.map((b) => b.name)
            );
          } else {
            console.log(
              "Using bone for mouth movement:",
              jawBoneRef.current.name
            );
          }
        }
      },
      undefined,
      (scene, message) => {
        console.error("Error loading model:", message);
      }
    );

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => engine.resize());

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpenness(MOUTH_CLOSED);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // More dynamic mouth animation
    const animateMouth = () => {
      // Alternate between more extreme values when speaking
      const newOpenness = Math.random() > 0.5 ? MOUTH_OPEN : MOUTH_OPEN * 0.7;
      setMouthOpenness(newOpenness);

      // Faster animation when speaking
      animationRef.current = requestAnimationFrame(animateMouth);
    };

    animationRef.current = requestAnimationFrame(animateMouth);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking]);

  useEffect(() => {
    if (jawBoneRef.current && sceneRef.current) {
      // Use rotation or position based on what works for your model
      jawBoneRef.current.rotation.x = mouthOpenness;

      // Some models might need position adjustment instead
      // jawBoneRef.current.position.y = -mouthOpenness * 0.1;

      // Force update the bone matrices
      const skeleton = jawBoneRef.current.getSkeleton();
      if (skeleton) {
        skeleton.returnToRest();
        skeleton.computeAbsoluteTransforms();
      }
    }
  }, [mouthOpenness]);

  return <canvas ref={canvasRef} className="w-full h-[500px]" />;
};

export default Avatar3D;
