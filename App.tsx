import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Loader } from '@react-three/drei';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';

const App: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-black">
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]} // Optimize pixel ratio
        camera={{ position: [0, 0, 25], fov: 35 }}
        gl={{ antialias: false, stencil: false, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={10}
            maxDistance={40}
            autoRotate
            autoRotateSpeed={0.5}
            makeDefault
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <Overlay />
      
      {/* Loading Indicator */}
      <Loader 
        containerStyles={{ background: '#000500' }} 
        innerStyles={{ background: '#022D19', border: '1px solid #D4AF37', height: '2px' }} 
        barStyles={{ background: '#D4AF37', height: '2px' }}
        dataInterpolation={(p) => `LOADING ${p.toFixed(0)}%`}
      />
    </div>
  );
};

export default App;
