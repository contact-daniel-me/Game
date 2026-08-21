import React, { useState, useEffect, useRef, useCallback } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { HUD } from "./components/HUD";
import { ChaosControls } from "./components/ChaosControls";
import { GameOverModal } from "./components/GameOverModal";
import { CharacterSelectModal, CHARACTERS } from "./components/CharacterSelectModal";
import { HelpModal } from "./components/HelpModal";
import { fetchChaosEvent, fetchPostMortem } from "./services/geminiDirector";
import { audioEngine } from "./services/audioEngine";
import {
  CharacterType,
  ChaosEvent,
  PlayerStats,
  CollisionRecord,
  PostMortemReport,
  SpawnItemConfig
} from "./types/game";
import {
  Bot,
  Flame,
  Zap,
  HelpCircle,
  Users,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders
} from "lucide-react";

export default function App() {
  // Game Lifecycle State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [characterType, setCharacterType] = useState<CharacterType>("ragdoll");

  // Health & Stats State
  const [health, setHealth] = useState<number>(100);
  const [maxHealth, setMaxHealth] = useState<number>(100);
  const [chaosLevel, setChaosLevel] = useState<number>(20);
  const [stats, setStats] = useState<PlayerStats>(() => {
    const savedHighScore = localStorage.getItem("chaos_director_high_score");
    return {
      score: 0,
      highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
      survivalTime: 0,
      collisionCount: 0,
      shockwavesUsed: 0,
      chaosSurvivals: 0,
      maxCombo: 1,
      itemsDodged: 0
    };
  });

  // AI Chaos Director State
  const [currentEvent, setCurrentEvent] = useState<ChaosEvent | null>(null);
  const [eventTimeRemaining, setEventTimeRemaining] = useState<number>(0);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [recentHazards, setRecentHazards] = useState<string[]>([]);
  const [fatalCollision, setFatalCollision] = useState<CollisionRecord | null>(null);
  const [postMortem, setPostMortem] = useState<PostMortemReport | null>(null);
  const [isLoadingPostMortem, setIsLoadingPostMortem] = useState<boolean>(false);

  // Modals & Drawers
  const [isChaosLabOpen, setIsChaosLabOpen] = useState<boolean>(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentGravity, setCurrentGravity] = useState<{ x: number; y: number }>({ x: 0, y: 1.0 });

  // References for Timers & Interval Loops
  const eventTimerRef = useRef<number | null>(null);
  const aiDirectorIntervalRef = useRef<number | null>(null);
  const survivalTickerRef = useRef<number | null>(null);

  const selectedCharConfig = CHARACTERS.find((c) => c.id === characterType) || CHARACTERS[0];

  // Initialize Game Run
  const startGame = useCallback(() => {
    const char = CHARACTERS.find((c) => c.id === characterType) || CHARACTERS[0];
    setHealth(char.baseHealth);
    setMaxHealth(char.baseHealth);
    setChaosLevel(20);
    setIsGameOver(false);
    setIsPlaying(true);
    setFatalCollision(null);
    setPostMortem(null);
    setRecentHazards([]);

    setStats((prev) => ({
      ...prev,
      score: 0,
      survivalTime: 0,
      collisionCount: 0,
      shockwavesUsed: 0,
      chaosSurvivals: 0
    }));

    audioEngine.startBGM();
    audioEngine.playLevelUp();

    // Trigger Initial Welcome Event
    triggerAiDirectorEvent();
  }, [characterType]);

  // Handle Character Selection
  const handleSelectCharacter = (type: CharacterType) => {
    setCharacterType(type);
    const char = CHARACTERS.find((c) => c.id === type) || CHARACTERS[0];
    setHealth(char.baseHealth);
    setMaxHealth(char.baseHealth);
  };

  // Trigger Chaos Mutation from Gemini Director
  const triggerAiDirectorEvent = useCallback(async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);

    try {
      const event = await fetchChaosEvent({
        score: stats.score,
        survivalTime: stats.survivalTime,
        collisionCount: stats.collisionCount,
        chaosLevel,
        characterName: selectedCharConfig.name,
        recentItems: recentHazards.slice(-5)
      });

      setCurrentEvent(event);
      setEventTimeRemaining(event.duration || 12);
      setCurrentGravity(event.gravity_vector || { x: 0, y: 1.0 });

      // Increase chaos over time
      setChaosLevel((prev) => Math.min(100, prev + 8));

      // Update High Score if needed
      setStats((prev) => {
        const nextScore = prev.score + 100;
        const nextHighScore = Math.max(prev.highScore, nextScore);
        if (nextHighScore > prev.highScore) {
          localStorage.setItem("chaos_director_high_score", nextHighScore.toString());
        }
        return {
          ...prev,
          score: nextScore,
          highScore: nextHighScore,
          chaosSurvivals: prev.chaosSurvivals + 1
        };
      });
    } catch (err) {
      console.error("AI Director Trigger Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  }, [isAiLoading, stats, chaosLevel, selectedCharConfig, recentHazards]);

  // Main Survival Timer & Director Interval Ticker
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      // 1. Survival Time ticker (every 1s)
      survivalTickerRef.current = window.setInterval(() => {
        setStats((prev) => {
          const nextScore = prev.score + 25;
          const nextTime = prev.survivalTime + 1;
          const nextHighScore = Math.max(prev.highScore, nextScore);
          if (nextHighScore > prev.highScore) {
            localStorage.setItem("chaos_director_high_score", nextHighScore.toString());
          }
          return {
            ...prev,
            score: nextScore,
            highScore: nextHighScore,
            survivalTime: nextTime
          };
        });

        // Slowly ramp up chaos
        setChaosLevel((prev) => Math.min(100, prev + 1));
      }, 1000);

      // 2. Active Event Countdown
      eventTimerRef.current = window.setInterval(() => {
        setEventTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 3. AI Director Auto Mutation Loop (every 13s)
      aiDirectorIntervalRef.current = window.setInterval(() => {
        triggerAiDirectorEvent();
      }, 13000);
    }

    return () => {
      if (survivalTickerRef.current) clearInterval(survivalTickerRef.current);
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
      if (aiDirectorIntervalRef.current) clearInterval(aiDirectorIntervalRef.current);
    };
  }, [isPlaying, isGameOver, triggerAiDirectorEvent]);

  // Damage & Collision Handler
  const handleDamage = (amount: number, hazard: string, emoji: string) => {
    if (isGameOver) return;

    setRecentHazards((prev) => [...prev.slice(-6), `${emoji} ${hazard}`]);
    setStats((prev) => ({ ...prev, collisionCount: prev.collisionCount + 1 }));

    setHealth((prev) => {
      const nextHealth = Math.max(0, prev - amount);
      if (nextHealth <= 0) {
        // Trigger Game Over
        handleGameOver({
          hazardName: hazard,
          emoji,
          damage: amount,
          timestamp: Date.now(),
          speed: 10
        });
      }
      return nextHealth;
    });
  };

  // Score Adding
  const handleScoreAdd = (points: number, reason: string) => {
    setStats((prev) => {
      const nextScore = prev.score + points;
      const nextHighScore = Math.max(prev.highScore, nextScore);
      if (nextHighScore > prev.highScore) {
        localStorage.setItem("chaos_director_high_score", nextHighScore.toString());
      }
      return {
        ...prev,
        score: nextScore,
        highScore: nextHighScore
      };
    });
  };

  // Game Over sequence
  const handleGameOver = async (record: CollisionRecord) => {
    setIsGameOver(true);
    setIsPlaying(false);
    setFatalCollision(record);
    audioEngine.playGameOver();
    audioEngine.stopBGM();

    // Fetch AI Post-Mortem Roast
    setIsLoadingPostMortem(true);
    try {
      const pm = await fetchPostMortem({
        score: stats.score,
        survivalTime: stats.survivalTime,
        finalHazard: `${record.emoji} ${record.hazardName}`,
        topCollisions: recentHazards,
        characterName: selectedCharConfig.name
      });
      setPostMortem(pm);
    } catch (err) {
      console.error("Post-mortem fetch error:", err);
    } finally {
      setIsLoadingPostMortem(false);
    }
  };

  // Shockwave usage
  const handleUseShockwave = () => {
    setStats((prev) => ({ ...prev, shockwavesUsed: prev.shockwavesUsed + 1 }));
  };

  // Sandbox Presets
  const handleApplyPreset = (presetName: string) => {
    if (!currentEvent) {
      triggerAiDirectorEvent();
    }
    if (presetName === "zero_g") {
      setCurrentGravity({ x: 0, y: -0.6 });
      if (currentEvent) currentEvent.gravity_vector = { x: 0, y: -0.6 };
      audioEngine.playGravityFlip();
    } else if (presetName === "bouncy_castle") {
      if (currentEvent) currentEvent.modifier_effect = "super_bounce";
      audioEngine.playBounce(12);
    } else if (presetName === "vortex") {
      if (currentEvent) currentEvent.modifier_effect = "black_hole";
      audioEngine.playExplosion();
    } else if (presetName === "low_friction") {
      if (currentEvent) currentEvent.modifier_effect = "low_friction";
    } else if (presetName === "hurricane") {
      setCurrentGravity({ x: 1.4, y: 0.2 });
      if (currentEvent) currentEvent.gravity_vector = { x: 1.4, y: 0.2 };
    }
    setChaosLevel((prev) => Math.min(100, prev + 15));
    setIsChaosLabOpen(false);
  };

  const handleGravityChange = (gx: number, gy: number) => {
    setCurrentGravity({ x: gx, y: gy });
    if (currentEvent) {
      currentEvent.gravity_vector = { x: gx, y: gy };
    }
  };

  const toggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <main className="min-h-screen bg-indigo-950 bg-comic-dots text-white flex flex-col items-center justify-between p-3 md:p-6 select-none font-sans overflow-x-hidden relative">
      {/* Top Header - Vibrant Palette Style with Yellow Accent Border */}
      <header className="w-full max-w-5xl flex items-center justify-between px-4 sm:px-6 py-3 bg-black/40 border-b-4 border-yellow-400 rounded-2xl shadow-pop-black mb-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start">
            <div className="text-xl sm:text-2xl font-black bg-yellow-400 text-indigo-950 px-3.5 py-1 skew-x-[-10deg] shadow-[4px_4px_0px_#f472b6] tracking-tight uppercase">
              CHAOS DIRECTOR
            </div>
            <span className="text-[10px] mt-1 text-white/60 uppercase tracking-widest font-bold">
              v1.0.4 • Absurdity_Engaged
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Character Badge / Selector */}
          <button
            id="nav-character-btn"
            onClick={() => setIsCharacterModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 border-2 border-black shadow-pop-pink flex items-center gap-2 text-xs font-black text-white uppercase tracking-tight transition-transform active:translate-y-0.5 cursor-pointer"
            title="Change Character"
          >
            <span className="text-base">{selectedCharConfig.icon}</span>
            <span className="hidden sm:inline">{selectedCharConfig.name}</span>
          </button>

          {/* Sandbox Lab Button */}
          <button
            id="nav-sandbox-btn"
            onClick={() => setIsChaosLabOpen(true)}
            className="p-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 border-2 border-black shadow-pop-black text-indigo-950 flex items-center justify-center transition-transform active:translate-y-0.5 cursor-pointer"
            title="Sandbox Lab (Physics Overrides)"
          >
            <Sliders className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Help Button */}
          <button
            id="nav-help-btn"
            onClick={() => setIsHelpModalOpen(true)}
            className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 border-2 border-black shadow-pop-black text-indigo-950 flex items-center justify-center transition-transform active:translate-y-0.5 cursor-pointer"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Audio Mute Button */}
          <button
            id="nav-mute-btn"
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 border-2 border-black shadow-pop-black text-white flex items-center justify-center transition-transform active:translate-y-0.5 cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 stroke-[2.5]" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>
      </header>

      {/* Main Game Arena Container */}
      <div className="w-full max-w-5xl flex flex-col gap-3.5 flex-1 justify-center relative">
        {/* HUD Top Bar with Health, Scores & Dialogue */}
        <HUD
          stats={stats}
          health={health}
          maxHealth={maxHealth}
          chaosLevel={chaosLevel}
          currentEvent={currentEvent}
          eventTimeRemaining={eventTimeRemaining}
          isAiLoading={isAiLoading}
          onTriggerChaos={triggerAiDirectorEvent}
          onOpenChaosDrawer={() => setIsChaosLabOpen(true)}
        />

        {/* Physics Canvas Sandbox Container */}
        <div className="relative mt-1">
          <GameCanvas
            isPlaying={isPlaying}
            isGameOver={isGameOver}
            characterType={characterType}
            chaosLevel={chaosLevel}
            currentEvent={currentEvent}
            onDamage={handleDamage}
            onScoreAdd={handleScoreAdd}
            onGameOver={handleGameOver}
            onTriggerChaosManual={triggerAiDirectorEvent}
            shockwaveCount={stats.shockwavesUsed}
            onUseShockwave={handleUseShockwave}
          />

          {/* Ready Overlay Screen on First Launch */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-md rounded-2xl border-4 border-black flex flex-col items-center justify-center p-6 text-center z-20 shadow-pop-black-lg">
              <div className="text-3xl font-black bg-yellow-400 text-indigo-950 px-5 py-2 skew-x-[-10deg] shadow-[6px_6px_0px_#f472b6] tracking-tight uppercase mb-4">
                READY FOR ABSURDITY, {selectedCharConfig.name.toUpperCase()}?
              </div>

              <div className="w-16 h-16 rounded-2xl bg-pink-500 border-4 border-black shadow-pop-black p-1 mb-4 flex items-center justify-center">
                <Bot className="w-9 h-9 text-white animate-bounce" />
              </div>

              <p className="text-sm md:text-base text-cyan-200 font-bold max-w-md mb-6 leading-relaxed bg-black/40 p-4 rounded-xl border border-cyan-400/40">
                Guide your wobbling ragdoll character through dynamic gravity inversions, exploding rubber ducks, scalding espresso, and live satirical commentary from Google Gemini!
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  id="btn-start-game"
                  onClick={startGame}
                  className="px-8 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 active:translate-y-1 border-b-4 border-yellow-700 text-indigo-950 font-black text-base uppercase tracking-tight shadow-pop-pink flex items-center gap-2 transition-transform cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-indigo-950" />
                  <span>START EXPERIMENT</span>
                </button>

                <button
                  onClick={() => setIsHelpModalOpen(true)}
                  className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:translate-y-1 border-b-4 border-cyan-800 text-indigo-950 font-black text-xs uppercase tracking-tight shadow-pop-black transition-transform cursor-pointer"
                >
                  How to Play
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Instructions */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 border-t-2 border-white/10 pt-3 mt-3 gap-2">
        <div className="flex items-center gap-4">
          <span className="font-mono font-bold text-yellow-300">
            [WASD/Arrows] Move • [Space] Shockwave • [R] Gyro • [E] Mutate • [Mouse] Tug
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-pink-400 font-black">Google Gemini 3.7 • Vibrant Physics Engine</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <GameOverModal
        isOpen={isGameOver}
        stats={stats}
        postMortem={postMortem}
        isLoadingPostMortem={isLoadingPostMortem}
        fatalCollision={fatalCollision}
        onRestart={startGame}
        onOpenCharacterSelect={() => {
          setIsGameOver(false);
          setIsCharacterModalOpen(true);
        }}
      />

      <ChaosControls
        isOpen={isChaosLabOpen}
        onClose={() => setIsChaosLabOpen(false)}
        onSpawnItem={(item) => {
          if (currentEvent) {
            currentEvent.spawn_items.push({ ...item, count: 2 });
          }
          setIsChaosLabOpen(false);
        }}
        onApplyPreset={handleApplyPreset}
        onClearHazards={() => {
          setIsChaosLabOpen(false);
        }}
        onGravityChange={handleGravityChange}
        currentGravity={currentGravity}
      />

      <CharacterSelectModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        selectedCharacter={characterType}
        onSelectCharacter={handleSelectCharacter}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </main>
  );
}
