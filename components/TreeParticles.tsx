import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color, MathUtils, Vector3, Shape, ExtrudeGeometry } from 'three';
import { useStore } from '../store';
import { TreeState, ParticleData } from '../types';
import { generateTreeData } from '../utils/math';

const tempObject = new Object3D();
const tempVec = new Vector3();

export const TreeParticles: React.FC = () => {
  const viewState = useStore((state) => state.viewState);
  
  // Configuration
  const particleCount = 4500; // Even more leaves for "no gaps" look
  const ornamentCount = 750;  // High density ornaments
  
  const particles = useMemo(() => generateTreeData({
    radius: 6,
    height: 14,
    leafCount: particleCount,
    ornamentCount: ornamentCount
  }), []);

  const leavesRef = useRef<InstancedMesh>(null);
  const sphereRef = useRef<InstancedMesh>(null); 
  const boxRef = useRef<InstancedMesh>(null);    
  const diamondRef = useRef<InstancedMesh>(null);
  const starRef = useRef<InstancedMesh>(null);

  const leafData = useMemo(() => particles.filter(p => p.shape === 'LEAF'), [particles]);
  const sphereData = useMemo(() => particles.filter(p => p.shape === 'SPHERE'), [particles]);
  const boxData = useMemo(() => particles.filter(p => p.shape === 'BOX'), [particles]);
  const diamondData = useMemo(() => particles.filter(p => p.shape === 'DIAMOND'), [particles]);
  const starData = useMemo(() => particles.filter(p => p.shape === 'STAR'), [particles]);

  const starGeometry = useMemo(() => {
    const shape = new Shape();
    const points = 5;
    const outerRadius = 1.0; 
    const innerRadius = 0.4; // Sharper points
    
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2 + Math.PI/5; // Rotate to ensure top point is vertical
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const geom = new ExtrudeGeometry(shape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 3
    });
    geom.center();
    return geom;
  }, []);

  // Animation State
  const progress = useRef(0);

  // Helper to init instances
  const initInstances = (ref: React.RefObject<InstancedMesh | null>, data: ParticleData[]) => {
    if (ref.current) {
      data.forEach((d, i) => {
        // Initial scale set to 0 to avoid pop-in, handled in useFrame
        tempObject.scale.setScalar(0); 
        tempObject.updateMatrix();
        ref.current!.setMatrixAt(i, tempObject.matrix);
        ref.current!.setColorAt(i, new Color(d.color));
      });
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    }
  };

  useLayoutEffect(() => {
    initInstances(leavesRef, leafData);
    initInstances(sphereRef, sphereData);
    initInstances(boxRef, boxData);
    initInstances(diamondRef, diamondData);
  }, [leafData, sphereData, boxData, diamondData]);

  useFrame((state, delta) => {
    const target = viewState === TreeState.TREE_SHAPE ? 1 : 0;
    progress.current = MathUtils.lerp(progress.current, target, delta * 1.5);
    const t = progress.current;
    const noiseTime = state.clock.elapsedTime * 0.3;

    // --- LEAVES UPDATE ---
    if (leavesRef.current) {
      leafData.forEach((data, i) => {
        tempVec.lerpVectors(data.scatterPosition, data.treePosition, t);
        
        // Dynamic noise movement
        if (t < 0.95) {
          tempVec.y += Math.sin(noiseTime + data.id) * 0.2 * (1 - t);
          tempVec.x += Math.cos(noiseTime + data.id) * 0.2 * (1 - t);
        }

        tempObject.position.copy(tempVec);
        
        // Orient leaves
        if (t < 0.8) {
             tempObject.rotation.set(
                data.rotation[0] + noiseTime * (1-t), 
                data.rotation[1] + noiseTime * (1-t), 
                data.rotation[2]
            );
        } else {
             // Look at center-ish but with randomness to look like organic needles
             tempObject.lookAt(0, tempVec.y, 0); 
             tempObject.rotateX(data.rotation[0] * 0.5); // Random tile
             tempObject.rotateZ(data.rotation[2] * 0.5); 
        }

        // Elongate leaves to look like needles: Thin X/Z, Long Y
        // When scattered, uniform scale. When tree, stretch.
        const scaleBase = data.scale * 0.2;
        if (t > 0.5) {
            tempObject.scale.set(scaleBase * 0.5, scaleBase * 2.5, scaleBase * 0.5);
        } else {
            tempObject.scale.setScalar(scaleBase);
        }
        
        tempObject.updateMatrix();
        leavesRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- ORNAMENTS UPDATE ---
    const updateOrnaments = (ref: React.RefObject<InstancedMesh | null>, data: ParticleData[], scaleMult: number, rotSpeed: number) => {
        if (!ref.current) return;
        data.forEach((d, i) => {
            tempVec.lerpVectors(d.scatterPosition, d.treePosition, t);
            // Gentle float
            tempVec.y += Math.sin(noiseTime * 1.5 + d.id) * 0.05;

            tempObject.position.copy(tempVec);
            
            // Spin
            tempObject.rotation.set(
                d.rotation[0] + state.clock.elapsedTime * rotSpeed, 
                d.rotation[1] + state.clock.elapsedTime * rotSpeed, 
                d.rotation[2]
            );
            
            if (t > 0.9 && d.shape === 'BOX') {
                tempObject.rotation.set(0, d.rotation[1] + state.clock.elapsedTime * 0.2, 0);
            }

            tempObject.scale.setScalar(d.scale * scaleMult);
            tempObject.updateMatrix();
            ref.current!.setMatrixAt(i, tempObject.matrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    };

    updateOrnaments(sphereRef, sphereData, 0.25, 0.1); 
    updateOrnaments(boxRef, boxData, 0.22, 0.2);     
    updateOrnaments(diamondRef, diamondData, 0.2, 0.5);

    // --- STAR UPDATE ---
    if (starRef.current && starData.length > 0) {
        const data = starData[0];
        tempVec.lerpVectors(data.scatterPosition, data.treePosition, t);
        tempObject.position.copy(tempVec);
        
        // Spin the star slowly
        tempObject.rotation.y = state.clock.elapsedTime * 0.3;
        
        // Scale logic: make it prominent
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        // Base scale 2.5 for grandeur
        tempObject.scale.setScalar(2.5 * t * pulse); 
        
        tempObject.updateMatrix();
        starRef.current.setMatrixAt(0, tempObject.matrix);
        starRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const materialProps = {
    roughness: 0.15,
    metalness: 0.9,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  };

  return (
    <group>
      {/* 1. Leaves: Needles - Elongated tetrahedrons */}
      <instancedMesh ref={leavesRef} args={[undefined, undefined, leafData.length]}>
        {/* Scale handled in loop to be needle shaped */}
        <tetrahedronGeometry args={[1, 0]} />
        {/* Ink Green visible with some reflection */}
        <meshStandardMaterial 
            roughness={0.4} 
            metalness={0.4}
            envMapIntensity={1.0}
        />
      </instancedMesh>

      {/* 2. Ornaments */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, sphereData.length]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial {...materialProps} />
      </instancedMesh>

      <instancedMesh ref={boxRef} args={[undefined, undefined, boxData.length]}>
        <boxGeometry args={[1, 1, 1]} /> 
        <meshPhysicalMaterial {...materialProps} roughness={0.2} />
      </instancedMesh>

      <instancedMesh ref={diamondRef} args={[undefined, undefined, diamondData.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial {...materialProps} metalness={1} roughness={0} envMapIntensity={5} />
      </instancedMesh>

      {/* 5. Star: METALLIC GOLD */}
      <instancedMesh ref={starRef} args={[starGeometry, undefined, starData.length]}>
        <meshPhysicalMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={0.2} // Low emissive to let reflections show
            roughness={0.05} // Very smooth
            metalness={1.0} // Fully metallic
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            envMapIntensity={3.0} // High reflection
        />
      </instancedMesh>
    </group>
  );
};
