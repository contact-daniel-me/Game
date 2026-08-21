import Matter from "matter-js";
import { CharacterType, HazardBehavior, SpawnItemConfig } from "../types/game";

export interface CustomBodyData {
  isPlayer?: boolean;
  isPlayerLimb?: boolean;
  limbType?: "head" | "torso" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg" | "wheel" | "block";
  isHazard?: boolean;
  name?: string;
  emoji?: string;
  behavior?: HazardBehavior;
  damageValue?: number;
  spawnTime?: number;
  hasExploded?: boolean;
  color?: string;
}

export class PhysicsWorld {
  public engine: Matter.Engine;
  public world: Matter.World;
  public characterBodies: Matter.Body[] = [];
  public characterConstraints: Matter.Constraint[] = [];
  public mainCharacterBody: Matter.Body | null = null;
  public hazardBodies: Matter.Body[] = [];
  public wallBodies: Matter.Body[] = [];
  public width: number = 900;
  public height: number = 600;
  public characterType: CharacterType = "ragdoll";
  public gravityScale: { x: number; y: number } = { x: 0, y: 1.0 };
  public bouncinessMode: boolean = false;
  public lowFrictionMode: boolean = false;
  public balloonMode: boolean = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.0, scale: 0.001 }
    });
    this.world = this.engine.world;

    this.setupBoundaries();
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.setupBoundaries();
  }

  public setupBoundaries() {
    // Remove existing walls
    this.wallBodies.forEach(b => Matter.Composite.remove(this.world, b));
    this.wallBodies = [];

    const wallThickness = 60;
    const floorY = this.height + wallThickness / 2 - 10;
    const ceilingY = -wallThickness / 2 + 10;
    const leftX = -wallThickness / 2 + 10;
    const rightX = this.width + wallThickness / 2 - 10;

    const wallOpts: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      friction: this.lowFrictionMode ? 0.001 : 0.6,
      restitution: this.bouncinessMode ? 1.2 : 0.3,
      render: { visible: false }
    };

    const floor = Matter.Bodies.rectangle(this.width / 2, floorY, this.width * 2, wallThickness, { ...wallOpts, label: "Floor" });
    const ceiling = Matter.Bodies.rectangle(this.width / 2, ceilingY, this.width * 2, wallThickness, { ...wallOpts, label: "Ceiling" });
    const leftWall = Matter.Bodies.rectangle(leftX, this.height / 2, wallThickness, this.height * 2, { ...wallOpts, label: "LeftWall" });
    const rightWall = Matter.Bodies.rectangle(rightX, this.height / 2, wallThickness, this.height * 2, { ...wallOpts, label: "RightWall" });

    this.wallBodies = [floor, ceiling, leftWall, rightWall];
    Matter.Composite.add(this.world, this.wallBodies);
  }

  public spawnCharacter(type: CharacterType = "ragdoll") {
    this.characterType = type;
    
    // Clear old character
    this.characterBodies.forEach(b => Matter.Composite.remove(this.world, b));
    this.characterConstraints.forEach(c => Matter.Composite.remove(this.world, c));
    this.characterBodies = [];
    this.characterConstraints = [];
    this.mainCharacterBody = null;

    const startX = this.width / 2;
    const startY = this.height - 180;

    if (type === "ragdoll") {
      this.createRagdoll(startX, startY);
    } else if (type === "unicycle") {
      this.createUnicycle(startX, startY);
    } else if (type === "wobbly_stack") {
      this.createWobblyStack(startX, startY);
    }
  }

  private createRagdoll(x: number, y: number) {
    const group = Matter.Body.nextGroup(true);

    const headRadius = 22;
    const torsoWidth = 32;
    const torsoHeight = 48;
    const armWidth = 12;
    const armHeight = 32;
    const legWidth = 14;
    const legHeight = 38;

    const head = Matter.Bodies.circle(x, y - 50, headRadius, {
      collisionFilter: { group },
      friction: 0.5,
      restitution: 0.4,
      density: 0.002,
      label: "PlayerHead"
    });
    (head as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "head" } as CustomBodyData;

    const torso = Matter.Bodies.rectangle(x, y, torsoWidth, torsoHeight, {
      collisionFilter: { group },
      friction: 0.5,
      restitution: 0.3,
      density: 0.003,
      label: "PlayerTorso"
    });
    (torso as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "torso" } as CustomBodyData;

    // Left & Right Arms
    const leftArm = Matter.Bodies.rectangle(x - 26, y - 10, armWidth, armHeight, {
      collisionFilter: { group },
      friction: 0.5,
      restitution: 0.3,
      density: 0.0015,
      label: "PlayerLeftArm"
    });
    (leftArm as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "leftArm" } as CustomBodyData;

    const rightArm = Matter.Bodies.rectangle(x + 26, y - 10, armWidth, armHeight, {
      collisionFilter: { group },
      friction: 0.5,
      restitution: 0.3,
      density: 0.0015,
      label: "PlayerRightArm"
    });
    (rightArm as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "rightArm" } as CustomBodyData;

    // Left & Right Legs
    const leftLeg = Matter.Bodies.rectangle(x - 12, y + 42, legWidth, legHeight, {
      collisionFilter: { group },
      friction: 0.8,
      restitution: 0.2,
      density: 0.0025,
      label: "PlayerLeftLeg"
    });
    (leftLeg as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "leftLeg" } as CustomBodyData;

    const rightLeg = Matter.Bodies.rectangle(x + 12, y + 42, legWidth, legHeight, {
      collisionFilter: { group },
      friction: 0.8,
      restitution: 0.2,
      density: 0.0025,
      label: "PlayerRightLeg"
    });
    (rightLeg as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "rightLeg" } as CustomBodyData;

    // Joint Constraints
    const neck = Matter.Constraint.create({
      bodyA: head,
      bodyB: torso,
      pointA: { x: 0, y: headRadius - 2 },
      pointB: { x: 0, y: -torsoHeight / 2 + 2 },
      stiffness: 0.85,
      damping: 0.1,
      length: 2
    });

    const leftShoulder = Matter.Constraint.create({
      bodyA: torso,
      bodyB: leftArm,
      pointA: { x: -torsoWidth / 2, y: -torsoHeight / 3 },
      pointB: { x: 0, y: -armHeight / 2 + 4 },
      stiffness: 0.7,
      damping: 0.15,
      length: 2
    });

    const rightShoulder = Matter.Constraint.create({
      bodyA: torso,
      bodyB: rightArm,
      pointA: { x: torsoWidth / 2, y: -torsoHeight / 3 },
      pointB: { x: 0, y: -armHeight / 2 + 4 },
      stiffness: 0.7,
      damping: 0.15,
      length: 2
    });

    const leftHip = Matter.Constraint.create({
      bodyA: torso,
      bodyB: leftLeg,
      pointA: { x: -torsoWidth / 4, y: torsoHeight / 2 },
      pointB: { x: 0, y: -legHeight / 2 + 4 },
      stiffness: 0.75,
      damping: 0.15,
      length: 2
    });

    const rightHip = Matter.Constraint.create({
      bodyA: torso,
      bodyB: rightLeg,
      pointA: { x: torsoWidth / 4, y: torsoHeight / 2 },
      pointB: { x: 0, y: -legHeight / 2 + 4 },
      stiffness: 0.75,
      damping: 0.15,
      length: 2
    });

    this.characterBodies = [head, torso, leftArm, rightArm, leftLeg, rightLeg];
    this.characterConstraints = [neck, leftShoulder, rightShoulder, leftHip, rightHip];
    this.mainCharacterBody = torso;

    Matter.Composite.add(this.world, [...this.characterBodies, ...this.characterConstraints]);
  }

  private createUnicycle(x: number, y: number) {
    const group = Matter.Body.nextGroup(true);

    const wheelRadius = 24;
    const wheel = Matter.Bodies.circle(x, y + 40, wheelRadius, {
      collisionFilter: { group },
      friction: 0.9,
      restitution: 0.3,
      density: 0.004,
      label: "PlayerWheel"
    });
    (wheel as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "wheel" } as CustomBodyData;

    const frame = Matter.Bodies.rectangle(x, y, 20, 50, {
      collisionFilter: { group },
      friction: 0.4,
      restitution: 0.2,
      density: 0.002,
      label: "PlayerTorso"
    });
    (frame as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "torso" } as CustomBodyData;

    const seatHead = Matter.Bodies.circle(x, y - 38, 22, {
      collisionFilter: { group },
      friction: 0.4,
      restitution: 0.4,
      density: 0.002,
      label: "PlayerHead"
    });
    (seatHead as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "head" } as CustomBodyData;

    const wheelAxle = Matter.Constraint.create({
      bodyA: frame,
      bodyB: wheel,
      pointA: { x: 0, y: 25 },
      pointB: { x: 0, y: 0 },
      stiffness: 0.9,
      damping: 0.1,
      length: 0
    });

    const seatJoint = Matter.Constraint.create({
      bodyA: seatHead,
      bodyB: frame,
      pointA: { x: 0, y: 20 },
      pointB: { x: 0, y: -25 },
      stiffness: 0.85,
      damping: 0.1,
      length: 2
    });

    this.characterBodies = [wheel, frame, seatHead];
    this.characterConstraints = [wheelAxle, seatJoint];
    this.mainCharacterBody = frame;

    Matter.Composite.add(this.world, [...this.characterBodies, ...this.characterConstraints]);
  }

  private createWobblyStack(x: number, y: number) {
    const group = Matter.Body.nextGroup(true);

    const b1 = Matter.Bodies.rectangle(x, y + 40, 55, 26, {
      collisionFilter: { group },
      friction: 0.8,
      restitution: 0.5,
      density: 0.004,
      label: "PlayerTorso"
    });
    (b1 as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "torso", color: "#3b82f6" } as CustomBodyData;

    const b2 = Matter.Bodies.rectangle(x, y + 10, 44, 24, {
      collisionFilter: { group },
      friction: 0.8,
      restitution: 0.5,
      density: 0.003,
      label: "PlayerBlock2"
    });
    (b2 as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "block", color: "#eab308" } as CustomBodyData;

    const b3 = Matter.Bodies.circle(x, y - 24, 20, {
      collisionFilter: { group },
      friction: 0.8,
      restitution: 0.6,
      density: 0.002,
      label: "PlayerHead"
    });
    (b3 as any).customData = { isPlayer: true, isPlayerLimb: true, limbType: "head", color: "#ef4444" } as CustomBodyData;

    const c1 = Matter.Constraint.create({
      bodyA: b1,
      bodyB: b2,
      pointA: { x: 0, y: -13 },
      pointB: { x: 0, y: 12 },
      stiffness: 0.65,
      damping: 0.2,
      length: 2
    });

    const c2 = Matter.Constraint.create({
      bodyA: b2,
      bodyB: b3,
      pointA: { x: 0, y: -12 },
      pointB: { x: 0, y: 18 },
      stiffness: 0.65,
      damping: 0.2,
      length: 2
    });

    this.characterBodies = [b1, b2, b3];
    this.characterConstraints = [c1, c2];
    this.mainCharacterBody = b1;

    Matter.Composite.add(this.world, [...this.characterBodies, ...this.characterConstraints]);
  }

  public spawnHazard(config: SpawnItemConfig, spawnX?: number, spawnY?: number): Matter.Body {
    const x = spawnX !== undefined ? spawnX : Math.random() * (this.width - 120) + 60;
    const y = spawnY !== undefined ? spawnY : (Math.random() < 0.85 ? -40 : Math.random() * 200);

    const size = config.size || 30;
    const restitution = this.bouncinessMode ? Math.max(1.2, config.bounciness) : config.bounciness;
    const friction = this.lowFrictionMode ? 0.001 : (config.behavior === "slippery" ? 0.005 : 0.4);

    let body: Matter.Body;
    const commonOpts: Matter.IBodyDefinition = {
      friction,
      restitution,
      density: 0.001 * (config.mass || 1.5),
      label: `Hazard_${config.name}`
    };

    if (config.shape === "circle") {
      body = Matter.Bodies.circle(x, y, size / 2, commonOpts);
    } else {
      body = Matter.Bodies.rectangle(x, y, size, size, commonOpts);
    }

    // Set initial angular velocity and horizontal velocity
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 5 + this.gravityScale.x * 2,
      y: Math.random() * 3 + 1
    });

    // Custom damage & behavior metadata
    let damageValue = 15;
    if (config.behavior === "heavy") damageValue = 35;
    if (config.behavior === "exploding") damageValue = 28;
    if (config.behavior === "super_bounce") damageValue = 12;
    if (config.behavior === "sticky") damageValue = 18;

    (body as any).customData = {
      isHazard: true,
      name: config.name,
      emoji: config.emoji,
      behavior: config.behavior,
      damageValue,
      spawnTime: Date.now(),
      hasExploded: false
    } as CustomBodyData;

    this.hazardBodies.push(body);
    Matter.Composite.add(this.world, body);

    // Limit maximum active hazards to maintain 60 FPS
    if (this.hazardBodies.length > 25) {
      const oldest = this.hazardBodies.shift();
      if (oldest) {
        Matter.Composite.remove(this.world, oldest);
      }
    }

    return body;
  }

  public applyPlayerImpulse(forceX: number, forceY: number, torque: number = 0) {
    if (!this.mainCharacterBody) return;
    
    // Distribute force to character limbs
    this.characterBodies.forEach(body => {
      Matter.Body.applyForce(body, body.position, {
        x: (forceX / this.characterBodies.length) * 0.003,
        y: (forceY / this.characterBodies.length) * 0.003
      });
    });

    if (torque !== 0) {
      Matter.Body.setAngularVelocity(this.mainCharacterBody, this.mainCharacterBody.angularVelocity + torque * 0.08);
    }
  }

  public applyUprightStabilizer() {
    if (!this.mainCharacterBody) return;
    const targetAngle = 0;
    const currentAngle = this.mainCharacterBody.angle;
    const angleDiff = targetAngle - currentAngle;

    // Upright spring torque
    Matter.Body.setAngularVelocity(this.mainCharacterBody, angleDiff * 0.15);
    
    // Upward recovery hop
    Matter.Body.applyForce(this.mainCharacterBody, this.mainCharacterBody.position, {
      x: 0,
      y: -0.015
    });
  }

  public applyShockwave(centerX: number, centerY: number, radius: number = 220, strength: number = 0.08): Matter.Body[] {
    const affectedBodies: Matter.Body[] = [];

    const allBodies = [...this.hazardBodies, ...this.characterBodies];
    allBodies.forEach(body => {
      const dx = body.position.x - centerX;
      const dy = body.position.y - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < radius && dist > 1) {
        const falloff = 1 - dist / radius;
        const forceMagnitude = strength * falloff;
        const normX = dx / dist;
        const normY = dy / dist;

        Matter.Body.applyForce(body, body.position, {
          x: normX * forceMagnitude,
          y: normY * forceMagnitude
        });

        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
        affectedBodies.push(body);
      }
    });

    return affectedBodies;
  }

  public setGravity(x: number, y: number) {
    this.gravityScale = { x, y };
    this.world.gravity.x = x;
    this.world.gravity.y = y;
  }

  public enableSuperBounciness(enabled: boolean) {
    this.bouncinessMode = enabled;
    this.setupBoundaries();
    this.hazardBodies.forEach(b => {
      b.restitution = enabled ? 1.25 : 0.4;
    });
  }

  public setLowFriction(enabled: boolean) {
    this.lowFrictionMode = enabled;
    this.setupBoundaries();
    this.hazardBodies.forEach(b => {
      b.friction = enabled ? 0.001 : 0.4;
    });
  }

  public spawnItem(config: SpawnItemConfig, spawnX?: number, spawnY?: number): Matter.Body {
    return this.spawnHazard(config, spawnX, spawnY);
  }

  public step(vortex?: { x: number; y: number; strength: number; active: boolean }) {
    this.updatePhysicsStep(vortex);
  }

  public applyVortexForce(x: number, y: number, strength: number, maxDist: number = 380) {
    const allBodies = [...this.hazardBodies, ...this.characterBodies];
    allBodies.forEach(body => {
      const dx = x - body.position.x;
      const dy = y - body.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 10 && dist < maxDist) {
        const pull = (strength / (dist * 0.8)) * 0.003;
        Matter.Body.applyForce(body, body.position, {
          x: (dx / dist) * pull,
          y: (dy / dist) * pull
        });
      }
    });
  }

  public updatePhysicsStep(vortex?: { x: number; y: number; strength: number; active: boolean }) {
    // 1. Apply customized gravity
    this.world.gravity.x = this.gravityScale.x;
    this.world.gravity.y = this.gravityScale.y;

    // 2. Balloon / anti-grav mode buoyancy
    if (this.balloonMode) {
      this.characterBodies.forEach(body => {
        Matter.Body.applyForce(body, body.position, {
          x: 0,
          y: -0.0018
        });
      });
    }

    // 3. Hazard floating & behaviors
    this.hazardBodies.forEach(body => {
      const custom = (body as any).customData as CustomBodyData | undefined;
      if (custom?.behavior === "floating") {
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.0004,
          y: -0.0016
        });
      }

      // Vortex pull
      if (vortex && vortex.active) {
        const dx = vortex.x - body.position.x;
        const dy = vortex.y - body.position.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10 && dist < 450) {
          const pull = (vortex.strength / (dist * 0.8)) * 0.003;
          Matter.Body.applyForce(body, body.position, {
            x: (dx / dist) * pull,
            y: (dy / dist) * pull
          });
        }
      }
    });

    // Clean up out of bounds hazards (far below or far off sides)
    for (let i = this.hazardBodies.length - 1; i >= 0; i--) {
      const b = this.hazardBodies[i];
      if (b.position.y > this.height + 250 || b.position.y < -300 || b.position.x < -200 || b.position.x > this.width + 200) {
        Matter.Composite.remove(this.world, b);
        this.hazardBodies.splice(i, 1);
      }
    }

    Matter.Engine.update(this.engine, 1000 / 60);
  }

  public clearHazards() {
    this.hazardBodies.forEach(b => Matter.Composite.remove(this.world, b));
    this.hazardBodies = [];
  }

  public destroy() {
    this.clearHazards();
    this.characterBodies.forEach(b => Matter.Composite.remove(this.world, b));
    this.characterConstraints.forEach(c => Matter.Composite.remove(this.world, c));
    this.wallBodies.forEach(b => Matter.Composite.remove(this.world, b));
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }
}
