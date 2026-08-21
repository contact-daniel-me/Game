import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client (safe lazy / guarded)
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback chaos generator for zero-latency or missing key
const FALLBACK_TITLES = [
  "Gravitational Re-Alignment Malfunction",
  "Rubber Duck Invasion Protocol",
  "Scalding Espresso Tempest",
  "Zero-G Anti-Gravity Ball",
  "Heavy Metal Anvil Rain",
  "Slippery Pizza Party Hazard",
  "Quantum Bounce Extravaganza",
  "The Great Soda Pop Cataclysm",
  "Sudden Sideways Hurricane",
  "Floating Helium Madness",
  "Rogue Toaster Fireworks",
  "Newton's Nightmare Unleashed",
];

const FALLBACK_COMMENTARY = [
  "Oh look! Physics decided to take a coffee break. Good luck staying upright!",
  "Warning: The laws of thermodynamics have been replaced by pure whimsy.",
  "I noticed you were enjoying gravity, so I decided to confiscate it temporarily.",
  "Did somebody order 14 rubber ducks moving at Mach 2? You're welcome!",
  "A scientist once said 'what goes up must come down'... clearly they never met me.",
  "Hold onto your vertices! The physics engine is getting spicy!",
  "That was almost graceful. Now let's see how you handle sideways gravity!",
  "Your balance is admirable. Let me fix that with a flying anvil shower.",
  "Activating Bouncy Castle protocol! Mind your head and your dignity.",
  "I'm not saying this is impossible, but I did place bets against you."
];

const FALLBACK_ITEMS_POOL = [
  { name: "Rubber Duck", emoji: "🦆", shape: "circle" as const, mass: 1.2, bounciness: 0.95, behavior: "floating" as const, size: 28 },
  { name: "Giant Coffee Cup", emoji: "☕", shape: "box" as const, mass: 3.5, bounciness: 0.2, behavior: "sticky" as const, size: 36 },
  { name: "Rogue Laptop", emoji: "💻", shape: "box" as const, mass: 2.5, bounciness: 0.5, behavior: "exploding" as const, size: 32 },
  { name: "16-Ton Anvil", emoji: "🏋️", shape: "box" as const, mass: 12.0, bounciness: 0.1, behavior: "heavy" as const, size: 40 },
  { name: "Bouncy Basketball", emoji: "🏀", shape: "circle" as const, mass: 1.5, bounciness: 1.1, behavior: "super_bounce" as const, size: 30 },
  { name: "Greasy Pizza Slice", emoji: "🍕", shape: "box" as const, mass: 0.8, bounciness: 0.3, behavior: "slippery" as const, size: 28 },
  { name: "Sticky Bubble", emoji: "🫧", shape: "circle" as const, mass: 0.5, bounciness: 0.4, behavior: "floating" as const, size: 34 },
  { name: "Rocket Banana", emoji: "🍌", shape: "box" as const, mass: 1.0, bounciness: 0.6, behavior: "exploding" as const, size: 26 },
  { name: "Radioactive Bowling Ball", emoji: "🎳", shape: "circle" as const, mass: 8.0, bounciness: 0.3, behavior: "heavy" as const, size: 35 },
  { name: "Surprise Donut", emoji: "🍩", shape: "circle" as const, mass: 1.0, bounciness: 0.7, behavior: "floating" as const, size: 28 },
  { name: "Wobbly Jelly", emoji: "🍮", shape: "box" as const, mass: 2.0, bounciness: 1.2, behavior: "super_bounce" as const, size: 32 },
  { name: "Alarm Clock of Doom", emoji: "⏰", shape: "circle" as const, mass: 2.2, bounciness: 0.8, behavior: "exploding" as const, size: 28 },
];

function generateLocalChaosEvent(metrics: any) {
  const title = FALLBACK_TITLES[Math.floor(Math.random() * FALLBACK_TITLES.length)];
  const commentary = FALLBACK_COMMENTARY[Math.floor(Math.random() * FALLBACK_COMMENTARY.length)];
  
  // Randomize gravity variation
  const gravityChoices = [
    { x: 0, y: 1.0 }, // normal
    { x: 0, y: -0.65 }, // anti-grav
    { x: 0.8, y: 0.3 }, // sideways right
    { x: -0.8, y: 0.3 }, // sideways left
    { x: 0, y: 0.05 }, // micro-gravity
    { x: 0, y: 2.0 }, // super heavy
    { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 }
  ];
  const gravity = gravityChoices[Math.floor(Math.random() * gravityChoices.length)];
  
  const audioVibes = ["panic", "chaos", "lofi", "triumph"] as const;
  const audioVibe = audioVibes[Math.floor(Math.random() * audioVibes.length)];
  
  const modifierEffects = [
    "none",
    "low_friction",
    "super_bounce",
    "anti_gravity",
    "heavy_ragdoll",
    "balloon_mode",
    "black_hole"
  ];
  const modifier = modifierEffects[Math.floor(Math.random() * modifierEffects.length)];

  // Pick 2-4 items to spawn
  const count = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...FALLBACK_ITEMS_POOL].sort(() => 0.5 - Math.random());
  const spawnItems = shuffled.slice(0, count).map(item => ({
    ...item,
    count: Math.floor(Math.random() * 3) + 1
  }));

  return {
    event_title: title,
    director_commentary: commentary,
    gravity_vector: gravity,
    speed_multiplier: Number((0.8 + Math.random() * 0.7).toFixed(2)),
    spawn_items: spawnItems,
    audio_vibe: audioVibe,
    modifier_effect: modifier,
    duration: 12
  };
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiEnabled: Boolean(process.env.GEMINI_API_KEY) });
});

app.post("/api/director/event", async (req, res) => {
  const { score = 0, survivalTime = 0, collisionCount = 0, chaosLevel = 50, characterName = "Dr. Bob", recentItems = [] } = req.body || {};
  
  const ai = getAIClient();
  if (!ai) {
    return res.json(generateLocalChaosEvent(req.body));
  }

  try {
    const prompt = `You are the chaotic, sarcastic, humorous AI Director of an absurd 2D physics arcade game called "Chaos Director".
Current Player Stats:
- Character: ${characterName}
- Score: ${score} points
- Survival Time: ${survivalTime} seconds
- Collision Count: ${collisionCount}
- Chaos Meter: ${chaosLevel}%
- Recent hazards encountered: ${recentItems.join(", ") || "none yet"}

Generate an absurd, funny physics mutation event to challenge the player right now. Be witty and sarcastic in your commentary.
Return structured JSON following the exact schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the witty, eccentric AI Director of a comedy physics game. Keep commentary punchy (1-2 sentences maximum), hilarious, and sarcastic.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            event_title: { type: Type.STRING, description: "Dramatic or absurd name of the event" },
            director_commentary: { type: Type.STRING, description: "Sarcastic 1-2 sentence witty quip to the player" },
            gravity_vector: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER, description: "Horizontal gravity from -1.5 to 1.5" },
                y: { type: Type.NUMBER, description: "Vertical gravity from -1.2 to 2.2. Normal is 1.0" }
              },
              required: ["x", "y"]
            },
            speed_multiplier: { type: Type.NUMBER, description: "Time scale / physics speed 0.6 to 1.6" },
            spawn_items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Absurd item name" },
                  emoji: { type: Type.STRING, description: "Single emoji icon" },
                  shape: { type: Type.STRING, description: "circle or box" },
                  mass: { type: Type.NUMBER, description: "mass from 0.5 to 15.0" },
                  bounciness: { type: Type.NUMBER, description: "restitution from 0.1 to 1.5" },
                  behavior: { type: Type.STRING, description: "floating, exploding, sticky, heavy, or super_bounce" },
                  size: { type: Type.NUMBER, description: "pixel radius or width 20 to 50" },
                  count: { type: Type.INTEGER, description: "quantity to spawn 1 to 4" }
                },
                required: ["name", "emoji", "shape", "mass", "bounciness", "behavior", "size", "count"]
              }
            },
            audio_vibe: { type: Type.STRING, description: "panic, triumph, lofi, or chaos" },
            modifier_effect: { type: Type.STRING, description: "none, low_friction, super_bounce, anti_gravity, heavy_ragdoll, balloon_mode, or black_hole" },
            duration: { type: Type.INTEGER, description: "duration in seconds (8 to 15)" }
          },
          required: ["event_title", "director_commentary", "gravity_vector", "speed_multiplier", "spawn_items", "audio_vibe", "modifier_effect", "duration"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    }
    return res.json(generateLocalChaosEvent(req.body));
  } catch (error) {
    console.error("Gemini Director API error, using local fallback:", error);
    return res.json(generateLocalChaosEvent(req.body));
  }
});

app.post("/api/director/post-mortem", async (req, res) => {
  const { score = 0, survivalTime = 0, finalHazard = "Gravity", topCollisions = [], characterName = "Dr. Bob" } = req.body || {};

  const ai = getAIClient();
  if (!ai) {
    const fallbackReports = [
      `OFFICIAL INCIDENT REPORT: Subject ${characterName} survived ${survivalTime} seconds before a fatal disagreement with a ${finalHazard}. Physics examiners noted that flailing wildly did not, in fact, counteract momentum. Final Score: ${score}. Better luck in your next quantum iteration!`,
      `CASE FILE #409: After ${survivalTime} seconds of heroic wobbling and dodging ${topCollisions.join(", ") || "absurd objects"}, ${characterName} was completely undone by ${finalHazard}. The Director rates your comedic timing a 10/10. Score: ${score}.`,
      `AUTOPSY OF DIGNITY: ${characterName} racked up ${score} points before succumbing to catastrophic kinetic failure via ${finalHazard}. Laboratory conclusions: Rubber ducks remain undefeated against human equilibrium.`
    ];
    const report = fallbackReports[Math.floor(Math.random() * fallbackReports.length)];
    return res.json({ report, verdict: "Comedically Defeated", hilariousTitle: "Grand Master of Kinetic Collapse" });
  }

  try {
    const prompt = `Write a hilarious, sarcastic 1-paragraph "Official Absurd Physics Incident Report & Post-Mortem" for a player who just crashed/died in the game.
Player Info:
- Name: ${characterName}
- Score: ${score}
- Survived: ${survivalTime} seconds
- Fatal blow / Final Hazard: ${finalHazard}
- Top Hazards Hit: ${topCollisions.join(", ") || "General turbulence"}

Output structured JSON:
{
  "report": "hilarious 2-3 sentence incident report roasting the player's demise",
  "verdict": "short funny verdict (e.g. Defeated by Breakfast, Flawless Flailer, Unstoppable Duck Magnet)",
  "hilariousTitle": "Absurd honorary title awarded (e.g. Lord of the Toppled Cups)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report: { type: Type.STRING },
            verdict: { type: Type.STRING },
            hilariousTitle: { type: Type.STRING }
          },
          required: ["report", "verdict", "hilariousTitle"]
        }
      }
    });

    if (response.text) {
      return res.json(JSON.parse(response.text.trim()));
    }
    throw new Error("Empty response");
  } catch (err) {
    console.error("Post-mortem error, falling back:", err);
    return res.json({
      report: `OFFICIAL INCIDENT REPORT: Subject ${characterName} survived ${survivalTime} seconds before a fatal collision with ${finalHazard}. Examiners noted that flailing wildly did not counteract momentum. Final Score: ${score}.`,
      verdict: "Comedically Obliterated",
      hilariousTitle: "Champion of Elastic Collisions"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chaos Director server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
