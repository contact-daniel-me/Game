import { ChaosEvent, PostMortemReport } from "../types/game";
import { getRandomFallbackEvent } from "./fallbackDirector";

export interface GameMetrics {
  score: number;
  survivalTime: number;
  collisionCount: number;
  chaosLevel: number;
  characterName: string;
  recentItems: string[];
}

export async function fetchChaosEvent(metrics: GameMetrics): Promise<ChaosEvent> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for fast gameplay

    const res = await fetch("/api/director/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metrics),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data && data.event_title && data.gravity_vector) {
      return data as ChaosEvent;
    }
    return getRandomFallbackEvent();
  } catch (err) {
    console.warn("Using offline fallback Chaos Event:", err);
    return getRandomFallbackEvent();
  }
}

export async function fetchPostMortem(payload: {
  score: number;
  survivalTime: number;
  finalHazard: string;
  topCollisions: string[];
  characterName: string;
}): Promise<PostMortemReport> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch("/api/director/post-mortem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.report) {
        return data as PostMortemReport;
      }
    }
    throw new Error("Invalid post-mortem payload");
  } catch (err) {
    console.warn("Using offline fallback Post-Mortem:", err);
    const fallbacks = [
      {
        report: `OFFICIAL INCIDENT REPORT: Subject ${payload.characterName} survived ${payload.survivalTime} seconds before a tragic encounter with ${payload.finalHazard}. The Physics Investigation Board has concluded that flailing frantically does not cancel out kinetic inertia. Final Score: ${payload.score}.`,
        verdict: "Dramatically Splattered",
        hilariousTitle: "Distinguished Master of Bad Timing"
      },
      {
        report: `LAB ANALYSIS: After racking up ${payload.score} points and absorbing multiple impacts from ${payload.topCollisions.join(", ") || "various ridiculous objects"}, ${payload.characterName} was completely undone by ${payload.finalHazard}. The Director gives your faceplant a solid 9.8/10.`,
        verdict: "Newtonian Tragedy",
        hilariousTitle: "Chief Kinetic Crash Dummy"
      }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
