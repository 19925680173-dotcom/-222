import React from 'react';
import { Environment, Sparkles, Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { Color } from 'three';

export const Scene: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#000500']} />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#000500', 10, 50]} />

      {/* Main Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#fff" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#D4AF37" />
      <pointLight position={[0, -5, 5]} intensity={0.5} color="#022D19" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* The Main Actor */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
        <group position={[0, -4, 0]}>
           <TreeParticles />
        </group>
      </Float>
      
      {/* Atmosphere */}
      <Sparkles 
        count={200} 
        scale={15} 
        size={3} 
        speed={0.4} 
        opacity={0.5} 
        color="#D4AF37"
      />
      
      <ContactShadows 
        opacity={0.6} 
        scale={30} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />

      {/* Post Processing for Cinematic Look */}
      <EffectComposer disableNormalPass>
        {/* Bloom for the glow */}
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
};
