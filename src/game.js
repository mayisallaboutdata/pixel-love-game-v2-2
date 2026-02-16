/**
 * game.js
 * ─────────────────────────────────────────────────────────────
 * Core game loop, state management, and collision detection.
 * Depends on: renderer.js, ui.js, and GAME_CONFIG from game.config.js
 * ─────────────────────────────────────────────────────────────
 */

"use strict";

const Game = (() => {

  // ── Private State ─────────────────────────────────────────
  let canvas, ctx;
  let W, H;
  let config;

  let hearts      = [];
  let particles   = [];
  let scorePopups = [];
  let stars       = [];

  let score       = 0;
  let timeLeft    = 0;
  let gameRunning = false;
  let gamePaused  = false;
  let spawnTimer  = 0;
  let comboCount  = 0;
  let lastCatchMs = 0;
  let timerHandle = null;
  let rafHandle   = null;

  let playerX       = 0;
  let playerTargetX = 0;

  // ── Initialization ────────────────────────────────────────

  /**
   * One-time setup — call before startGame().
   * @param {HTMLCanvasElement} canvasEl
   * @param {object} gameConfig  GAME_CONFIG object
   */
  function init(canvasEl, gameConfig) {
    canvas = canvasEl;
    ctx    = canvas.getContext("2d");
    config = gameConfig;

    stars = Renderer.buildStars(config.theme.starCount);

    _bindInput();
  }

  // ── Public: Pause / Resume ────────────────────────────────

  function pause() {
    if (!gameRunning || gamePaused) return;
    gamePaused = true;
    if (timerHandle) clearInterval(timerHandle);
  }

  function resume() {
    if (!gameRunning || !gamePaused) return;
    gamePaused = false;
    // Restart timer
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = setInterval(_tick, 1000);
  }

  function isPaused() {
    return gamePaused;
  }

  function _bindInput() {
    canvas.addEventListener("touchmove",  e => { e.preventDefault(); if (gameRunning) playerTargetX = e.touches[0].clientX; }, { passive: false });
    canvas.addEventListener("touchstart", e => { e.preventDefault(); if (gameRunning) playerTargetX = e.touches[0].clientX; }, { passive: false });
    canvas.addEventListener("mousemove",  e => { if (gameRunning) playerTargetX = e.clientX; });
  }

  // ── Public: Start / Stop ──────────────────────────────────

  function start() {
    _reset();
    UI.showScreen(null);
    UI.showHUD(true);
    gameRunning = true;
    gamePaused  = false;

    if (timerHandle) clearInterval(timerHandle);
    timerHandle = setInterval(_tick, 1000);

    rafHandle = requestAnimationFrame(_loop);
  }

  function _reset() {
    hearts      = [];
    particles   = [];
    scorePopups = [];
    score       = 0;
    timeLeft    = config.gameplay.timeLimit;
    spawnTimer  = 0;
    comboCount  = 0;
    lastCatchMs = 0;
    playerX     = W / 2;
    playerTargetX = W / 2;

    UI.updateScore(0);
    UI.updateTimer(timeLeft);
    UI.updateProgress(0, config.gameplay.targetScore);
  }

  function _tick() {
    if (gamePaused) return; // Don't tick timer when paused
    timeLeft--;
    UI.updateTimer(timeLeft);
    if (timeLeft <= 0) _end();
  }

  function _end() {
    gameRunning = false;
    gamePaused  = false;
    clearInterval(timerHandle);
    cancelAnimationFrame(rafHandle);
    UI.showHUD(false);

    if (score >= config.gameplay.targetScore) {
      HugScene.play(config, stars, score, W, H);
    } else {
      UI.showLose(score, config);
    }
  }

  // ── Main Loop ─────────────────────────────────────────────

  function _loop() {
    if (!gameRunning) return;

    _drawBackground();
    
    if (!gamePaused) {
      _spawnHearts();
      _updatePlayer();
      _updateHearts();
      _updateParticles();
      _updatePopups();
    }
    
    _drawPlayer();

    rafHandle = requestAnimationFrame(_loop);
  }

  // ── Background ────────────────────────────────────────────

  function _drawBackground() {
    const ctx2 = ctx;
    ctx2.fillStyle = config.theme.canvasBackground;
    ctx2.fillRect(0, 0, W, H);

    Renderer.drawStars(ctx2, W, H, stars, Date.now() * 0.001);

    // Ground strip
    ctx2.fillStyle = config.theme.groundColor;
    ctx2.fillRect(0, H - 15, W, 15);
    for (let x = 0; x < W; x += Renderer.BASE_PIXEL * 4) {
      Renderer.pxRect(ctx2, x, H - 15, Renderer.BASE_PIXEL * 2, Renderer.BASE_PIXEL, "#2a1a3e");
    }
  }

  // ── Spawning ──────────────────────────────────────────────

  function _spawnHearts() {
    spawnTimer++;
    const rate = Math.max(12, 30 - Math.floor(score / 10) * 2);
    if (spawnTimer >= rate) {
      _addHeart();
      spawnTimer = 0;
    }
  }

  function _addHeart() {
    const gp = config.gameplay;
    const isBroken = Math.random() < gp.brokenHeartChance;
    const isGold   = !isBroken && Math.random() < gp.goldHeartChance;
    const colors   = config.theme.heartColors;

    hearts.push({
      x: Math.random() * (W - 80) + 40,
      y: -30,
      size:  Renderer.BASE_PIXEL * (1.5 + Math.random() * 0.8),
      speed: 1.5 + Math.random() * 1.8 + Math.min(score * 0.015, 2),
      color: isGold ? "#ffd700" : (isBroken ? "#555" : colors[Math.floor(Math.random() * colors.length)]),
      wobble: Math.random() * Math.PI * 2,
      isBroken,
      isGold,
    });
  }

  // ── Player ────────────────────────────────────────────────

  function _updatePlayer() {
    playerX += (playerTargetX - playerX) * 0.18;
  }

  function _drawPlayer() {
    Renderer.drawPlayerCharacter(ctx, playerX, H - 60, config.playerCharacter);
  }

  // ── Hearts ────────────────────────────────────────────────

  function _updateHearts() {
    const playerY = H - 60;
    const gp = config.gameplay;

    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.y += h.speed;
      h.x += Math.sin(h.wobble + h.y * 0.015) * 0.6;

      const dx = h.x - playerX;
      const dy = h.y - (playerY - 15);

      if (Math.abs(dx) < 35 && Math.abs(dy) < 35) {
        _handleCatch(h);
        hearts.splice(i, 1);
        continue;
      }

      if (h.y > H + 30) { hearts.splice(i, 1); continue; }

      // Draw
      if (h.isGold) { ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 12; }
      if (h.isBroken) {
        Renderer.drawBrokenHeart(ctx, h.x, h.y, h.size);
      } else {
        Renderer.drawHeart(ctx, h.x, h.y, h.size, h.color, h.isGold ? "#b8860b" : "#8b0030");
      }
      ctx.shadowBlur = 0;
    }
  }

  function _handleCatch(heart) {
    const gp  = config.gameplay;
    const now = Date.now();

    if (heart.isBroken) {
      score = Math.max(0, score - gp.penaltyPoints);
      _addParticles(heart.x, heart.y, "#555", 6);
      _addPopup(heart.x, heart.y, `-${gp.penaltyPoints}`, "#888");
      comboCount = 0;
    } else {
      if (now - lastCatchMs < gp.comboWindow) comboCount++;
      else comboCount = 1;
      lastCatchMs = now;

      const pts = heart.isGold
        ? gp.goldPoints
        : (comboCount >= 3 ? gp.comboPoints : 1);
      score += pts;

      _addParticles(heart.x, heart.y, heart.color, heart.isGold ? 14 : 8);
      const label = comboCount >= 3 ? `+${pts} x${comboCount}!` : `+${pts}`;
      _addPopup(heart.x, heart.y, label, heart.isGold ? "#ffd700" : "#ff6b8a");
    }

    UI.updateScore(score);
    UI.updateProgress(score, config.gameplay.targetScore);

    if (score >= config.gameplay.targetScore) _end();
  }

  // ── Particles ─────────────────────────────────────────────

  function _addParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      particles.push({
        x, y,
        vx:   Math.cos(angle) * (2 + Math.random() * 2),
        vy:   Math.sin(angle) * (2 + Math.random() * 2) - 1.5,
        life: 1,
        color,
        size: Renderer.BASE_PIXEL,
      });
    }
  }

  function _updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= 0.03;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      Renderer.pxRect(ctx, p.x, p.y, p.size, p.size, p.color);
    }
    ctx.globalAlpha = 1;
  }

  // ── Score Popups ──────────────────────────────────────────

  function _addPopup(x, y, text, color) {
    scorePopups.push({ x, y, text, color, life: 1 });
  }

  function _updatePopups() {
    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const sp = scorePopups[i];
      sp.y   -= 1.2;
      sp.life -= 0.02;
      if (sp.life <= 0) { scorePopups.splice(i, 1); continue; }
      ctx.globalAlpha = sp.life;
      ctx.font = `bold ${Math.floor(14 + (1 - sp.life) * 4)}px "Press Start 2P", monospace`;
      ctx.fillStyle = sp.color;
      ctx.textAlign = "center";
      ctx.fillText(sp.text, sp.x, sp.y);
    }
    ctx.globalAlpha = 1;
  }

  // ── Resize ────────────────────────────────────────────────

  function resize(w, h) {
    W = w;
    H = h;
  }

  // ── Public API ────────────────────────────────────────────
  return { init, start, resize, pause, resume, isPaused };

})();
