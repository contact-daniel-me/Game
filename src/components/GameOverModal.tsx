import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { PlayerStats, PostMortemReport, CollisionRecord } from "../types/game";
import { RotateCcw, Trophy, Clock, Skull, Award, Share2, Check, Bot, Zap } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  stats: PlayerStats;
  postMortem: PostMortemReport | null;
  isLoadingPostMortem: boolean;
  fatalCollision: CollisionRecord | null;
  onRestart: () => void;
  onOpenCharacterSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  postMortem,
  isLoadingPostMortem,
  fatalCollision,
  onRestart,
  onOpenCharacterSelect
}) => {
  const [copied, setCopied] = useState(false);
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  useEffect(() => {
    if (isOpen) {
      if (isNewHighScore) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [isOpen, isNewHighScore]);

  if (!isOpen) return null;

  const minutes = Math.floor(stats.survivalTime / 60);
  const seconds = stats.survivalTime % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const handleShare = () => {
    const text = `🎮 I scored ${stats.score} points and survived ${timeFormatted} in Chaos Director! Title: "${postMortem?.hilariousTitle || 'Master of Bad Physics'}"! Can you beat my high score?`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="game-over-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-indigo-950 border-4 border-black w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-pop-black-lg flex flex-col gap-5 relative overflow-hidden text-white">
        {/* Glow Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500 border-2 border-black shadow-pop-black flex items-center justify-center">
              <Skull className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-xl font-black bg-pink-500 text-white px-3 py-0.5 skew-x-[-10deg] shadow-pop-black tracking-tight uppercase inline-block">
                PHYSICS COLLAPSE
              </div>
              <p className="text-xs text-yellow-300 font-bold mt-1">
                Fatal Hazard: {fatalCollision ? `${fatalCollision.emoji} ${fatalCollision.hazardName}` : "Gravity Overload"}
              </p>
            </div>
          </div>

          {isNewHighScore && (
            <div className="px-3 py-1.5 rounded-xl bg-yellow-400 border-2 border-black shadow-pop-pink flex items-center gap-1.5 text-indigo-950 text-xs font-black animate-bounce">
              <Trophy className="w-4 h-4 text-indigo-950" />
              <span>NEW BEST!</span>
            </div>
          )}
        </div>

        {/* AI Incident Report Speech Bubble */}
        <div className="bg-white text-indigo-950 border-3 border-black rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative shadow-pop-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-950" />
              <span className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                Official AI Post-Mortem Roast
              </span>
            </div>
            {postMortem?.verdict && (
              <span className="px-2 py-0.5 rounded-md bg-pink-500 text-white text-[10px] font-black uppercase border border-black">
                {postMortem.verdict}
              </span>
            )}
          </div>

          {isLoadingPostMortem ? (
            <div className="flex items-center gap-2 text-indigo-900 text-sm py-4 font-bold italic">
              <span className="w-4 h-4 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin" />
              <span>AI Director is drafting your comedic incident report...</span>
            </div>
          ) : (
            <>
              <p className="text-sm md:text-base text-indigo-950 leading-relaxed font-bold italic">
                "{postMortem?.report || 'Subject suffered an elastic disagreement with reality. Momentum was victorious.'}"
              </p>

              {postMortem?.hilariousTitle && (
                <div className="flex items-center gap-2 pt-2 border-t-2 border-indigo-950/20">
                  <Award className="w-4 h-4 text-pink-600" />
                  <span className="text-xs font-black text-indigo-950 uppercase">
                    Honorary Title: "{postMortem.hilariousTitle}"
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/50 rounded-2xl p-3 border-2 border-black shadow-pop-black text-center">
            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Final Score</p>
            <p className="text-2xl font-black italic tracking-tighter text-yellow-400 font-mono">
              {stats.score.toLocaleString()}
            </p>
          </div>
          <div className="bg-black/50 rounded-2xl p-3 border-2 border-black shadow-pop-black text-center">
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Survived</p>
            <p className="text-2xl font-black italic tracking-tighter text-cyan-300 font-mono">{timeFormatted}</p>
          </div>
          <div className="bg-black/50 rounded-2xl p-3 border-2 border-black shadow-pop-black text-center">
            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Collisions</p>
            <p className="text-2xl font-black italic tracking-tighter text-pink-400 font-mono">{stats.collisionCount}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            id="btn-play-again"
            onClick={onRestart}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 active:translate-y-1 border-b-4 border-yellow-700 text-indigo-950 font-black text-sm uppercase tracking-tight flex items-center justify-center gap-2 shadow-pop-pink transition-transform cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="btn-share-score"
            onClick={handleShare}
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:translate-y-1 border-b-4 border-cyan-800 text-indigo-950 font-black text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-pop-black transition-transform cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Share2 className="w-4 h-4 stroke-[2.5]" />}
            <span>{copied ? "Copied!" : "Share Roast"}</span>
          </button>

          <button
            id="btn-change-char-gameover"
            onClick={onOpenCharacterSelect}
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-indigo-900 hover:bg-indigo-800 active:translate-y-1 border-b-4 border-indigo-950 text-white font-black text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-pop-black transition-transform cursor-pointer"
          >
            Switch Subject
          </button>
        </div>
      </div>
    </div>
  );
};
