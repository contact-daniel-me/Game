import React, { useState, useEffect } from "react";
import { ChaosEvent, PlayerStats } from "../types/game";
import { Bot, Flame, Heart, Trophy, Clock, AlertTriangle, Zap, Dices, RefreshCw } from "lucide-react";

interface HUDProps {
  stats: PlayerStats;
  health: number;
  maxHealth: number;
  chaosLevel: number;
  currentEvent: ChaosEvent | null;
  eventTimeRemaining: number;
  isAiLoading: boolean;
  onTriggerChaos: () => void;
  onOpenChaosDrawer: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  health,
  maxHealth,
  chaosLevel,
  currentEvent,
  eventTimeRemaining,
  isAiLoading,
  onTriggerChaos,
  onOpenChaosDrawer
}) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const commentaryText =
    currentEvent?.director_commentary ||
    "Gravity is so last Tuesday. I have swapped your mass for that of a particularly heavy marshmallow. Try not to bounce into the sun!";

  // Typewriter effect for Director Commentary
  useEffect(() => {
    setDisplayedText("");
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < commentaryText.length) {
        setDisplayedText((prev) => prev + commentaryText.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [commentaryText]);

  // Format survival timer
  const minutes = Math.floor(stats.survivalTime / 60);
  const seconds = stats.survivalTime % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Health percent
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  // Chaos status text based on meter
  const chaosStatus =
    chaosLevel > 80
      ? "CRITICAL HYSTERIA"
      : chaosLevel > 55
      ? "MAXIMUM ABSURDITY"
      : chaosLevel > 30
      ? "ESCALATING CHAOS"
      : "NOMINAL TESTING";

  return (
    <div id="game-hud" className="w-full flex flex-col gap-3.5">
      {/* Top Stat Bar - Vibrant Pop Arcade Aesthetic */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Score & High Score */}
        <div
          id="stat-score-card"
          className="bg-black/50 backdrop-blur-sm border-2 border-black rounded-2xl p-3 shadow-pop-black flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-yellow-400 font-black">
              Score
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span>BEST: {stats.highScore.toLocaleString()}</span>
            </div>
          </div>
          <span className="text-3xl font-black italic tracking-tighter text-yellow-400 font-mono mt-1">
            {stats.score.toLocaleString().padStart(6, "0")}
          </span>
        </div>

        {/* Survival Time */}
        <div
          id="stat-time-card"
          className="bg-black/50 backdrop-blur-sm border-2 border-black rounded-2xl p-3 shadow-pop-black flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">
              Survival Time
            </span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-3xl font-black italic tracking-tighter text-cyan-300 font-mono mt-1">
            {timeFormatted}
          </span>
        </div>

        {/* Vitality / Health Bar */}
        <div
          id="stat-health-card"
          className="bg-black/50 backdrop-blur-sm border-2 border-black rounded-2xl p-3 shadow-pop-black flex flex-col justify-between gap-1.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-rose-400 font-black">
                Vitality
              </span>
            </div>
            <span className="text-xs font-mono font-black text-white">
              {health}/{maxHealth} HP
            </span>
          </div>
          <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/20 p-0.5">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                healthPercent > 50
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_#34d399]"
                  : healthPercent > 25
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_8px_#facc15]"
                  : "bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_10px_#f43f5e] animate-pulse"
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Chaos Meter */}
        <div
          id="stat-chaos-card"
          className="bg-black/50 backdrop-blur-sm border-2 border-black rounded-2xl p-3 shadow-pop-black flex flex-col justify-between gap-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-pink-500 font-black">
              Chaos Meter
            </span>
            <span className="text-xs font-mono font-black text-pink-300">{chaosLevel}%</span>
          </div>
          <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/20 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full shadow-[0_0_10px_#f472b6] transition-all duration-300"
              style={{ width: `${chaosLevel}%` }}
            />
          </div>
          <span className="text-[10px] text-pink-400 font-bold italic truncate">
            Status: {chaosStatus}
          </span>
        </div>
      </div>

      {/* Gemini AI Director Comic Speech Bubble Bar */}
      <div className="relative">
        <div
          id="director-speech-bubble"
          className="bg-white text-indigo-950 p-4 md:p-5 rounded-2xl border-4 border-black shadow-pop-black-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-20"
        >
          {/* Left: Director Header & Dynamic Commentary */}
          <div className="flex items-start gap-3 flex-1">
            {/* Pulsing indicator & Avatar */}
            <div className="w-11 h-11 rounded-xl bg-indigo-950 border-2 border-black flex items-center justify-center shrink-0 shadow-sm relative">
              <Bot className={`w-6 h-6 ${isAiLoading ? "text-yellow-400 animate-spin" : "text-cyan-400"}`} />
              <div className="w-3 h-3 bg-green-500 rounded-full absolute -top-1 -right-1 border-2 border-black animate-pulse" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-tight text-indigo-950 bg-yellow-300 px-2 py-0.5 rounded border border-black shadow-xs">
                  Gemini AI Chaos Director
                </span>
                {currentEvent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-pink-500 text-white border border-black shadow-xs">
                    {currentEvent.event_title} ({eventTimeRemaining}s)
                  </span>
                )}
                {isAiLoading && (
                  <span className="text-[11px] text-purple-700 font-black italic flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-purple-600" /> Computing absurdity...
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base font-bold leading-snug italic text-indigo-950 pt-0.5">
                "{displayedText}"
              </p>
            </div>
          </div>

          {/* Right: Vibrant Pop Buttons */}
          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
            <button
              id="btn-trigger-ai-chaos"
              onClick={onTriggerChaos}
              disabled={isAiLoading}
              className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 active:translate-y-0.5 border-b-4 border-pink-950 text-white font-black text-xs uppercase tracking-tight rounded-xl flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              title="Force AI Director Mutation (E key)"
            >
              <Dices className={`w-4 h-4 text-white ${isAiLoading ? "animate-spin" : ""}`} />
              <span>MUTATE [E]</span>
            </button>

            <button
              id="btn-open-chaos-lab"
              onClick={onOpenChaosDrawer}
              className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 active:translate-y-0.5 border-b-4 border-cyan-800 text-indigo-950 font-black text-xs uppercase tracking-tight rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Open Sandbox Lab"
            >
              <Zap className="w-4 h-4 text-indigo-950 fill-indigo-950" />
              <span>SANDBOX LAB</span>
            </button>
          </div>
        </div>

        {/* Speech Bubble Arrow Tail */}
        <div className="hidden sm:block absolute -bottom-3 left-12 w-6 h-6 bg-white border-b-4 border-r-4 border-black rotate-45 z-10" />
      </div>
    </div>
  );
};
