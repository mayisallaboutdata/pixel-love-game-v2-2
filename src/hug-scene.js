/**
 * hug-scene.js
 * ─────────────────────────────────────────────────────────────
 * The win-condition hug animation, rendered on a separate
 * canvas overlay so the game canvas can safely go idle.
 * ─────────────────────────────────────────────────────────────
 */

"use strict";

const HugScene = (() => {

  // ── Public: Play ─────────────────────────────────────────

  /**
   * Fade in the hug animation, then transition to the win screen.
   *
   * @param {object} config  Full GAME_CONFIG
   * @param {Array}  stars   Pre-built star array from Renderer.buildStars()
   * @param {number} score   Final score (passed to win screen)
   * @param {number} W       Canvas width
   * @param {number} H       Canvas height
   */
  function play(config, stars, score, W, H) {
    const hugCanvas = document.getElementById("hug-canvas");
    const hugCtx    = hugCanvas.getContext("2d");
    hugCanvas.style.display = "block";

    let frame      = 0;
    let charAlpha  = 0;
    let textAlpha  = 0;
    const TEXT_DELAY = 80;    // frames before text fades in
    const TOTAL_FRAMES = 300; // total animation length

    const name = config.player.name;

    function _animate() {
      // ── Background ──────────────────────────────────────
      hugCtx.fillStyle = config.theme.canvasBackground;
      hugCtx.fillRect(0, 0, W, H);

      Renderer.drawStars(hugCtx, W, H, stars, Date.now() * 0.001);

      hugCtx.fillStyle = config.theme.groundColor;
      hugCtx.fillRect(0, H * 0.7, W, H * 0.3);

      // ── Characters ──────────────────────────────────────
      if (charAlpha < 1) charAlpha += 0.015;
      hugCtx.globalAlpha = Math.min(charAlpha, 1);
      Renderer.drawHugScene(hugCtx, W, H * 0.65, frame, config);
      hugCtx.globalAlpha = 1;

      // ── Floating hearts ─────────────────────────────────
      if (frame > 40) {
        for (let i = 0; i < 3; i++) {
          const hx = W * (0.2 + 0.6 * Math.sin(frame * 0.01 + i * 2.1));
          const hy = H * 0.2 - Math.sin(frame * 0.04 + i * 1.5) * 30 - i * 25;
          hugCtx.globalAlpha = 0.5 + 0.3 * Math.sin(frame * 0.06 + i);
          Renderer.drawHeart(hugCtx, hx, hy, Math.floor(Renderer.BASE_PIXEL * 0.8), "#ff4a6e");
        }
        hugCtx.globalAlpha = 1;
      }

      // ── Text ────────────────────────────────────────────
      frame++;
      if (frame > TEXT_DELAY) {
        textAlpha = Math.min(textAlpha + 0.02, 1);
        hugCtx.globalAlpha = textAlpha;
        hugCtx.textAlign   = "center";

        // Main title
        const titleText = config.messages.hugTitle.replace("{name}", name);
        hugCtx.font      = `bold ${Math.floor(Math.min(W * 0.055, 22))}px "Press Start 2P", monospace`;
        hugCtx.fillStyle = "#ff4a6e";
        hugCtx.fillText(titleText, W / 2, H * 0.78);

        // Subtitle lines
        hugCtx.font      = `${Math.floor(Math.min(W * 0.04, 17))}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        hugCtx.fillStyle = "#ffb6c8";
        hugCtx.fillText(config.messages.hugSubtitle, W / 2, H * 0.78 + 35);
        hugCtx.fillText("Happy Valentine's Day!", W / 2, H * 0.78 + 60);

        hugCtx.globalAlpha = 1;
      }

      // ── Transition to win screen ─────────────────────────
      if (frame < TOTAL_FRAMES) {
        requestAnimationFrame(_animate);
      } else {
        setTimeout(() => {
          hugCanvas.style.display = "none";
          UI.showWin(score, config);
        }, 1500);
      }
    }

    requestAnimationFrame(_animate);
  }

  // ── Public API ────────────────────────────────────────────
  return { play };

})();
