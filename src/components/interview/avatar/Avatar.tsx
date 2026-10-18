"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { Interviewer } from "@/lib/interviewers";
import { SyllableSynth, VISEMES, analyse, emptyWeights, visemesFromFeatures } from "./lipsync";
import { applyModelSpaceOffset, findBone, relaxArms } from "./rig";
import type { AudioBridge } from "./types";

type MorphSlot = [influences: number[], index: number];

// Avatars ship meshopt-compressed (see public/avatars/CREDITS.md).
const withMeshopt = (loader: GLTFLoader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
};

export function preloadAvatar(url: string) {
  useLoader.preload(GLTFLoader, url, withMeshopt);
}

const { damp, clamp, degToRad } = THREE.MathUtils;

// Smooth pseudo-noise from incommensurate sines: cheap and never repeats visibly.
function wander(t: number, seed: number) {
  return (
    Math.sin(t * 0.53 + seed) * 0.6 +
    Math.sin(t * 1.31 + seed * 2.3) * 0.3 +
    Math.sin(t * 2.17 + seed * 4.1) * 0.1
  );
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

function prepareModel(scene: THREE.Object3D, recolor: Record<string, string> = {}) {
  if (!scene.userData.prepared) {
    scene.updateMatrixWorld(true);
    const leftEye = findBone(scene, "LeftEye");
    const rightEye = findBone(scene, "RightEye");
    if (leftEye && rightEye) {
      const l = scene.worldToLocal(leftEye.getWorldPosition(new THREE.Vector3()));
      const r = scene.worldToLocal(rightEye.getWorldPosition(new THREE.Vector3()));
      // A model facing the camera (+Z) has its own left eye on +X.
      if (l.x < r.x) scene.rotation.y = Math.PI;
    }
    relaxArms(scene);
    scene.userData.prepared = true;
  }

  const morphs = new Map<string, MorphSlot[]>();
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false;
    const material = mesh.material as THREE.MeshStandardMaterial;
    const flat = material && recolor[material.name];
    if (flat && material.map) {
      material.map = null;
      material.color.set(flat);
      material.needsUpdate = true;
    }
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    for (const [name, index] of Object.entries(mesh.morphTargetDictionary)) {
      const slots = morphs.get(name) ?? [];
      slots.push([mesh.morphTargetInfluences, index]);
      morphs.set(name, slots);
    }
  });

  const boneNames = ["Spine", "Spine1", "Spine2", "Neck", "Head"] as const;
  const bones = boneNames
    .map((name) => findBone(scene, name))
    .filter((bone): bone is THREE.Bone => bone !== null);
  // The loader caches this scene, so bones keep the last animated offset after
  // unmount. Capture the rest pose once, on first preparation, and reuse it.
  scene.userData.rest ??= new Map(bones.map((bone) => [bone, bone.quaternion.clone()]));
  const rest = scene.userData.rest as Map<THREE.Bone, THREE.Quaternion>;

  return { morphs, bones, rest, head: findBone(scene, "Head") };
}

interface AvatarProps {
  interviewer: Interviewer;
  audio: React.RefObject<AudioBridge>;
  reduceMotion: boolean;
  onReady?: () => void;
  /** Element moved every frame so it sits beside the head, e.g. a speech bubble. */
  headAnchor?: React.RefObject<HTMLElement | null>;
}

const headPoint = new THREE.Vector3();
const edgePoint = new THREE.Vector3();
const HEAD_HALF_WIDTH = new THREE.Vector3(0.1, 0, 0);
const HEAD_TOP = new THREE.Vector3(0, 0.26, 0);

export function Avatar({ interviewer, audio, reduceMotion, onReady, headAnchor }: AvatarProps) {
  const { scene } = useLoader(GLTFLoader, interviewer.avatarUrl, withMeshopt);
  const model = useMemo(() => prepareModel(scene, interviewer.rig.recolor), [scene, interviewer.rig.recolor]);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  const state = useRef({
    visemes: emptyWeights(),
    jaw: 0,
    env: 0,
    envSlow: 0,
    userEnv: 0,
    synth: new SyllableSynth(),
    blinkStart: -1,
    nextBlink: random(1, 3),
    doubleBlink: false,
    gaze: new THREE.Vector2(),
    gazeTarget: new THREE.Vector2(),
    nextSaccade: 0.5,
    head: new THREE.Vector3(),
    nodStart: -10,
    nextNod: 0,
    tilt: 0,
    smile: 0.15,
    brow: 0,
    lastMode: "idle" as AudioBridge["mode"],
    euler: new THREE.Euler(),
    anchor: new THREE.Vector2(-1, -1),
  });

  useEffect(() => {
    onReady?.();
  }, [model, onReady]);

  // Frame the face and shoulders like a video call.
  useEffect(() => {
    if (!model.head) return;
    scene.updateMatrixWorld(true);
    const head = model.head.getWorldPosition(new THREE.Vector3());
    const aspect = size.width / Math.max(size.height, 1);
    const fov = 20;
    const visibleHeight = aspect < 0.85 ? 1.05 : 0.86;
    const distance = visibleHeight / 2 / Math.tan(degToRad(fov / 2));
    // Portrait screens keep more space above the head for the greeting bubble.
    const target = head.clone().add(new THREE.Vector3(0, aspect < 0.85 ? -0.06 : -0.12, 0));
    camera.fov = fov;
    camera.position.set(target.x, target.y + 0.02, target.z + distance);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [model, scene, camera, size.width, size.height]);

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 20);
    const t = clock.elapsedTime;
    const s = state.current;
    const bridge = audio.current;
    const mode = bridge?.mode ?? "idle";
    const speaking = mode === "speaking";
    const motion = reduceMotion ? 0.35 : 1;

    const setMorph = (name: string, value: number) => {
      const slots = model.morphs.get(name);
      if (slots) for (const [influences, index] of slots) influences[index] = value;
    };

    // Lip sync ------------------------------------------------------------
    let target = emptyWeights();
    let loudness = 0;
    let openness = 0.5;
    if (speaking && bridge) {
      const data = bridge.getOutputFrequency();
      const hasSpectrum = data !== null && data.some((value) => value > 0);
      if (hasSpectrum) {
        const features = analyse(data);
        loudness = clamp(features.energy * 1.9, 0, 1);
        openness = features.openness;
        target = visemesFromFeatures(features, loudness);
      } else {
        const synthetic = s.synth.step(dt);
        target = synthetic.weights;
        loudness = synthetic.loudness;
      }
    }

    // Mouths open faster than they close; this asymmetry reads as speech
    // rather than flapping.
    s.env = damp(s.env, loudness, loudness > s.env ? 26 : 11, dt);
    s.envSlow = damp(s.envSlow, loudness, 1.6, dt);
    for (const v of VISEMES) {
      const goal = target[v] * interviewer.rig.visemeGain;
      s.visemes[v] = damp(s.visemes[v], goal, goal > s.visemes[v] ? 30 : 15, dt);
      setMorph(`viseme_${v}`, s.visemes[v]);
    }
    const jawGoal = s.env * interviewer.rig.jawGain * (0.45 + 0.55 * openness);
    s.jaw = damp(s.jaw, jawGoal, 20, dt);
    setMorph("jawOpen", s.jaw);

    // Blinks: irregular, sometimes doubled, more likely when turn-taking.
    if (mode !== s.lastMode) {
      if (Math.random() < 0.6) s.nextBlink = Math.min(s.nextBlink, t + 0.15);
      s.lastMode = mode;
    }
    if (s.blinkStart < 0 && t >= s.nextBlink) {
      s.blinkStart = t;
      s.doubleBlink = Math.random() < 0.15;
    }
    let blink = 0;
    if (s.blinkStart >= 0) {
      const p = t - s.blinkStart;
      const close = 0.07;
      const hold = 0.03;
      const open = 0.09;
      if (p < close) blink = p / close;
      else if (p < close + hold) blink = 1;
      else if (p < close + hold + open) blink = 1 - (p - close - hold) / open;
      else {
        s.blinkStart = -1;
        s.nextBlink = s.doubleBlink ? t + 0.12 : t + random(2.2, 5.5);
        s.doubleBlink = false;
      }
    }
    setMorph("eyeBlinkLeft", blink);
    setMorph("eyeBlinkRight", blink);

    // Head and body --------------------------------------------------------
    const userLevel = bridge && mode === "listening" ? bridge.getInputVolume() : 0;
    s.userEnv = damp(s.userEnv, userLevel, 4, dt);
    if (mode === "listening" && s.userEnv > 0.05 && t >= s.nextNod) {
      s.nodStart = t;
      s.nextNod = t + random(2.6, 5.5);
    }
    const nodPhase = (t - s.nodStart) / 0.75;
    const nod = nodPhase >= 0 && nodPhase <= 1 ? Math.sin(Math.PI * nodPhase) : 0;

    s.tilt = damp(s.tilt, mode === "listening" ? 0.05 : 0, 1.5, dt);
    const emphasis = clamp((s.env - s.envSlow) * 3, -0.5, 1);
    const goal = s.head;
    const yaw = wander(t * (speaking ? 0.8 : 0.35), 1.3) * (speaking ? 0.075 : 0.035);
    const pitch =
      wander(t * 0.6, 4.2) * (speaking ? 0.03 : 0.015) +
      (speaking ? emphasis * 0.06 : 0) +
      (mode === "listening" ? 0.025 + nod * 0.075 : 0);
    const roll = wander(t * 0.45, 7.7) * (speaking ? 0.03 : 0.015) + s.tilt;
    goal.set(
      damp(goal.x, pitch * motion, 5, dt),
      damp(goal.y, yaw * motion, 3.5, dt),
      damp(goal.z, roll * motion, 3, dt)
    );

    const breath = Math.sin(t * Math.PI * 2 * 0.22);
    const e = s.euler;
    for (const bone of model.bones) {
      const rest = model.rest.get(bone);
      if (!rest) continue;
      switch (bone.name) {
        case "Spine":
          e.set(0, wander(t * 0.2, 9.1) * 0.012 * motion, 0);
          break;
        case "Spine1":
          e.set(breath * 0.008 * motion, 0, 0);
          break;
        case "Spine2":
          e.set(breath * 0.012 * motion, goal.y * 0.15, 0);
          break;
        case "Neck":
          e.set(goal.x * 0.4, goal.y * 0.35, goal.z * 0.4);
          break;
        case "Head":
          e.set(goal.x * 0.6, goal.y * 0.5, goal.z * 0.6);
          break;
      }
      applyModelSpaceOffset(scene, bone, rest, e);
    }

    // Eyes: quick saccades, mostly holding eye contact, counter-rotating
    // against head turns the way real eyes do.
    if (t >= s.nextSaccade) {
      const lookAway = Math.random() < (speaking ? 0.3 : 0.18);
      s.gazeTarget.set(
        lookAway ? random(-0.35, 0.35) : random(-0.05, 0.05),
        lookAway ? random(speaking ? 0 : -0.15, 0.25) : random(-0.04, 0.04)
      );
      s.nextSaccade = t + (lookAway ? random(0.4, 1.1) : random(0.9, 2.8));
    }
    s.gaze.set(damp(s.gaze.x, s.gazeTarget.x, 32, dt), damp(s.gaze.y, s.gazeTarget.y, 32, dt));
    const gx = clamp(s.gaze.x - goal.y * 3, -1, 1);
    const gy = clamp(s.gaze.y + goal.x * 2, -1, 1);
    setMorph("eyeLookOutLeft", Math.max(gx, 0) * 0.7);
    setMorph("eyeLookInRight", Math.max(gx, 0) * 0.7);
    setMorph("eyeLookInLeft", Math.max(-gx, 0) * 0.7);
    setMorph("eyeLookOutRight", Math.max(-gx, 0) * 0.7);
    setMorph("eyeLookUpLeft", Math.max(gy, 0) * 0.6);
    setMorph("eyeLookUpRight", Math.max(gy, 0) * 0.6);
    setMorph("eyeLookDownLeft", Math.max(-gy, 0) * 0.6);
    setMorph("eyeLookDownRight", Math.max(-gy, 0) * 0.6);

    // Expression: a warm resting face, brows that lift on stressed syllables.
    const smileGoal = speaking ? 0.08 + (1 - s.env) * 0.08 : mode === "listening" ? 0.24 + nod * 0.08 : 0.16;
    s.smile = damp(s.smile, smileGoal, 2.5, dt);
    for (const name of ["mouthSmileLeft", "mouthSmileRight"]) setMorph(name, s.smile);
    setMorph("mouthSmile", s.smile * 0.6);
    setMorph("cheekSquintLeft", s.smile * 0.35);
    setMorph("cheekSquintRight", s.smile * 0.35);

    const browGoal = speaking ? Math.max(emphasis, 0) * 0.45 : nod * 0.2;
    s.brow = damp(s.brow, browGoal, 8, dt);
    setMorph("browInnerUp", 0.04 + s.brow);
    setMorph("browOuterUpLeft", s.brow * 0.6);
    setMorph("browOuterUpRight", s.brow * 0.6);
  });

  // Pin the anchor element to the top-right of the head in screen space.
  useFrame(({ camera: frameCamera, size: frameSize }, delta) => {
    const element = headAnchor?.current;
    if (!element || !model.head) return;
    model.head.getWorldPosition(headPoint);
    const toX = (ndc: number) => ((ndc + 1) / 2) * frameSize.width;
    const toY = (ndc: number) => ((1 - ndc) / 2) * frameSize.height;
    const topY = toY(edgePoint.copy(headPoint).add(HEAD_TOP).project(frameCamera).y);
    headPoint.y += 0.1;
    edgePoint.copy(headPoint).add(HEAD_HALF_WIDTH).project(frameCamera);
    headPoint.project(frameCamera);
    const centerX = toX(headPoint.x);
    const radius = Math.abs(toX(edgePoint.x) - centerX);
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const margin = 12;

    let goalX: number;
    let goalY: number;
    if (centerX + radius * 0.85 + width + margin <= frameSize.width) {
      // Room on the right: bubble starts beside the head at eye level.
      goalX = centerX + radius * 0.85;
      goalY = toY(headPoint.y) + radius * 0.2;
    } else {
      // Narrow stage: sit above the head instead of covering the face.
      goalX = Math.min(Math.max(centerX - width / 2, margin), frameSize.width - width - margin);
      goalY = topY - 8;
    }
    goalY = Math.max(goalY, height + margin);

    const anchor = state.current.anchor;
    if (anchor.x < 0) anchor.set(goalX, goalY);
    anchor.set(damp(anchor.x, goalX, 6, delta), damp(anchor.y, goalY, 6, delta));
    element.style.transform = `translate3d(${anchor.x.toFixed(1)}px, ${anchor.y.toFixed(1)}px, 0) translateY(-100%)`;
    element.dataset.placed = "true";
  });

  return <primitive object={scene} />;
}
