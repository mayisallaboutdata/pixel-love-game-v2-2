# 💝 Pixel Love Game

A browser-based Valentine's Day arcade game written in vanilla HTML/CSS/JS. Two pixel-art characters you can fully customize fall in love while the player catches falling hearts.

---

## ✨ Features

- 🎮 **Slide-to-catch mechanic** — works on both mouse and touch screens (mobile-ready!)
- 💛 **Gold hearts** (bonus points), 💔 **broken hearts** (penalty), and **combo multipliers**
- 🎉 **Win animation** — a romantic hug scene featuring the two characters
- 🎨 **In-game customizer** with live preview — change names, colors, hairstyles, gameplay rules
- 🎵 **Background music** — sweet chiptune melody (toggle on/off in settings)
- ⏸️ **Pause menu** — press ESC during gameplay to pause/restart/quit
- ⚙️ **Settings panel** — control music, view game controls
- 💾 **Auto-save** — all customizations persist in browser localStorage
- 📱 **Mobile-optimized** — responsive design, touch controls, works on phones/tablets
- 📦 **Zero dependencies** — pure vanilla HTML/CSS/JS, no build step required

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/pixel-love-game.git
cd pixel-love-game

# Open in your browser  (no server needed)
open index.html
# or on Windows:
start index.html
```

---

## 🎨 Customization

### In-game customizer (recommended)

When you open the game, a **customization screen appears first** — no code required.

| Tab | What you can change |
|-----|---------------------|
| 👤 **Names** | Recipient name, your name, all message text |
| 💃 **Player** | Hair style (6 options), hair colors (3 shades), skin tone, dress color, shoes |
| 🕺 **Partner** | Hair style (6 options), hair colors (3 shades), skin tone, jacket, shirt, trousers, shoes |
| ⚙️ **Rules** | Time limit, score goal, heart chances, point values, theme colors |

A **live pixel-art preview** updates as you change colors so you can see exactly what the characters will look like before starting.

Settings are saved in the browser automatically, so they survive page reloads.  
Hit **✏ Edit** on the intro screen any time to re-open the customizer.

---

### Code-level customization (optional)

Everything is also configurable in **`config/game.config.js`** if you prefer editing a file directly.

### Names & Messages

```js
player: {
  name: "Aysu",          // ← name on the intro screen
  subtitle: "A little game made with love for",
},

sender: {
  name: "Mayis",         // ← your name (used in closing messages)
},

messages: {
  win:  "You caught 100 hearts...\nbut you've had mine from the start. 💕",
  lose: "Only {remaining} more hearts to go!\nTry again! 💕",
  hugTitle: "I LOVE YOU, {name}!",   // {name} is auto-replaced
},
```

### Gameplay Tuning

```js
gameplay: {
  targetScore:        100,   // hearts needed to win
  timeLimit:           45,   // seconds
  brokenHeartChance:  0.12,  // 0–1  (penalty hearts)
  goldHeartChance:    0.10,  // 0–1  (bonus hearts)
  penaltyPoints:         3,
  goldPoints:            5,
  comboPoints:           2,  // awarded on 3+ quick catches
  comboWindow:         800,  // milliseconds for a combo
},
```

### Character Colors

Both characters are made of colored pixel-art rectangles.
Change any hex color to restyle them:

```js
playerCharacter: {
  hairColors:      ["#8b1a1a", "#a01010", "#c42020"],  // dark → main → highlight
  skinColor:       "#fdd5b1",
  outfitColor:     "#ff4a6e",
  outfitHighlight: "#ff6b8a",
  accentColor:     "#ffd700",  // belt / ribbon
  shoeColor:       "#8b1a1a",
},

partnerCharacter: {
  hairColors:      ["#3d2314", "#4a2a15", "#6b3d22"],
  skinColor:       "#f5c7a1",
  outfitColor:     "#222222",  // jacket
  outfitHighlight: "#333333",
  shirtColor:      "#ffffff",
  trouserColor:    "#1a1a2e",
  shoeColor:       "#333333",
},
```

### Visual Theme

```js
theme: {
  background:       "#1a0a1e",
  canvasBackground: "#0f0a18",
  groundColor:      "#1a0a2e",
  hudAccent:        "#ff4a6e",
  starCount:        50,
  heartColors:      ["#ff4a6e", "#ff3355", "#ff6b8a", "#e84393"],
},
```

---

## 🗂️ Project Structure

```
pixel-love-game/
├── index.html               # Markup only — no inline logic
├── config/
│   └── game.config.js       # Default values & fallback for all settings
└── src/
    ├── style.css            # All styles (CSS variables make theming easy)
    ├── main.js              # Entry point — wires modules together
    ├── customizer.js        # In-game customization screen & localStorage save/load
    ├── renderer.js          # Pixel-art drawing primitives & characters (with hairstyles)
    ├── game.js              # Game loop, state, collision detection, pause system
    ├── ui.js                # DOM interactions & screen management
    ├── hug-scene.js         # Win-condition hug animation
    └── music.js             # Background music generator using Web Audio API
```

### Module Responsibilities

| File | Responsibility |
|------|---------------|
| `game.config.js` | Default settings — names, colors, hairstyles, gameplay values |
| `customizer.js` | In-game UI, live preview, localStorage persistence |
| `renderer.js` | Pure drawing functions; modular hairstyle system |
| `game.js` | Game state machine: spawning, physics, catching, scoring, pause/resume |
| `ui.js` | All DOM reads/writes; HUD updates, screen transitions |
| `hug-scene.js` | Win animation overlay on a separate canvas |
| `music.js` | Generative chiptune background music |
| `main.js` | Bootstraps after DOMContentLoaded; wires all modules together |

---

## 🎮 Controls

### Desktop
- **Mouse** — Move cursor to catch hearts
- **ESC** — Pause game
- **⚙ Settings button** — Toggle music, view controls

### Mobile
- **Touch & drag** — Swipe finger to catch hearts
- **⚙ Settings button** — Toggle music, view controls
- **Note:** ESC pause not available on mobile (no keyboard)

---

## 📱 Mobile Usage

The game is **fully mobile-ready** with responsive touch controls.

### Quick Deploy Options:

**GitHub Pages (Free hosting):**
```bash
# After pushing to GitHub, enable Pages in Settings → Pages
# Your game will be at: https://yourusername.github.io/pixel-love-game/
```

**Add to Home Screen:**
1. Open the game URL on mobile browser
2. Tap Share → "Add to Home Screen"
3. Game appears as an app icon!

**Local Network Testing:**
```bash
python3 -m http.server 8080
# Visit from phone: http://YOUR_COMPUTER_IP:8080
```

---

## 🛠️ Development

The project uses **no build tools**.  For a live-reload workflow:

```bash
# Using Python (built in to most systems)
python3 -m http.server 8080
# then visit http://localhost:8080

# Using Node.js
npx serve .
```

---

## 📸 Screenshots

> <img width="2932" height="1432" alt="image" src="https://github.com/user-attachments/assets/63b04933-23b0-4836-94b3-861a2cd090d2" />

---

## 📄 License

MIT — do whatever you like with it. If you make someone happy with this, that's enough. 💕
