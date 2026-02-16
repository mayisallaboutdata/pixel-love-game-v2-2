/**
 * ui.js
 * ─────────────────────────────────────────────────────────────
 * All DOM interaction: screens, HUD updates, and message
 * rendering.  Zero canvas knowledge lives here.
 * ─────────────────────────────────────────────────────────────
 */

"use strict";

const UI = (() => {

  // ── Element references (resolved lazily on first call) ───
  const el = {};

  function _get(id) {
    if (!el[id]) el[id] = document.getElementById(id);
    return el[id];
  }

  // ── Screen Management ─────────────────────────────────────

  /**
   * Show a screen by id, or pass null to hide all screens.
   * @param {string|null} id
   */
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    if (id) _get(id).classList.add("active");
  }

  // ── HUD ───────────────────────────────────────────────────

  function showHUD(visible) {
    _get("hud").style.display          = visible ? "flex" : "none";
    _get("progressWrap").style.display = visible ? "block" : "none";
  }

  function updateScore(value) {
    _get("scoreDisplay").textContent = value;
  }

  function updateTimer(seconds) {
    _get("timerDisplay").textContent = seconds;
  }

  /**
   * @param {number} current
   * @param {number} target
   */
  function updateProgress(current, target) {
    _get("progressBar").style.width = Math.min((current / target) * 100, 100) + "%";
  }

  // ── End Screens ───────────────────────────────────────────

  function showWin(score, config) {
    _get("winScore").textContent = score;
    _get("winMsg").textContent   = config.messages.win;
    showScreen("winScreen");
  }

  function showLose(score, config) {
    _get("loseScore").textContent = score;
    const remaining = config.gameplay.targetScore - score;
    _get("loseMsg").textContent = config.messages.lose.replace("{remaining}", remaining);
    showScreen("loseScreen");
  }

  // ── Intro Personalisation ─────────────────────────────────

  /**
   * Inject player name into the intro and goal display.
   * Call once after the page loads.
   * @param {object} config  Full GAME_CONFIG
   */
  function applyConfig(config) {
    const nameEl = _get("playerNameDisplay");
    if (nameEl) nameEl.textContent = config.player.name;

    const subtitleEl = _get("playerSubtitle");
    if (subtitleEl) subtitleEl.textContent = config.player.subtitle;

    const goalEl = _get("goalDisplay");
    if (goalEl) goalEl.textContent = config.gameplay.targetScore;

    const instrEl = _get("instructionText");
    if (instrEl) instrEl.textContent = config.messages.intro;
  }

  // ── Public API ────────────────────────────────────────────
  return {
    showScreen,
    showHUD,
    updateScore,
    updateTimer,
    updateProgress,
    showWin,
    showLose,
    applyConfig,
  };

})();
