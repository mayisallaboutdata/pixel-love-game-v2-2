/**
 * main.js
 * ─────────────────────────────────────────────────────────────
 * Entry point.  Wires all modules together after the DOM loads.
 *
 * Flow:
 *   1. Load any saved customizations into GAME_CONFIG
 *   2. Show the customizer screen
 *   3. On "Start Game" → show intro screen
 *   4. On "Play" → run the game loop
 *   5. "✏ Edit" button on intro re-opens the customizer
 *   6. ⚙ Settings button controls music on/off
 * ─────────────────────────────────────────────────────────────
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ── Canvas setup ─────────────────────────────────────────
  const gameCanvas = document.getElementById("gameCanvas");
  const hugCanvas  = document.getElementById("hug-canvas");

  function resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    gameCanvas.width  = w;
    gameCanvas.height = h;
    hugCanvas.width   = w;
    hugCanvas.height  = h;
    Game.resize(w, h);
  }

  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();

  // ── Load saved settings → mutate GAME_CONFIG in-place ────
  Customizer.loadSaved();

  // ── Init game engine (uses current GAME_CONFIG) ───────────
  Game.init(gameCanvas, GAME_CONFIG);

  // ── Music setup ───────────────────────────────────────────
  const musicEnabled = Music.loadState();
  const musicToggle  = document.getElementById("musicToggle");

  // Set initial UI state
  if (musicEnabled) {
    musicToggle.classList.add("on");
  }

  // Start music automatically if enabled
  // (will be suspended by browser until first user interaction)
  if (musicEnabled) {
    Music.play();
  }

  // ── Settings modal ────────────────────────────────────────
  const settingsBtn    = document.getElementById("settingsBtn");
  const settingsModal  = document.getElementById("settingsModal");
  const settingsClose  = document.getElementById("settingsCloseBtn");

  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("active");
  });

  settingsClose.addEventListener("click", () => {
    settingsModal.classList.remove("active");
  });

  // Close modal when clicking outside
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("active");
    }
  });

  // Music toggle
  musicToggle.addEventListener("click", () => {
    const nowEnabled = Music.toggle();
    musicToggle.classList.toggle("on", nowEnabled);
  });

  // ── Pause Menu ────────────────────────────────────────────
  const pauseMenu       = document.getElementById("pauseMenu");
  const pauseResumeBtn  = document.getElementById("pauseResumeBtn");
  const pauseRestartBtn = document.getElementById("pauseRestartBtn");
  const pauseMainBtn    = document.getElementById("pauseMainMenuBtn");

  function showPauseMenu() {
    Game.pause();
    pauseMenu.classList.add("active");
  }

  function hidePauseMenu() {
    pauseMenu.classList.remove("active");
    Game.resume();
  }

  // ESC key handler
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Only handle ESC during gameplay (not on screens)
      if (Game.isPaused()) {
        hidePauseMenu();
      } else if (document.getElementById("hud").style.display === "flex") {
        // HUD is visible = game is running
        showPauseMenu();
      }
    }
  });

  pauseResumeBtn.addEventListener("click", () => {
    hidePauseMenu();
  });

  pauseRestartBtn.addEventListener("click", () => {
    pauseMenu.classList.remove("active");
    Game.start(); // Start calls _reset and clears paused state
  });

  pauseMainBtn.addEventListener("click", () => {
    pauseMenu.classList.remove("active");
    Game.pause(); // Ensure game stays paused
    UI.showScreen("intro");
    UI.showHUD(false);
  });

  // ── Helper: apply config to DOM and show intro ────────────
  function goToIntro() {
    UI.applyConfig(GAME_CONFIG);
    UI.showScreen("intro");
  }

  // ── Customizer → Intro transition ────────────────────────
  Customizer.show(() => goToIntro());

  // ── "✏ Edit" button on intro screen ──────────────────────
  document.getElementById("reopenCustBtn").addEventListener("click", () => {
    UI.showScreen(null);
    Customizer.show(() => goToIntro());
  });

  // ── Gameplay buttons ──────────────────────────────────────
  document.getElementById("playBtn").addEventListener("click", () => {
    Game.start();
  });

  document.getElementById("winPlayAgainBtn").addEventListener("click", () => {
    Game.start();
  });

  document.getElementById("losePlayAgainBtn").addEventListener("click", () => {
    Game.start();
  });

});
