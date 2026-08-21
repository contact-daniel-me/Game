export type CharacterType = "ragdoll" | "unicycle" | "wobbly_stack";

export interface CharacterConfig {
  id: CharacterType;
  name: string;
  subtitle: string;
  icon: string;
  baseHealth: number;
  weight: number;
  agility: number;
  description: string;
}

export type HazardShape = "circle" | "box";
export type HazardBehavior = "floating" | "exploding" | "sticky" | "heavy" | "super_bounce" | "slippery";

export interface SpawnItemConfig {
  name: string;
  emoji: string;
  shape: HazardShape;
  mass: number;
  bounciness: number;
  behavior: HazardBehavior;
  size: number;
  count: number;
}

export type AudioVibe = "panic" | "triumph" | "lofi" | "chaos";
export type ModifierEffect = 
  | "none" 
  | "low_friction" 
  | "super_bounce" 
  | "anti_gravity" 
  | "heavy_ragdoll" 
  | "balloon_mode" 
  | "black_hole"
  | "sideways_wind";

export interface ChaosEvent {
  event_title: string;
  director_commentary: string;
  gravity_vector: {
    x: number;
    y: number;
  };
  speed_multiplier: number;
  spawn_items: SpawnItemConfig[];
  audio_vibe: AudioVibe;
  modifier_effect: ModifierEffect;
  duration: number; // in seconds
}

export interface PostMortemReport {
  report: string;
  verdict: string;
  hilariousTitle: string;
}

export interface CollisionRecord {
  hazardName: string;
  emoji: string;
  damage: number;
  timestamp: number;
  speed: number;
}

export interface PlayerStats {
  score: number;
  highScore: number;
  survivalTime: number; // in seconds
  collisionCount: number;
  shockwavesUsed: number;
  chaosSurvivals: number;
  maxCombo: number;
  itemsDodged: number;
}

export interface ActiveShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface BlackHoleVortex {
  x: number;
  y: number;
  strength: number;
  active: boolean;
  angle: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  text?: string;
  rotation?: number;
  vRot?: number;
  alpha: number;
  shape?: "circle" | "star" | "ring" | "text" | "square";
}
