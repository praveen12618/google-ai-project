import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-magenta-500/50 relative overflow-hidden">
      <div className="scanlines" />
      <div className="noise" />

      <header className="mb-8 text-center z-10 w-full max-w-6xl relative">
        <h1 
          className="text-4xl md:text-6xl font-mono tracking-widest text-white uppercase glitch"
          data-text="SYSTEM.SNAKE"
        >
          SYSTEM.SNAKE
        </h1>
        <p className="text-magenta-500 tracking-widest uppercase text-sm md:text-xl mt-4 font-sans drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]">
          // AUDIO_VISUAL_INTERFACE_v1.0
        </p>
      </header>

      <main className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center w-full max-w-6xl z-10">
        <div className="flex-1 flex justify-center w-full order-2 xl:order-1">
          <SnakeGame />
        </div>
        <div className="w-full max-w-md xl:w-96 shrink-0 order-1 xl:order-2 border-2 border-cyan-500 p-1 bg-black shadow-[8px_8px_0px_0px_rgba(255,0,255,1)]">
          <MusicPlayer />
        </div>
      </main>
    </div>
  );
}

