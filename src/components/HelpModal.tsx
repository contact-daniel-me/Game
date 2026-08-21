import React from "react";
import { X, Keyboard, Zap, Sparkles, Bot, Shield, MousePointer, Flame } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="help-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-indigo-950 border-4 border-black w-full max-w-xl rounded-3xl p-6 shadow-pop-black-lg flex flex-col gap-5 max-h-[85vh] overflow-y-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-white/15 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400 border-2 border-black shadow-pop-black flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xl font-black bg-yellow-400 text-indigo-950 px-3 py-0.5 skew-x-[-10deg] shadow-pop-pink tracking-tight uppercase inline-block">
                How to Play Chaos Director
              </div>
              <p className="text-xs text-cyan-300 font-bold mt-1">
                Survive absurd physics experiments orchestrated by Google Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-400 border-2 border-black shadow-pop-black text-white flex items-center justify-center cursor-pointer transition-transform active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Game Rules Overview */}
        <div className="flex flex-col gap-3 text-sm">
          <div className="p-3.5 rounded-2xl bg-black/40 border-2 border-black shadow-pop-black flex items-start gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-black text-yellow-400 text-xs uppercase tracking-widest">The Goal</h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed font-medium">
                Stay balanced, dodge absurd falling hazards (rubber ducks, boiling espresso, 16-ton anvils, sticky bubbles), and survive escalating physics mutations orchestrated in real-time by Google Gemini.
              </p>
            </div>
          </div>

          {/* Key Controls Grid */}
          <div className="p-4 rounded-2xl bg-black/50 border-2 border-black shadow-pop-black flex flex-col gap-2.5">
            <h3 className="font-black text-cyan-400 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Controls & Shortcuts</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-900/80 border-2 border-black">
                <span className="text-white/70 font-bold">WASD / Arrows</span>
                <span className="font-black text-yellow-300">Move & Balance</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-900/80 border-2 border-black">
                <span className="text-white/70 font-bold">Space / Right-Click</span>
                <span className="font-black text-pink-400">Blast Wave</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-900/80 border-2 border-black">
                <span className="text-white/70 font-bold">R Key</span>
                <span className="font-black text-cyan-300">Gyro Stabilizer</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-900/80 border-2 border-black">
                <span className="text-white/70 font-bold">E Key</span>
                <span className="font-black text-yellow-300">AI Mutation</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-900/80 border-2 border-black">
                <span className="text-white/70 font-bold">M Key</span>
                <span className="font-black text-cyan-300">Toggle Mute</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-900/80 border-2 border-black">
                <span className="text-white/70 font-bold">Mouse Drag</span>
                <span className="font-black text-pink-400">Direct Physics Tug</span>
              </div>
            </div>
          </div>

          {/* Hazard Guide */}
          <div className="p-3.5 rounded-2xl bg-black/40 border-2 border-black shadow-pop-black flex items-start gap-3">
            <span className="text-3xl">🦆</span>
            <div>
              <h3 className="font-black text-pink-400 text-xs uppercase tracking-widest">Absurd Hazards</h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed font-medium">
                Watch out for explosive TNT boxes, high-velocity rubber ducks, and slippery mozzarella pizza oil that reduces ground friction to zero!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 active:translate-y-1 border-b-4 border-yellow-700 text-indigo-950 font-black text-xs uppercase tracking-tight shadow-pop-pink transition-transform cursor-pointer"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
