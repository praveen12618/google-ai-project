import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const TILE_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * TILE_SIZE;

interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');

  // Game state refs for the animation loop
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Point>({ x: 0, y: -1 });
  const nextDirRef = useRef<Point>({ x: 0, y: -1 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const moveTimerRef = useRef<number>(0);
  const shakeRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);

  const getSpeed = () => Math.max(40, 100 - Math.floor(scoreRef.current / 50) * 10);

  const spawnFood = (snake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snake.some((s) => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    foodRef.current = newFood;
  };

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE + TILE_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 20 + 20,
        color,
      });
    }
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { x: 0, y: -1 };
    nextDirRef.current = { x: 0, y: -1 };
    scoreRef.current = 0;
    setScore(0);
    spawnFood(snakeRef.current);
    particlesRef.current = [];
    shakeRef.current = 0;
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState !== 'PLAYING') {
          resetGame();
        }
        return;
      }

      const dir = dirRef.current;
      if (e.key === 'ArrowUp' && dir.y !== 1) nextDirRef.current = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && dir.y !== -1) nextDirRef.current = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && dir.x !== 1) nextDirRef.current = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && dir.x !== -1) nextDirRef.current = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const update = (deltaTime: number) => {
      if (gameState !== 'PLAYING') return;

      moveTimerRef.current += deltaTime;
      const speed = getSpeed();

      if (moveTimerRef.current >= speed) {
        moveTimerRef.current = 0;
        dirRef.current = nextDirRef.current;
        const dir = dirRef.current;
        const snake = [...snakeRef.current];
        const head = snake[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          snake.some((s) => s.x === newHead.x && s.y === newHead.y)
        ) {
          setGameState('GAME_OVER');
          shakeRef.current = 20;
          spawnParticles(head.x, head.y, '#FF00FF', 30);
          setHighScore((prev) => Math.max(prev, scoreRef.current));
          return;
        }

        snake.unshift(newHead);

        // Food collision
        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          scoreRef.current += 10;
          setScore(scoreRef.current);
          spawnParticles(newHead.x, newHead.y, '#00FFFF', 15);
          shakeRef.current = 5;
          spawnFood(snake);
        } else {
          snake.pop();
        }

        snakeRef.current = snake;
      }

      // Update particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        return p.life < p.maxLife;
      });

      if (shakeRef.current > 0) {
        shakeRef.current *= 0.9;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }
    };

    const draw = () => {
      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.save();
      if (shakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * shakeRef.current;
        const dy = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(dx, dy);
      }

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * TILE_SIZE);
        ctx.stroke();
      }

      // Draw food
      const food = foodRef.current;
      ctx.fillStyle = '#FF00FF';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FF00FF';
      ctx.fillRect(food.x * TILE_SIZE + 2, food.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      ctx.shadowBlur = 0;

      // Draw snake
      const snake = snakeRef.current;
      snake.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#FFFFFF' : '#00FFFF';
        ctx.shadowBlur = isHead ? 20 : 10;
        ctx.shadowColor = '#00FFFF';
        
        const sizeOffset = isHead ? 0 : 2;
        ctx.fillRect(
          segment.x * TILE_SIZE + sizeOffset,
          segment.y * TILE_SIZE + sizeOffset,
          TILE_SIZE - sizeOffset * 2,
          TILE_SIZE - sizeOffset * 2
        );
      });
      ctx.shadowBlur = 0;

      // Draw particles
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      ctx.restore();
    };

    const loop = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      update(deltaTime);
      draw();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center w-full max-w-md font-mono">
      <div className="flex justify-between items-center w-full mb-4 px-4 py-2 bg-black border-2 border-cyan-500 shadow-[4px_4px_0px_0px_rgba(0,255,255,1)]">
        <div className="flex flex-col">
          <span className="text-xs text-magenta-500 uppercase">SCORE</span>
          <span className="text-xl text-cyan-400">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-magenta-500 uppercase">HIGH SCORE</span>
          <span className="text-xl text-white">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      <div className="relative border-4 border-magenta-500 bg-black shadow-[8px_8px_0px_0px_rgba(255,0,255,1)] p-1">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black w-full h-auto aspect-square"
          style={{ maxWidth: '400px' }}
        />

        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            {gameState === 'START' ? (
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-cyan-500 text-black font-bold uppercase border-2 border-white hover:bg-magenta-500 hover:text-white transition-colors animate-pulse"
              >
                &gt; INIT_SYSTEM
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-3xl font-bold text-magenta-500 mb-2 glitch" data-text="FATAL_ERROR">
                  FATAL_ERROR
                </h2>
                <p className="text-cyan-400 mb-6">SCORE: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-cyan-500 text-black font-bold uppercase border-2 border-white hover:bg-magenta-500 hover:text-white transition-colors"
                >
                  &gt; REBOOT
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-cyan-400 text-xs text-center border-t border-cyan-500/30 pt-4 w-full">
        <p>&gt; INPUT: [W,A,S,D] OR [ARROWS]</p>
        <p>&gt; EXEC: [SPACE] TO START</p>
      </div>
    </div>
  );
}
