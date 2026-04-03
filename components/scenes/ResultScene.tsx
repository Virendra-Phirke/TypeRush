'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { TestResult } from '@/app/page';

interface ResultSceneProps {
  result: TestResult;
  onReturnHome: () => void;
}

interface StoredScore {
  wpm: number;
  accuracy: number;
  timestamp: number;
  mode: string;
  difficulty: string;
}

function WpmHistoryChart({ history, errorHistory, duration }: { history: number[]; errorHistory?: number[]; duration: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Smooth padding
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxWpm = Math.max(100, Math.max(...history) * 1.1);
    const maxErrors = errorHistory ? Math.max(5, Math.max(...errorHistory)) : 5;

    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#2f2f2f';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Draw WPM labels
      ctx.fillStyle = '#6a7280';
      ctx.font = '10px monospace';
      ctx.fillText(Math.round(maxWpm - (maxWpm / 4) * i).toString(), 4, y + 4);
      
      // Draw Error labels on the right
      if (errorHistory) {
        ctx.fillStyle = '#822838'; // subtle red
        ctx.fillText(Math.round(maxErrors - (maxErrors / 4) * i).toString(), width - 24, y + 4);
      }
    }

    if (history.length < 2) return;

    // Draw WPM line
    ctx.beginPath();
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 3;
    
    history.forEach((wpm, i) => {
      const x = padding + (i / (history.length - 1)) * chartWidth;
      const y = padding + chartHeight - (wpm / maxWpm) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();

    // Fill WPM gradient under line
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(0, 245, 212, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 245, 212, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Error line if history exists
    if (errorHistory && errorHistory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#ff4d6d';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); // dashed line for errors
      
      errorHistory.forEach((err, i) => {
        const x = padding + (i / (errorHistory.length - 1)) * chartWidth;
        const y = padding + chartHeight - (err / maxErrors) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Draw red dots on error peaks
      ctx.fillStyle = '#ff4d6d';
      errorHistory.forEach((err, i) => {
        if (err > 0 && (i === 0 || err > errorHistory[i-1])) {
          const x = padding + (i / (errorHistory.length - 1)) * chartWidth;
          const y = padding + chartHeight - (err / maxErrors) * chartHeight;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

  }, [history, errorHistory]);

  if (!history || history.length === 0) return null;

  return (
    <div className="w-full mt-8 relative">
      <h3 className="text-[#ffd60a] text-sm tracking-widest text-center mb-4">PERFORMANCE HISTORY</h3>
      <div className="absolute top-2 right-4 flex gap-4 text-xs font-bold">
        <span className="text-[#00f5d4] flex items-center gap-1"><div className="w-3 h-1 bg-[#00f5d4]"></div> WPM</span>
        {errorHistory && <span className="text-[#ff4d6d] flex items-center gap-1"><div className="w-3 border-t-2 border-dashed border-[#ff4d6d]"></div> Errors</span>}
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={260}
        className="w-full h-auto rounded-xl border border-[#2b2b2b] bg-[#101010] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
}

export function ResultScene({ result, onReturnHome }: ResultSceneProps) {
  const [personalBest, setPersonalBest] = useState(false);
  const [leaderboard, setLeaderboard] = useState<StoredScore[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('typeRushScores');
    const scores: StoredScore[] = stored ? JSON.parse(stored) : [];

    const newScore: StoredScore = {
      wpm: result.wpm,
      accuracy: result.accuracy,
      timestamp: Date.now(),
      mode: result.config.mode,
      difficulty: result.config.difficulty
    };

    const modeScores = scores.filter(
      (s) => s.mode === result.config.mode && s.difficulty === result.config.difficulty
    );
    const modeRecord = modeScores[0];
    
    let isPb = false;
    if (!modeRecord || newScore.wpm > modeRecord.wpm) {
      isPb = true;
      setPersonalBest(true);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#ffd60a', '#ff4d6d', '#ff00ff']
      });
    }

    scores.push(newScore);
    scores.sort((a, b) => b.wpm - a.wpm);
    const topScores = scores.slice(0, 10);

    setLeaderboard(topScores);
    localStorage.setItem('typeRushScores', JSON.stringify(scores));
  }, [result]);

  const stats = [
    { label: 'WPM', value: result.wpm, color: '#00f5d4' },
    { label: 'ACCURACY', value: `${result.accuracy}%`, color: '#ffd60a' },
    { label: 'TIME', value: `${(result.timeElapsed / 1000).toFixed(1)}s`, color: '#00f5d4' },
    { label: 'ERRORS', value: result.errors, color: '#ff4d6d' }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 15 } }
  };

  return (
    <div className="w-full h-full bg-transparent overflow-y-auto font-mono relative flex flex-col">

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-20 flex flex-col items-center w-full max-w-4xl p-8 mx-auto my-auto"
      >
        <motion.h1
          variants={itemVariants}
          className={`text-5xl md:text-6xl font-black mb-12 tracking-[0.15em] ${personalBest ? 'text-[#ff00ff]' : 'text-[#00f5d4]'}`}
          style={{ textShadow: personalBest ? '0 0 20px rgba(255,0,255,0.5), 0 0 40px rgba(255,0,255,0.2)' : '0 0 20px rgba(0,245,212,0.5), 0 0 40px rgba(0,245,212,0.2)' }}
        >
          {personalBest ? '🏆 NEW RECORD!' : '✅ TEST COMPLETE'}
        </motion.h1>

        <motion.div variants={containerVariants} className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 w-full">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants} 
              whileHover={{ scale: 1.05 }}
              className="text-center bg-[#1a1a1a] p-6 rounded-2xl border-2 border-[#333] shadow-lg min-w-[140px] md:min-w-[160px] flex-1"
            >
              <p className="text-[#ffd60a] text-xs tracking-[0.1em] mb-3">{stat.label}</p>
              <motion.p 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1), type: 'spring', bounce: 0.6 }}
                className="text-4xl md:text-5xl font-black m-0" 
                style={{ color: stat.color }}
              >
                {stat.value}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {result.wpmHistory && result.wpmHistory.length > 0 && (
          <motion.div variants={itemVariants} className="w-full max-w-4xl mb-12">
            <WpmHistoryChart history={result.wpmHistory} errorHistory={result.errorHistory} duration={result.timeElapsed} />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="w-full max-w-lg bg-[#1a1a1a] rounded-2xl border-2 border-[#333] p-6 mb-12 shadow-xl">
          <h3 className="text-[#ffd60a] text-sm tracking-widest text-center mb-6">TOP SCORES ({result.config.difficulty.toUpperCase()})</h3>
          <div className="flex flex-col gap-3">
            {leaderboard.filter(l => l.difficulty === result.config.difficulty && l.mode === result.config.mode).slice(0, 3).map((score, i) => (
               <div key={i} className="flex justify-between items-center text-sm border-b border-[#333] pb-3 last:border-0 last:pb-0">
                 <span className="text-[#888]">{new Date(score.timestamp).toLocaleDateString()}</span>
                 <div className="flex gap-6">
                   <span className="text-[#00f5d4] font-bold">{score.wpm} WPM</span>
                   <span className="text-[#ffd60a]">{score.accuracy}%</span>
                 </div>
               </div>
            ))}
            {leaderboard.filter(l => l.difficulty === result.config.difficulty && l.mode === result.config.mode).length === 0 && (
              <div className="text-[#888] text-center text-sm">No scores recorded yet.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-6">
           <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,245,212,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onReturnHome}
            className="px-12 py-4 bg-[#00f5d4] text-[#0d0d0d] rounded-xl text-xl font-bold tracking-[0.2em]"
          >
            PLAY AGAIN
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}