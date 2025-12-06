import { Vector3 } from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export type ParticleShape = 'LEAF' | 'SPHERE' | 'BOX' | 'DIAMOND' | 'STAR';

export interface ParticleData {
  id: number;
  treePosition: Vector3;
  scatterPosition: Vector3;
  scale: number;
  rotation: [number, number, number];
  color: string;
  type: 'LEAF' | 'ORNAMENT' | 'STAR';
  shape: ParticleShape;
}

export interface MorphConfig {
  radius: number;
  height: number;
  leafCount: number;
  ornamentCount: number;
}
