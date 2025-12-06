import { Vector3, MathUtils, Color } from 'three';
import { ParticleData, MorphConfig, ParticleShape } from '../types';

// Expanded Luxury Metallic Palette
const METALLIC_PALETTE = [
  '#FFD700', // Classic Gold
  '#FDB931', // Bright Gold
  '#E5E4E2', // Platinum
  '#B76E79', // Rose Gold
  '#C0C0C0', // Silver
  '#CD7F32', // Bronze
  '#F0E68C', // Champagne
];

// Tuned Emerald Palette: Slightly brighter/richer to be visible against black
const EMERALD_PALETTE = [
  '#065f46', // Deep Teal Green
  '#10b981', // Emerald (Highlights)
  '#047857', // Pure Green
  '#064e3b', // Darkest Green (Base)
  '#15803d'  // Leaf Green
];

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateTreeData = (config: MorphConfig): ParticleData[] => {
  const particles: ParticleData[] = [];
  const { height, radius, leafCount, ornamentCount } = config;
  let idCounter = 0;

  // 1. Generate Leaves (The Cone)
  for (let i = 0; i < leafCount; i++) {
    const y = randomRange(0, height); 
    const relativeY = y / height; 
    
    // Cone shape
    const currentRadius = radius * (1 - relativeY) * randomRange(0.85, 1.15); 
    
    const angle = i * 2.39996; 
    const r = Math.sqrt(Math.random()) * currentRadius; 
    
    const treePos = new Vector3(
      Math.cos(angle) * r,
      y - height / 2, 
      Math.sin(angle) * r
    );

    // Scatter Position
    const scatterR = randomRange(15, 35);
    const theta = randomRange(0, Math.PI * 2);
    const phi = randomRange(0, Math.PI);
    const scatterPos = new Vector3(
      scatterR * Math.sin(phi) * Math.cos(theta),
      scatterR * Math.sin(phi) * Math.sin(theta),
      scatterR * Math.cos(phi)
    );

    particles.push({
      id: idCounter++,
      treePosition: treePos,
      scatterPosition: scatterPos,
      // Scale: X/Z will be thin, Y will be long (handled in component)
      scale: randomRange(1.0, 1.8), 
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      color: EMERALD_PALETTE[Math.floor(Math.random() * EMERALD_PALETTE.length)],
      type: 'LEAF',
      shape: 'LEAF'
    });
  }

  // 2. Generate Ornaments (Surface Layer)
  for (let i = 0; i < ornamentCount; i++) {
    const y = randomRange(0.5, height - 1.0); 
    const relativeY = y / height;
    
    // Embed ornaments slightly deeper into the leaves so leaves poke out
    const surfaceRadius = radius * (1 - relativeY);
    const currentRadius = surfaceRadius * randomRange(0.85, 1.05); 
    
    const angle = randomRange(0, Math.PI * 2);
    
    const treePos = new Vector3(
      Math.cos(angle) * currentRadius,
      y - height / 2,
      Math.sin(angle) * currentRadius
    );

    const scatterR = randomRange(20, 40);
    const theta = randomRange(0, Math.PI * 2);
    const phi = randomRange(0, Math.PI);
    const scatterPos = new Vector3(
      scatterR * Math.sin(phi) * Math.cos(theta),
      scatterR * Math.sin(phi) * Math.sin(theta),
      scatterR * Math.cos(phi)
    );

    const rand = Math.random();
    let shape: ParticleShape = 'SPHERE';
    if (rand > 0.6) shape = 'BOX';
    else if (rand > 0.3) shape = 'DIAMOND';

    particles.push({
      id: idCounter++,
      treePosition: treePos,
      scatterPosition: scatterPos,
      scale: randomRange(1.0, 1.8), // Good size, but leaves will be longer
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      color: METALLIC_PALETTE[Math.floor(Math.random() * METALLIC_PALETTE.length)],
      type: 'ORNAMENT',
      shape: shape
    });
  }

  // 3. The Star (Top) - Explicitly Gold
  particles.push({
    id: idCounter++,
    treePosition: new Vector3(0, height / 2 + 0.5, 0), // Prominent top position
    scatterPosition: new Vector3(0, 35, 0),
    scale: 1, 
    rotation: [0, 0, 0],
    color: '#FFD700', 
    type: 'STAR',
    shape: 'STAR'
  });

  return particles;
};
