import { Particle, ActiveShockwave, BlackHoleVortex } from "../types/game";

export class ParticleEngine {
  private particles: Particle[] = [];
  private shockwaves: ActiveShockwave[] = [];

  public clear() {
    this.particles = [];
    this.shockwaves = [];
  }

  public addShockwave(x: number, y: number, color: string = "#38bdf8", maxRadius: number = 220) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      alpha: 1.0,
      color
    });

    // Add ring sparks
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = 4 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 25 + Math.random() * 15,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        shape: "circle"
      });
    }
  }

  public addImpactSparks(x: number, y: number, color: string = "#f59e0b", count: number = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        size: 2 + Math.random() * 4,
        color,
        alpha: 1,
        shape: Math.random() > 0.5 ? "star" : "circle"
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = "#facc15", size: number = 16) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -2.0 - Math.random() * 1.5,
      life: 0,
      maxLife: 45,
      size,
      color,
      text,
      alpha: 1,
      shape: "text"
    });
  }

  public addCoffeeSplash(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6;
      const speed = 3 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 25,
        size: 3 + Math.random() * 4,
        color: "#78350f",
        alpha: 1,
        shape: "circle"
      });
    }
  }

  public updateAndDraw(ctx: CanvasRenderingContext2D, width: number, height: number, vortex?: BlackHoleVortex) {
    // 1. Draw Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.18 + 4;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = Math.max(1, 8 * sw.alpha);
      ctx.globalAlpha = sw.alpha * 0.8;
      ctx.stroke();

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.globalAlpha = sw.alpha * 0.5;
      ctx.stroke();
      ctx.restore();

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0.01) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 2. Draw Black Hole Vortex visual if active
    if (vortex && vortex.active) {
      ctx.save();
      ctx.translate(vortex.x, vortex.y);
      vortex.angle += 0.05;

      const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.95)");
      gradient.addColorStop(0.3, "rgba(88, 28, 135, 0.8)");
      gradient.addColorStop(0.7, "rgba(147, 51, 234, 0.4)");
      gradient.addColorStop(1, "rgba(192, 132, 252, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      ctx.fill();

      // Spiral arms
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        for (let r = 10; r < 110; r += 5) {
          const theta = vortex.angle + (arm * (Math.PI * 2) / 3) + (r * 0.05);
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;
          if (r === 10) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "rgba(236, 72, 153, 0.6)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.restore();

      // Spawn periodic vortex dust particles
      if (Math.random() < 0.6) {
        const rad = 80 + Math.random() * 40;
        const ang = Math.random() * Math.PI * 2;
        this.particles.push({
          x: vortex.x + Math.cos(ang) * rad,
          y: vortex.y + Math.sin(ang) * rad,
          vx: -Math.cos(ang) * 2 - Math.sin(ang) * 3,
          vy: -Math.sin(ang) * 2 + Math.cos(ang) * 3,
          life: 0,
          maxLife: 30,
          size: 2 + Math.random() * 3,
          color: "#c084fc",
          alpha: 1,
          shape: "circle"
        });
      }
    }

    // 3. Update & Draw Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.shape === "text" && p.text) {
        ctx.font = `bold ${p.size}px "Outfit", "Inter", sans-serif`;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.shape === "star") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const r = p.size;
        ctx.rect(p.x - r / 2, p.y - r / 2, r, r);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (p.life >= p.maxLife || p.alpha <= 0.01) {
        this.particles.splice(i, 1);
      }
    }
  }
}
