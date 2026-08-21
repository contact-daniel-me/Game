import React from "react";
import { CharacterConfig, CharacterType } from "../types/game";
import { X, Check, Shield, Zap, Sparkles } from "lucide-react";

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: CharacterType;
  onSelectCharacter: (type: CharacterType) => void;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: "ragdoll",
    name: "Dr. Bob",
    subtitle: "The Ragdoll Stunt Scientist",
    icon: "👨‍🔬",
    baseHealth: 100,
    weight: 1.0,
    agility: 1.2,
    description: "Equipped with flexible joints, lab coat, and an expressive face that screams when falling."
  },
  {
    id: "unicycle",
    name: "Sir Eggo",
    subtitle: "The Wobbly Monocle Pod",
    icon: "🧐",
    baseHealth: 120,
    weight: 1.3,
    agility: 1.5,
    description: "Spring suspension wheel with gyroscopic recovery. Fast horizontal roll and high bounce."
  },
  {
    id: "wobbly_stack",
    name: "Blocky Trio",
    subtitle: "The Stackable Balancing Plinth",
    icon: "🧱",
    baseHealth: 90,
    weight: 1.6,
    agility: 0.9,
    description: "3 elastic colored cubes trying to stay upright. Hard to balance, but earns 1.5x score bonus!"
  }
];

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  selectedCharacter,
  onSelectCharacter
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="character-select-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-indigo-950 border-4 border-black w-full max-w-xl rounded-3xl p-6 shadow-pop-black-lg flex flex-col gap-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-white/15 pb-3">
          <div>
            <div className="text-xl font-black bg-yellow-400 text-indigo-950 px-3 py-0.5 skew-x-[-10deg] shadow-pop-pink tracking-tight uppercase inline-block">
              Select Test Subject
            </div>
            <p className="text-xs text-cyan-300 font-bold mt-1">
              Each subject features distinctive physical dynamics and limb joints
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-400 border-2 border-black shadow-pop-black text-white flex items-center justify-center cursor-pointer transition-transform active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {CHARACTERS.map((char) => {
            const isSelected = selectedCharacter === char.id;
            return (
              <div
                key={char.id}
                onClick={() => {
                  onSelectCharacter(char.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border-3 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                  isSelected
                    ? "bg-pink-600 border-black shadow-pop-yellow text-white"
                    : "bg-black/40 border-black hover:bg-black/60 shadow-pop-black text-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-950 border-2 border-black flex items-center justify-center text-3xl shadow-pop-black shrink-0">
                    {char.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{char.name}</h3>
                      <span className={`text-[11px] font-black uppercase ${isSelected ? "text-yellow-300" : "text-cyan-300"}`}>
                        • {char.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mt-1 leading-snug font-medium">
                      {char.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                      <span>HP: <strong className="text-yellow-300 font-black">{char.baseHealth}</strong></span>
                      <span>Agility: <strong className="text-cyan-300 font-black">{char.agility}x</strong></span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-indigo-950 flex items-center justify-center border-2 border-black shadow-sm font-black">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  ) : (
                    <button className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 border-2 border-black text-xs font-black text-indigo-950 uppercase tracking-tight shadow-pop-black">
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
