import React, { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import { PhysicsWorld, CustomBodyData } from "../services/physicsEngine";
import { ParticleEngine } from "../services/particleSystem";
import { audioEngine } from "../services/audioEngine";
import { CharacterType, ChaosEvent, CollisionRecord, BlackHoleVortex } from "../types/game";
import { Zap, RotateCcw, Volume2, VolumeX, Sparkles, Shield, ArrowUp, ArrowLeft, ArrowRight } from "lucide-react";

interface GameCanvasProps {
  isPlaying: boolean;
  isGameOver: boolean;
  characterType: CharacterType;
  chaosLevel: number;
  currentEvent: ChaosEvent | null;
  onDamage: (amount: number, hazard: string, emoji: string) => void;
  onScoreAdd: (points: number, reason: string) => void;
  onGameOver: (record: CollisionRecord) => void;
  onTriggerChaosManual: () => void;
  shockwaveCount: number;
  onUseShockwave: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  isGameOver,
  characterType,
  chaosLevel,
  currentEvent,
  onDamage,
  onScoreAdd,
  onGameOver,
  onTriggerChaosManual,
  shockwaveCount,
  onUseShockwave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef<PhysicsWorld | null>(null);
  const particleEngineRef = useRef<ParticleEngine>(new ParticleEngine());
  
  const [screenShake, setScreenShake] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [vortexActive, setVortexActive] = useState<boolean>(false);
  
  // Game loop & state refs
  const lastTimeRef = useRef<number>(performance.now());
  const requestRef = useRef<number | null>(null);
  const invulnerableUntilRef = useRef<number>(0);
  const vortexRef = useRef<BlackHoleVortex>({ x: 450, y: 250, strength: 2.5, active: false, angle: 0 });
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const recentCollisionsRef = useRef<CollisionRecord[]>([]);
  const shockwaveCooldownRef = useRef<number>(0);
  const faceMoodTimeRef = useRef<number>(0);

  // Setup Physics World
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const width = containerRef.current.clientWidth || 900;
    const height = Math.max(500, containerRef.current.clientHeight || 600);

    const pw = new PhysicsWorld(width, height);
    pw.spawnCharacter(characterType);
    physicsRef.current = pw;

    // Handle Collisions
    Matter.Events.on(pw.engine, "collisionStart", (event) => {
      if (isGameOver) return;
      
      const pairs = event.pairs;
      pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        const dataA = (bodyA as any).customData as CustomBodyData | undefined;
        const dataB = (bodyB as any).customData as CustomBodyData | undefined;

        const isPlayerA = dataA?.isPlayer;
        const isPlayerB = dataB?.isPlayer;
        const isHazardA = dataA?.isHazard;
        const isHazardB = dataB?.isHazard;

        // Player collision with hazard
        if ((isPlayerA && isHazardB) || (isPlayerB && isHazardA)) {
          const playerBody = isPlayerA ? bodyA : bodyB;
          const hazardBody = isHazardA ? bodyA : bodyB;
          const hazardData = (isHazardA ? dataA : dataB) as CustomBodyData;

          // Relative impact velocity
          const relVx = bodyA.velocity.x - bodyB.velocity.x;
          const relVy = bodyA.velocity.y - bodyB.velocity.y;
          const impactSpeed = Math.hypot(relVx, relVy);

          if (impactSpeed > 2.2) {
            const now = Date.now();
            const contactPoint = pair.collision.supports[0] || playerBody.position;

            // Trigger sound by hazard type
            if (hazardData.name?.includes("Duck")) {
              audioEngine.playQuack();
            } else if (hazardData.name?.includes("Coffee")) {
              audioEngine.playCoffeeSplash();
            } else if (hazardData.name?.includes("Anvil")) {
              audioEngine.playAnvilClank();
            } else {
              audioEngine.playBounce(impactSpeed);
            }

            // Screen shake
            setScreenShake({
              x: (Math.random() - 0.5) * Math.min(18, impactSpeed * 3),
              y: (Math.random() - 0.5) * Math.min(18, impactSpeed * 3)
            });

            // Particles
            particleEngineRef.current.addImpactSparks(
              contactPoint.x,
              contactPoint.y,
              hazardData.color || "#f43f5e",
              Math.floor(impactSpeed * 3)
            );

            // Floating text
            particleEngineRef.current.addFloatingText(
              contactPoint.x,
              contactPoint.y - 20,
              `-${Math.round(hazardData.damageValue || 15)} HP`,
              "#ff0055"
            );

            // Hurt face trigger
            faceMoodTimeRef.current = now + 900;

            // Apply damage if not in brief invulnerability
            if (now > invulnerableUntilRef.current) {
              const damage = Math.round(hazardData.damageValue || 15);
              onDamage(damage, hazardData.name || "Unknown Hazard", hazardData.emoji || "💥");
              invulnerableUntilRef.current = now + 350;
            }
          }
        }
      });
    });

    return () => {
      pw.clearHazards();
      physicsRef.current = null;
    };
  }, [characterType, onDamage, isGameOver]);

  // Sync Event Modifications to Physics World
  useEffect(() => {
    if (!physicsRef.current || !currentEvent) return;
    const pw = physicsRef.current;

    // 1. Gravity Vector
    if (currentEvent.gravity_vector) {
      pw.setGravity(currentEvent.gravity_vector.x, currentEvent.gravity_vector.y);
      if (currentEvent.gravity_vector.y < 0) {
        audioEngine.playGravityFlip();
      }
    }

    // 2. Modifiers
    if (currentEvent.modifier_effect === "super_bounce") {
      pw.enableSuperBounciness(true);
      audioEngine.playBounce(10);
    } else if (currentEvent.modifier_effect === "low_friction") {
      pw.setLowFriction(true);
    } else if (currentEvent.modifier_effect === "black_hole") {
      vortexRef.current.active = true;
      setVortexActive(true);
      audioEngine.playExplosion();
    } else {
      pw.enableSuperBounciness(false);
      pw.setLowFriction(false);
      vortexRef.current.active = false;
      setVortexActive(false);
    }

    // 3. Spawning Items
    if (currentEvent.spawn_items && currentEvent.spawn_items.length > 0) {
      currentEvent.spawn_items.forEach((item) => {
        const count = item.count || 1;
        for (let i = 0; i < count; i++) {
          const spawnX = Math.random() * (pw.width - 160) + 80;
          const spawnY = Math.random() * 80 + 30;
          pw.spawnItem(item, spawnX, spawnY);
        }
      });
    }
  }, [currentEvent]);

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;

      // Spacebar: Kinetic Shockwave
      if (e.code === "Space") {
        e.preventDefault();
        triggerShockwave();
      }
      // R Key: Gyro upright recovery
      if (e.key.toLowerCase() === "r") {
        physicsRef.current?.applyUprightStabilizer();
      }
      // E Key: Manual AI Mutation
      if (e.key.toLowerCase() === "e") {
        onTriggerChaosManual();
      }
      // M Key: Mute toggle
      if (e.key.toLowerCase() === "m") {
        const muted = audioEngine.toggleMute();
        setIsMuted(muted);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onTriggerChaosManual]);

  // Kinetic Shockwave Trigger
  const triggerShockwave = useCallback((cx?: number, cy?: number) => {
    if (!physicsRef.current || isGameOver) return;
    const now = Date.now();
    if (now < shockwaveCooldownRef.current) return;

    shockwaveCooldownRef.current = now + 400; // 400ms cooldown

    const pw = physicsRef.current;
    const mainBody = pw.mainCharacterBody;
    const originX = cx ?? (mainBody ? mainBody.position.x : pw.width / 2);
    const originY = cy ?? (mainBody ? mainBody.position.y : pw.height / 2);

    pw.applyShockwave(originX, originY, 300, 0.22);
    particleEngineRef.current.addShockwave(originX, originY, "#f472b6", 260);
    audioEngine.playShockwave();
    onUseShockwave();

    setScreenShake({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 14
    });
  }, [isGameOver, onUseShockwave]);

  // Main Render & Physics Step Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      const pw = physicsRef.current;

      if (!canvas || !pw) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Process Keyboard Controls
      if (isPlaying && !isGameOver) {
        const keys = keysPressedRef.current;
        let fx = 0;
        let fy = 0;
        let torque = 0;

        if (keys["a"] || keys["arrowleft"]) {
          fx -= 3.5;
          torque -= 0.8;
        }
        if (keys["d"] || keys["arrowright"]) {
          fx += 3.5;
          torque += 0.8;
        }
        if (keys["w"] || keys["arrowup"]) {
          fy -= 5.5;
        }
        if (keys["s"] || keys["arrowdown"]) {
          fy += 2.0;
        }

        if (fx !== 0 || fy !== 0 || torque !== 0) {
          pw.applyPlayerImpulse(fx, fy, torque);
        }

        // Apply Black Hole Vortex if active
        if (vortexRef.current.active) {
          vortexRef.current.angle += 0.08;
          pw.applyVortexForce(
            vortexRef.current.x,
            vortexRef.current.y,
            vortexRef.current.strength,
            380
          );
        }
      }

      // Step Physics Engine
      pw.step();

      // Screen shake decay
      setScreenShake((prev) => ({
        x: prev.x * 0.85,
        y: prev.y * 0.85
      }));

      // 2. Render Canvas Frame (Vibrant Palette Aesthetic)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(screenShake.x, screenShake.y);

      // Deep Indigo Background with Radial Dots
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, "#0f0c29");
      bgGrad.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Comic Radial Dotted Grid Pattern
      ctx.fillStyle = chaosLevel > 75 ? "rgba(244, 114, 182, 0.25)" : "rgba(67, 56, 202, 0.35)";
      const dotSpacing = 24;
      for (let x = 12; x < canvas.width; x += dotSpacing) {
        for (let y = 12; y < canvas.height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Floor & Ceiling Accent Strips with bold neon pop styling
      // Ceiling Strip
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(0, 0, canvas.width, 6);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 6, canvas.width, 2);

      // Floor Strip (Yellow with black border & pink accent)
      ctx.fillStyle = pw.bouncinessMode ? "#f43f5e" : "#facc15";
      ctx.fillRect(0, canvas.height - 12, canvas.width, 12);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, canvas.height - 14, canvas.width, 2);

      // 3. Render Character Joint Constraints with Pop Neon Outlines
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      pw.characterConstraints.forEach((c) => {
        if (!c.bodyA || !c.bodyB) return;
        const posA = Matter.Vector.add(c.bodyA.position, c.pointA || { x: 0, y: 0 });
        const posB = Matter.Vector.add(c.bodyB.position, c.pointB || { x: 0, y: 0 });
        ctx.beginPath();
        ctx.moveTo(posA.x, posA.y);
        ctx.lineTo(posB.x, posB.y);
        ctx.stroke();
      });

      // 4. Render Character Limbs & Expressive Head
      const isInvulnerable = Date.now() < invulnerableUntilRef.current;
      pw.characterBodies.forEach((body) => {
        const custom = (body as any).customData as CustomBodyData | undefined;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (isInvulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }

        if (custom?.limbType === "head") {
          // Head Circle (Pop Pink/Peach with thick black border)
          const radius = (body as any).circleRadius || 22;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fillStyle = "#f472b6";
          ctx.fill();
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Dr. Bob's Lab Goggles / Monocle
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(-7, -4, 6, 0, Math.PI * 2);
          ctx.arc(7, -4, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Animated Face Expressions
          const speed = Math.hypot(body.velocity.x, body.velocity.y);
          const isHurt = Date.now() < faceMoodTimeRef.current;
          
          if (isGameOver) {
            // KO X Eyes
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2.5;
            [-7, 7].forEach((eyeX) => {
              ctx.beginPath();
              ctx.moveTo(eyeX - 3, -7);
              ctx.lineTo(eyeX + 3, -1);
              ctx.moveTo(eyeX + 3, -7);
              ctx.lineTo(eyeX - 3, -1);
              ctx.stroke();
            });
            // Dizzy Mouth
            ctx.beginPath();
            ctx.arc(0, 8, 5, Math.PI, 0);
            ctx.stroke();
          } else if (isHurt) {
            // Screaming Mouth
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(0, 8, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (speed > 7) {
            // Panicked Face
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(-7, -4, 2.5, 0, Math.PI * 2);
            ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Open O mouth
            ctx.beginPath();
            ctx.arc(0, 7, 4, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Happy smirk
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(-7, -4, 2.5, 0, Math.PI * 2);
            ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Smile arc
            ctx.beginPath();
            ctx.arc(0, 4, 6, 0.2, Math.PI - 0.2);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        } else if (custom?.limbType === "torso") {
          // Torso Box / Pop Style Lab Coat
          const vertices = body.vertices;
          ctx.beginPath();
          ctx.moveTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x - body.position.x, vertices[i].y - body.position.y);
          }
          ctx.closePath();
          ctx.fillStyle = "#ec4899";
          ctx.fill();
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Yellow Tie / Emblem
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(-4, 0);
          ctx.lineTo(0, 15);
          ctx.lineTo(4, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Limbs & Blocks (Vibrant Pink/Cyan with black borders)
          const vertices = body.vertices;
          ctx.beginPath();
          ctx.moveTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x - body.position.x, vertices[i].y - body.position.y);
          }
          ctx.closePath();
          ctx.fillStyle = custom?.color || "#f472b6";
          ctx.fill();
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }

        ctx.restore();
      });

      // 5. Render Hazards & Physics Objects with Emoji Badges
      pw.hazardBodies.forEach((body) => {
        const custom = (body as any).customData as CustomBodyData | undefined;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        // Body Shape Shadow
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 5;

        if (body.circleRadius) {
          ctx.beginPath();
          ctx.arc(0, 0, body.circleRadius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.fill();
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else {
          const vertices = body.vertices;
          ctx.beginPath();
          ctx.moveTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x - body.position.x, vertices[i].y - body.position.y);
          }
          ctx.closePath();
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.fill();
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Reset shadow for emoji crispness
        ctx.shadowColor = "transparent";

        // Draw Centered Emoji
        const emojiSize = (body.circleRadius ? body.circleRadius * 1.5 : 26);
        ctx.font = `${Math.round(emojiSize)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(custom?.emoji || "📦", 0, 1);

        ctx.restore();
      });

      // 6. Draw Particles & Shockwaves
      particleEngineRef.current.updateAndDraw(ctx, canvas.width, canvas.height, vortexRef.current);

      // 7. Chaos Aberration & Vignette overlay if chaos is high
      if (chaosLevel > 60) {
        const chaosAlpha = (chaosLevel - 60) / 100;
        ctx.fillStyle = `rgba(244, 114, 182, ${chaosAlpha * 0.15})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isGameOver, chaosLevel, screenShake, onScoreAdd]);

  // Handle Canvas Mouse & Touch Interaction
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!physicsRef.current || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Right Click -> Shockwave
    if (e.button === 2) {
      e.preventDefault();
      triggerShockwave(clickX, clickY);
      return;
    }

    // Left Click -> Direct impulse tug on character or hazard repel
    const mainBody = physicsRef.current.mainCharacterBody;
    if (mainBody) {
      const dx = clickX - mainBody.position.x;
      const dy = clickY - mainBody.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 100) {
        // Drag impulse
        physicsRef.current.applyPlayerImpulse(dx * 0.08, dy * 0.08, (Math.random() - 0.5) * 2);
        particleEngineRef.current.addImpactSparks(clickX, clickY, "#22d3ee", 6);
      } else {
        // Arena tap pulse
        particleEngineRef.current.addShockwave(clickX, clickY, "#f472b6", 120);
        physicsRef.current.applyShockwave(clickX, clickY, 120, 0.05);
        audioEngine.playBounce(3);
      }
    }
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const toggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      id="game-canvas-container"
      ref={containerRef}
      className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden border-4 border-black shadow-pop-black-lg bg-indigo-950 select-none cursor-crosshair"
    >
      <canvas
        id="physics-canvas"
        ref={canvasRef}
        width={900}
        height={600}
        onMouseDown={handleCanvasMouseDown}
        onContextMenu={handleCanvasContextMenu}
        className="w-full h-full block"
      />

      {/* Floating Quick Action Overlay Buttons on Canvas - Vibrant Palette */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left Directional Pad / Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="mobile-btn-left"
            onClick={() => physicsRef.current?.applyPlayerImpulse(-4, -1, -1)}
            className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:translate-y-0.5 border-b-4 border-indigo-950 text-white flex items-center justify-center shadow-pop-black transition-transform cursor-pointer"
            title="Balance Left (A / Left Arrow)"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-300 stroke-[3]" />
          </button>
          <button
            id="mobile-btn-jump"
            onClick={() => physicsRef.current?.applyPlayerImpulse(0, -6, 0)}
            className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:translate-y-0.5 border-b-4 border-indigo-950 text-white flex items-center justify-center shadow-pop-black transition-transform cursor-pointer"
            title="Jump / Thrust (W / Up Arrow)"
          >
            <ArrowUp className="w-5 h-5 text-yellow-400 stroke-[3]" />
          </button>
          <button
            id="mobile-btn-right"
            onClick={() => physicsRef.current?.applyPlayerImpulse(4, -1, 1)}
            className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:translate-y-0.5 border-b-4 border-indigo-950 text-white flex items-center justify-center shadow-pop-black transition-transform cursor-pointer"
            title="Balance Right (D / Right Arrow)"
          >
            <ArrowRight className="w-5 h-5 text-cyan-300 stroke-[3]" />
          </button>
          <button
            id="mobile-btn-stabilize"
            onClick={() => physicsRef.current?.applyUprightStabilizer()}
            className="h-12 px-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:translate-y-0.5 border-b-4 border-cyan-800 text-indigo-950 flex items-center gap-1.5 shadow-pop-black text-xs font-black uppercase tracking-tight transition-transform cursor-pointer"
            title="Upright Recovery Gyro (R)"
          >
            <Shield className="w-4 h-4 text-indigo-950 fill-indigo-950" />
            <span className="hidden sm:inline">GYRO [R]</span>
          </button>
        </div>

        {/* Right Action Trigger Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="btn-shockwave"
            onClick={() => triggerShockwave()}
            className="h-12 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 active:translate-y-0.5 border-b-4 border-pink-950 text-white flex items-center gap-2 shadow-pop-black text-xs sm:text-sm font-black uppercase tracking-tight transition-transform cursor-pointer"
            title="Kinetic Shockwave (Spacebar / Right-Click)"
          >
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>SPACE BLAST</span>
          </button>

          <button
            id="btn-audio-mute"
            onClick={toggleMute}
            className="w-12 h-12 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:translate-y-0.5 border-b-4 border-yellow-700 text-indigo-950 flex items-center justify-center shadow-pop-black transition-transform cursor-pointer"
            title="Mute / Unmute (M)"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-indigo-950 stroke-[2.5]" />
            ) : (
              <Volume2 className="w-5 h-5 text-indigo-950 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Active Modifier Tag in Canvas Corner (Vibrant Palette Side Panel Style) */}
      {currentEvent && (
        <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 border-l-4 border-cyan-400 shadow-pop-black backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            <span className="text-xs font-black text-cyan-300 tracking-wider uppercase">
              {currentEvent.event_title}
            </span>
          </div>
          {currentEvent.modifier_effect !== "none" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-950/90 border border-pink-500/50 text-[10px] font-black text-pink-300 uppercase tracking-widest">
              <span>MUTATION:</span>
              <span>{currentEvent.modifier_effect.replace("_", " ")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
