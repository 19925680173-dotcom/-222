import React from 'react';
import { useStore } from '../store';
import { TreeState } from '../types';

export const Overlay: React.FC = () => {
  const { viewState, toggleViewState } = useStore();
  const isTree = viewState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10 text-white">
      {/* Header */}
      <header className="flex flex-col items-start space-y-2 animate-fade-in-down">
        <h1 className="text-3xl md:text-5xl font-serif tracking-widest text-[#D4AF37] drop-shadow-lg">
          ARIX
        </h1>
        <p className="text-xs md:text-sm font-light tracking-[0.3em] opacity-80 uppercase">
          Signature Collection
        </p>
      </header>

      {/* Center Message - Only visible during transitions or init if needed, currently unused to keep clean */}
      
      {/* Footer Controls */}
      <footer className="flex w-full justify-between items-end pointer-events-auto">
        <div className="text-xs font-mono opacity-50 hidden md:block">
          POS: {isTree ? 'CONE_ATTRACTOR_01' : 'RANDOM_DISTRIBUTION_SPHERE'} <br/>
          PARTICLES: 2151 <br/>
          RENDER: WEBGL2
        </div>

        <button
          onClick={toggleViewState}
          className={`
            group relative px-8 py-3 
            border border-[#D4AF37] 
            overflow-hidden 
            transition-all duration-500 ease-out
            bg-[#001a0f]/80 backdrop-blur-sm
            hover:bg-[#D4AF37] hover:text-[#001a0f]
          `}
        >
          <span className="relative z-10 font-serif tracking-widest text-sm md:text-base">
            {isTree ? 'DISPERSE' : 'ASSEMBLE'}
          </span>
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </footer>
    </div>
  );
};
