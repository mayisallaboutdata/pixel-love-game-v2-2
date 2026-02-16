/**
 * ============================================================
 *  PIXEL LOVE GAME — Configuration File
 * ============================================================
 *  Customize your game here before opening index.html.
 *  No coding knowledge required — just change the values below!
 * ============================================================
 */

const GAME_CONFIG = {

  // ─────────────────────────────────────────────────────────
  //  NAMES
  // ─────────────────────────────────────────────────────────
  player: {
    /** The name displayed in the intro and win screen */
    name: "Player",

    /** Short message shown under the name on the intro screen */
    subtitle: "A little game made with love for",
  },

  sender: {
    /** Your name — used in closing messages */
    name: "Sender",
  },


  // ─────────────────────────────────────────────────────────
  //  MESSAGES
  // ─────────────────────────────────────────────────────────
  messages: {
    /** Shown on the intro screen below the player name */
    intro: "SLIDE YOUR FINGER\nTO CATCH HEARTS",

    /** Message on the WIN screen */
    win: "You caught 100 hearts...\nbut you've had mine from the start.\nI love you! 💕",

    /** Message on the LOSE screen (use {remaining} for the gap to goal) */
    lose: "Only {remaining} more hearts to go!\nYou're so close... try again! 💕",

    /** Big text shown during the hug animation */
    hugTitle: "I LOVE YOU, {name}!",

    /** Subtitle shown during the hug animation */
    hugSubtitle: "You caught all my love... and my heart 💕",
  },


  // ─────────────────────────────────────────────────────────
  //  GAMEPLAY
  // ─────────────────────────────────────────────────────────
  gameplay: {
    /** Hearts needed to win */
    targetScore: 100,

    /** Seconds to catch them in */
    timeLimit: 45,

    /** Chance (0–1) for a heart to be a broken (penalty) heart. Default: 0.12 */
    brokenHeartChance: 0.12,

    /** Chance (0–1) for a heart to be a gold (bonus) heart. Default: 0.10 */
    goldHeartChance: 0.10,

    /** Points deducted when catching a broken heart */
    penaltyPoints: 3,

    /** Points awarded for a gold heart */
    goldPoints: 5,

    /** Points awarded for a combo catch (3+ in < 800ms) */
    comboPoints: 2,

    /** Milliseconds window for a combo catch */
    comboWindow: 800,
  },


  // ─────────────────────────────────────────────────────────
  //  PLAYER CHARACTER  (Pixel Art)
  // ─────────────────────────────────────────────────────────
  playerCharacter: {
    /**
     * Hair color palette.
     * [0] = darkest / back layer
     * [1] = main hair color
     * [2] = highlight
     */
    hairColors: ["#8b1a1a", "#a01010", "#c42020"],

    /** Skin tone */
    skinColor: "#fdd5b1",

    /** Dress / outfit color */
    outfitColor: "#ff4a6e",
    outfitHighlight: "#ff6b8a",

    /** Belt / accessory accent color */
    accentColor: "#ffd700",

    /** Shoe color */
    shoeColor: "#8b1a1a",

    /**
     * Hairstyle. Options: long, short, ponytail, bun, curly, pigtails
     */
    hairStyle: "long",
  },


  // ─────────────────────────────────────────────────────────
  //  PARTNER CHARACTER  (Pixel Art)
  // ─────────────────────────────────────────────────────────
  partnerCharacter: {
    /**
     * Hair color palette.
     * [0] = darkest / back layer
     * [1] = main hair color
     * [2] = highlight
     */
    hairColors: ["#3d2314", "#4a2a15", "#6b3d22"],

    /** Skin tone */
    skinColor: "#f5c7a1",

    /** Jacket / outfit color */
    outfitColor: "#222222",
    outfitHighlight: "#333333",

    /** Shirt / inner color */
    shirtColor: "#ffffff",

    /** Trouser color */
    trouserColor: "#1a1a2e",

    /** Shoe color */
    shoeColor: "#333333",

    /**
     * Hairstyle. Options: long, short, buzz, curly, bald, undercut
     */
    hairStyle: "short",
  },


  // ─────────────────────────────────────────────────────────
  //  VISUAL THEME
  // ─────────────────────────────────────────────────────────
  theme: {
    /** Page / sky background color */
    background: "#1a0a1e",

    /** Canvas background color (slightly different for depth) */
    canvasBackground: "#0f0a18",

    /** Ground strip color */
    groundColor: "#1a0a2e",

    /** HUD accent color */
    hudAccent: "#ff4a6e",

    /** Star count in the background */
    starCount: 50,

    /**
     * Heart colors used for falling hearts (array of hex strings).
     * Add or remove as you like.
     */
    heartColors: ["#ff4a6e", "#ff3355", "#ff6b8a", "#e84393"],
  },

};

// ── Do not edit below this line ──────────────────────────────
if (typeof module !== "undefined") module.exports = GAME_CONFIG;
