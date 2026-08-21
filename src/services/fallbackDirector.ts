import { ChaosEvent, SpawnItemConfig } from "../types/game";

export const LOCAL_ITEMS_CATALOG: Record<string, SpawnItemConfig> = {
  duck: { name: "Rubber Duck", emoji: "🦆", shape: "circle", mass: 1.2, bounciness: 1.1, behavior: "super_bounce", size: 28, count: 2 },
  coffee: { name: "Scalding Espresso", emoji: "☕", shape: "box", mass: 3.5, bounciness: 0.2, behavior: "sticky", size: 34, count: 1 },
  laptop: { name: "Rogue Laptop", emoji: "💻", shape: "box", mass: 2.2, bounciness: 0.5, behavior: "exploding", size: 32, count: 1 },
  anvil: { name: "16-Ton Anvil", emoji: "🏋️", shape: "box", mass: 14.0, bounciness: 0.1, behavior: "heavy", size: 42, count: 1 },
  pizza: { name: "Slippery Pizza", emoji: "🍕", shape: "box", mass: 0.9, bounciness: 0.3, behavior: "slippery", size: 30, count: 2 },
  bubble: { name: "Anti-Grav Bubble", emoji: "🫧", shape: "circle", mass: 0.4, bounciness: 0.4, behavior: "floating", size: 36, count: 3 },
  banana: { name: "Rocket Banana", emoji: "🍌", shape: "box", mass: 1.1, bounciness: 0.7, behavior: "exploding", size: 28, count: 2 },
  donut: { name: "Glazed Donut", emoji: "🍩", shape: "circle", mass: 1.0, bounciness: 0.8, behavior: "floating", size: 28, count: 2 },
  tnt: { name: "Absurd TNT Box", emoji: "💣", shape: "box", mass: 2.8, bounciness: 0.4, behavior: "exploding", size: 32, count: 1 },
  alarm: { name: "Screaming Clock", emoji: "⏰", shape: "circle", mass: 1.8, bounciness: 0.9, behavior: "super_bounce", size: 28, count: 2 },
  jelly: { name: "Wobbly Flan", emoji: "🍮", shape: "box", mass: 2.0, bounciness: 1.3, behavior: "super_bounce", size: 34, count: 2 },
  toaster: { name: "Self-Aware Toaster", emoji: "🍞", shape: "box", mass: 3.0, bounciness: 0.5, behavior: "heavy", size: 32, count: 1 },
  cactus: { name: "Flying Cactus", emoji: "🌵", shape: "box", mass: 2.2, bounciness: 0.4, behavior: "sticky", size: 30, count: 2 },
  bowling: { name: "Uranium Bowling Ball", emoji: "🎳", shape: "circle", mass: 9.0, bounciness: 0.2, behavior: "heavy", size: 36, count: 1 },
  ufo: { name: "Tiny Alien Saucer", emoji: "🛸", shape: "circle", mass: 1.5, bounciness: 0.8, behavior: "floating", size: 32, count: 1 }
};

export const SCRIPTED_CHAOS_EVENTS: ChaosEvent[] = [
  {
    event_title: "Rubber Duck Deluge",
    director_commentary: "I heard you needed moral support, so I dispatched 6 high-velocity squeaking waterfowl. You're welcome!",
    gravity_vector: { x: 0, y: 1.0 },
    speed_multiplier: 1.1,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.duck, count: 4 },
      { ...LOCAL_ITEMS_CATALOG.donut, count: 2 }
    ],
    audio_vibe: "chaos",
    modifier_effect: "super_bounce",
    duration: 12
  },
  {
    event_title: "Gravity Took A Sick Day",
    director_commentary: "Sir Isaac Newton has officially left the lobby. Enjoy floating helplessly!",
    gravity_vector: { x: 0, y: -0.5 },
    speed_multiplier: 0.9,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.bubble, count: 4 },
      { ...LOCAL_ITEMS_CATALOG.ufo, count: 2 }
    ],
    audio_vibe: "lofi",
    modifier_effect: "anti_gravity",
    duration: 14
  },
  {
    event_title: "The Espresso Tsunami",
    director_commentary: "Your reflexes seem sluggish. Let's deliver 300mg of airborne hot caffeine directly to your skull!",
    gravity_vector: { x: 0, y: 1.2 },
    speed_multiplier: 1.2,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.coffee, count: 3 },
      { ...LOCAL_ITEMS_CATALOG.donut, count: 2 }
    ],
    audio_vibe: "panic",
    modifier_effect: "low_friction",
    duration: 10
  },
  {
    event_title: "Heavy Metal Monday",
    director_commentary: "I found some vintage 16-ton anvils gathering dust in the warehouse. Catch with your teeth!",
    gravity_vector: { x: 0, y: 1.8 },
    speed_multiplier: 0.85,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.anvil, count: 2 },
      { ...LOCAL_ITEMS_CATALOG.bowling, count: 1 }
    ],
    audio_vibe: "panic",
    modifier_effect: "heavy_ragdoll",
    duration: 11
  },
  {
    event_title: "Slippery Italian Buffet",
    director_commentary: "Who greased the entire floor with mozzarella oil? Oh wait, that was me.",
    gravity_vector: { x: 0.3, y: 0.9 },
    speed_multiplier: 1.15,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.pizza, count: 4 },
      { ...LOCAL_ITEMS_CATALOG.jelly, count: 2 }
    ],
    audio_vibe: "chaos",
    modifier_effect: "low_friction",
    duration: 12
  },
  {
    event_title: "The Quantum Singularity",
    director_commentary: "Don't look directly at the event horizon. It's shy and has an appetite for ragdolls.",
    gravity_vector: { x: 0, y: 0.1 },
    speed_multiplier: 1.0,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.tnt, count: 2 },
      { ...LOCAL_ITEMS_CATALOG.alarm, count: 2 }
    ],
    audio_vibe: "panic",
    modifier_effect: "black_hole",
    duration: 13
  },
  {
    event_title: "Sideways Gale Force Gale",
    director_commentary: "Hold onto your toupee! Aerodynamics are now purely horizontal.",
    gravity_vector: { x: 1.3, y: 0.2 },
    speed_multiplier: 1.25,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.banana, count: 3 },
      { ...LOCAL_ITEMS_CATALOG.laptop, count: 2 }
    ],
    audio_vibe: "chaos",
    modifier_effect: "sideways_wind",
    duration: 10
  },
  {
    event_title: "Jelly Castle Protocol",
    director_commentary: "Every surface is now coated in 500% bouncy gelatine. Try not to reach low Earth orbit!",
    gravity_vector: { x: 0, y: 0.8 },
    speed_multiplier: 1.05,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.jelly, count: 3 },
      { ...LOCAL_ITEMS_CATALOG.duck, count: 3 }
    ],
    audio_vibe: "triumph",
    modifier_effect: "super_bounce",
    duration: 12
  },
  {
    event_title: "Office Space Apocalypse",
    director_commentary: "Your IT ticket regarding 'rogue airborne laptops' has been closed as 'Working as Intended'.",
    gravity_vector: { x: 0, y: 1.1 },
    speed_multiplier: 1.1,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.laptop, count: 3 },
      { ...LOCAL_ITEMS_CATALOG.coffee, count: 2 }
    ],
    audio_vibe: "panic",
    modifier_effect: "none",
    duration: 11
  },
  {
    event_title: "Helium Overdose",
    director_commentary: "Your bones are now filled with festive party gas. Float like a butterfly, crash like a piano.",
    gravity_vector: { x: 0, y: -0.3 },
    speed_multiplier: 0.95,
    spawn_items: [
      { ...LOCAL_ITEMS_CATALOG.bubble, count: 5 },
      { ...LOCAL_ITEMS_CATALOG.donut, count: 2 }
    ],
    audio_vibe: "lofi",
    modifier_effect: "balloon_mode",
    duration: 13
  }
];

export function getRandomFallbackEvent(): ChaosEvent {
  const index = Math.floor(Math.random() * SCRIPTED_CHAOS_EVENTS.length);
  return JSON.parse(JSON.stringify(SCRIPTED_CHAOS_EVENTS[index]));
}
