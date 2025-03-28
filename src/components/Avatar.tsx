"use client"

import { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

const Avatar3D = ({ isSpeaking }: { isSpeaking: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouthBoneRef = useRef<BABYLON.Bone | BABYLON.TransformNode | null>(
    null
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 2,
      3,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    BABYLON.SceneLoader.ImportMesh(
      "",
      "https://models.readyplayer.me/",
      "67e6d3bd1dcd1166600ef5b7.glb",
      scene,
      (meshes, particleSystems, skeletons) => {
        if (skeletons.length > 0) {
          const skeleton = skeletons[0];
          console.log(
            "Skeleton Bones:",
            skeleton.bones.map((b) => b.name)
          ); // Debugging
          mouthBoneRef.current =
            skeleton.bones.find((b) => b.name.includes("Mouth")) || null;
        }
      }
    );

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => engine.resize());

    return () => {
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (mouthBoneRef.current) {
      mouthBoneRef.current.rotation.x = isSpeaking ? 0.2 : 0;
    }
  }, [isSpeaking]);

  return <canvas ref={canvasRef} className="w-full h-[500px]" />;
};

export default Avatar3D;
