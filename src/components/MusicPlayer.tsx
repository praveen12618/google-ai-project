import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc3 } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'ERR_TRACK_01',
    artist: 'SYS.GEN',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12',
  },
  {
    id: 2,
    title: 'CORRUPT_DATA',
    artist: 'SYS.GEN',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05',
  },
  {
    id: 3,
    title: 'VOID_SIGNAL',
    artist: 'SYS.GEN',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:44',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  return (
    <div className="w-full bg-black p-6 flex flex-col relative font-sans">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      <div className="flex items-center gap-4 mb-6 z-10 border-b-2 border-magenta-500 pb-4">
        <div className="relative w-16 h-16 bg-cyan-500 flex items-center justify-center overflow-hidden shrink-0">
          <Disc3 className={`w-10 h-10 text-black ${isPlaying ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-magenta-500 uppercase font-mono mb-1 animate-pulse">
            &gt; STATUS: {isPlaying ? 'PLAYING' : 'IDLE'}
          </span>
          <h3 className="text-lg font-bold text-white truncate font-mono">
            {currentTrack.title}
          </h3>
          <p className="text-sm text-cyan-400 truncate font-mono">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      <div className="w-full h-4 bg-black border-2 border-cyan-500 mb-6 relative">
        <div
          className="h-full bg-magenta-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between z-10 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-cyan-400 hover:text-white hover:bg-magenta-500 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevTrack}
            className="p-2 text-cyan-400 hover:text-white hover:bg-magenta-500 transition-colors border-2 border-transparent hover:border-white"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          
          <button
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center bg-cyan-500 text-black hover:bg-magenta-500 hover:text-white transition-colors border-2 border-white"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          
          <button
            onClick={nextTrack}
            className="p-2 text-cyan-400 hover:text-white hover:bg-magenta-500 transition-colors border-2 border-transparent hover:border-white"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      <div className="pt-4 border-t-2 border-cyan-500 z-10">
        <h4 className="text-xs text-magenta-500 font-mono mb-3">
          &gt; QUEUE
        </h4>
        <div className="flex flex-col gap-2">
          {TRACKS.map((track, index) => (
            <button
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(index);
                setIsPlaying(true);
              }}
              className={`flex items-center justify-between p-2 font-mono text-left border-2 ${
                index === currentTrackIndex
                  ? 'border-magenta-500 bg-magenta-500/20 text-white'
                  : 'border-transparent text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/10'
              }`}
            >
              <span className="text-sm truncate pr-4">
                [{index + 1}] {track.title}
              </span>
              <span className="text-xs opacity-80 shrink-0">{track.duration}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
