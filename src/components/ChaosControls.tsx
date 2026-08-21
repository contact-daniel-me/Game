import React from "react";
import { LOCAL_ITEMS_CATALOG } from "../services/fallbackDirector";
import { SpawnItemConfig } from "../types/game";
import { X, Sparkles, Wind, ArrowUpDown, RefreshCw, Trash2, Zap, CircleDot, Bomb } from "lucide-react";

interface ChaosControlsProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawnItem: (item: SpawnItemConfig) => void;
  onApplyPreset: (presetName: string) => void;
  onClearHazards: () => void;
  onGravityChange: (gx: number, gy: number) => void;
  currentGravity: { x: number; y: number };
}

export const ChaosControls: React.FC<ChaosControlsProps> = ({
  isOpen,
  onClose,
  onSpawnItem,
  onApplyPreset,
  onClearHazards,
  onGravityChange,
  currentGravity
}) => {
  if (!isOpen) return null;

  const presets = [
    { name: "Zero-G Invert", desc: "Float freely with reverse gravity", icon: "🛸", id: "zero_g" },
    { name: "Bouncy Castle", desc: "Super high elasticity on everything", icon: "🍮", id: "bouncy_castle" },
    { name: "Black Hole Vortex", desc: "Singularity pulling all matter", icon: "🌌", id: "vortex" },
    { name: "Duck Apocalypse", desc: "Flood the arena with 10 rubber ducks", icon: "🦆", id: "duck_swarm" },
    { name: "Espresso Tsunami", desc: "Hot coffee rain storm", icon: "☕", id: "coffee_rain" },
    { name: "Heavy Anvils", desc: "16-ton crushing masses", icon: "🏋️", id: "anvil_drop" },
    { name: "Slippery Ice", desc: "Zero friction on all surfaces", icon: "🍕", id: "low_friction" },
    { name: "Sideways Hurricane", desc: "Extreme horizontal wind gale", icon: "💨", id: "hurricane" }
  ];

  return (
    <div
      id="chaos-controls-drawer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-indigo-950 border-4 border-black w-full max-w-2xl rounded-3xl p-6 shadow-pop-black-lg flex flex-col gap-5 max-h-[90vh] overflow-y-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-white/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 border-2 border-black shadow-pop-black flex items-center justify-center">
              <Zap className="w-6 h-6 text-indigo-950 fill-indigo-950" />
            </div>
            <div>
              <div className="text-xl font-black bg-yellow-400 text-indigo-950 px-3 py-0.5 skew-x-[-10deg] shadow-pop-pink tracking-tight uppercase inline-block">
                Director's Sandbox Lab
              </div>
              <p className="text-xs text-cyan-300 font-bold mt-1">
                Override physics parameters or spawn custom hazards on demand
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-400 border-2 border-black shadow-pop-black text-white flex items-center justify-center transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* 1. Quick Presets */}
        <div>
          <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Instant Chaos Presets</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => onApplyPreset(p.id)}
                className="p-3 rounded-2xl bg-black/50 hover:bg-pink-600 active:translate-y-0.5 border-2 border-black shadow-pop-black text-left transition-all flex flex-col gap-1 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[10px] font-black text-cyan-300 group-hover:text-white uppercase tracking-wider font-mono">
                    APPLY
                  </span>
                </div>
                <p className="text-xs font-black text-white leading-tight">
                  {p.name}
                </p>
                <p className="text-[10px] text-white/60 group-hover:text-white/90 leading-tight truncate font-medium">
                  {p.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Physics Fine-Tuning Sliders */}
        <div className="bg-black/50 rounded-2xl p-4 border-2 border-black shadow-pop-black flex flex-col gap-4">
          <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-cyan-400" />
            <span>Real-time Gravity Tweaks</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vertical Gravity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white font-bold">Vertical Gravity (Y)</span>
                <span className="font-mono text-yellow-400 font-black">
                  {currentGravity.y.toFixed(2)}G
                </span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="2.5"
                step="0.1"
                value={currentGravity.y}
                onChange={(e) =>
                  onGravityChange(currentGravity.x, parseFloat(e.target.value))
                }
                className="w-full h-2.5 bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />
            </div>

            {/* Horizontal Wind */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white font-bold">Horizontal Wind (X)</span>
                <span className="font-mono text-pink-400 font-black">
                  {currentGravity.x.toFixed(2)}G
                </span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.1"
                value={currentGravity.x}
                onChange={(e) =>
                  onGravityChange(parseFloat(e.target.value), currentGravity.y)
                }
                className="w-full h-2.5 bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Manual Item Spawner Catalog */}
        <div>
          <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Bomb className="w-4 h-4 text-pink-400" />
            <span>Spawn Absurd Items</span>
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {Object.entries(LOCAL_ITEMS_CATALOG).map(([key, item]) => (
              <button
                key={key}
                onClick={() => onSpawnItem(item)}
                className="p-2.5 rounded-2xl bg-black/40 hover:bg-cyan-400 hover:text-indigo-950 active:translate-y-0.5 border-2 border-black shadow-pop-black flex flex-col items-center gap-1 text-center transition-all cursor-pointer group"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[11px] font-black text-white group-hover:text-indigo-950 truncate max-w-full">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 border-b-4 border-yellow-700 text-indigo-950 font-black text-xs uppercase tracking-tight shadow-pop-pink transition-transform cursor-pointer"
        >
          Return to Arena
        </button>
      </div>
    </div>
  );
};
