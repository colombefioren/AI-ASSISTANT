import * as THREE from "three";

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const q1 = new THREE.Quaternion();
const q2 = new THREE.Quaternion();
const q3 = new THREE.Quaternion();

export function findBone(root: THREE.Object3D, name: string) {
  let found: THREE.Bone | null = null;
  root.traverse((node) => {
    if (!found && (node as THREE.Bone).isBone && node.name === name) found = node as THREE.Bone;
  });
  return found as THREE.Bone | null;
}

/**
 * Rotates `bone` so the segment towards `child` points along `direction`
 * (given in the avatar's model space). Working in world space keeps this
 * independent of how each rig orients its local bone axes.
 */
export function aimBone(
  root: THREE.Object3D,
  bone: THREE.Bone,
  child: THREE.Object3D,
  direction: THREE.Vector3
) {
  root.updateMatrixWorld(true);
  const from = child.getWorldPosition(v1).sub(bone.getWorldPosition(v2)).normalize();
  const to = direction.clone().applyQuaternion(root.getWorldQuaternion(q3)).normalize();

  const delta = q1.setFromUnitVectors(from, to);
  const targetWorld = delta.multiply(bone.getWorldQuaternion(q2));
  const parentWorld = bone.parent ? bone.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
  bone.quaternion.copy(parentWorld.invert().multiply(targetWorld));
  bone.updateMatrixWorld(true);
}

/** Brings T-posed arms down to a relaxed stance with a slight elbow bend. */
export function relaxArms(root: THREE.Object3D) {
  for (const side of ["Left", "Right"] as const) {
    const arm = findBone(root, `${side}Arm`);
    const fore = findBone(root, `${side}ForeArm`);
    const hand = findBone(root, `${side}Hand`);
    if (!arm || !fore || !hand) continue;

    root.updateMatrixWorld(true);
    // Which way this arm points in the rest pose tells us the side sign,
    // whatever the rig's naming convention for left and right.
    const local = root.worldToLocal(fore.getWorldPosition(new THREE.Vector3()));
    const shoulder = root.worldToLocal(arm.getWorldPosition(new THREE.Vector3()));
    const sign = Math.sign(local.x - shoulder.x) || (side === "Left" ? 1 : -1);

    aimBone(root, arm, fore, new THREE.Vector3(sign * 0.2, -1, 0.06));
    aimBone(root, fore, hand, new THREE.Vector3(sign * 0.08, -1, 0.42));
  }
}

/**
 * Applies a rotation expressed in model space (x = nod, y = turn, z = tilt)
 * on top of a bone's rest pose. Converting through the parent's current world
 * rotation keeps the motion consistent across rigs and stacked bones.
 */
export function applyModelSpaceOffset(
  root: THREE.Object3D,
  bone: THREE.Bone,
  rest: THREE.Quaternion,
  euler: THREE.Euler
) {
  const rootQ = root.getWorldQuaternion(q1);
  const offsetModel = q2.setFromEuler(euler);
  // offsetWorld = R * offsetModel * R^-1
  const offsetWorld = rootQ.clone().multiply(offsetModel).multiply(rootQ.clone().invert());

  const parentWorld = bone.parent ? bone.parent.getWorldQuaternion(q3) : q3.identity();
  const restWorld = parentWorld.clone().multiply(rest);
  const targetWorld = offsetWorld.multiply(restWorld);
  bone.quaternion.copy(parentWorld.invert().multiply(targetWorld));
  bone.updateMatrixWorld(true);
}
