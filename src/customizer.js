/**
 * customizer.js
 * ─────────────────────────────────────────────────────────────
 * In-game customization screen with live character preview.
 * Shown once before the intro; settings are persisted in
 * localStorage so they survive page reloads.
 *
 * Depends on: renderer.js, GAME_CONFIG (mutated in-place)
 * ─────────────────────────────────────────────────────────────
 */

"use strict";

const Customizer = (() => {

  // ── Storage key ──────────────────────────────────────────
  const STORAGE_KEY = "pixelLoveGame_config_v1";

  // ── Preview canvas ───────────────────────────────────────
  let previewCanvas, previewCtx;
  let previewRaf   = null;
  let previewFrame = 0;

  // ── Active tab ───────────────────────────────────────────
  let activeTab = "names";

  // ── Public: load saved config into GAME_CONFIG ───────────

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      _deepMerge(GAME_CONFIG, saved);
    } catch (e) {
      // Silently ignore corrupt storage
    }
  }

  function save() {
    try {
      const toSave = {
        player:           GAME_CONFIG.player,
        sender:           GAME_CONFIG.sender,
        messages:         GAME_CONFIG.messages,
        gameplay:         GAME_CONFIG.gameplay,
        playerCharacter:  GAME_CONFIG.playerCharacter,
        partnerCharacter: GAME_CONFIG.partnerCharacter,
        theme:            GAME_CONFIG.theme,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      // Silently ignore (e.g. private browsing quota)
    }
  }

  // ── Public: show the customizer screen ───────────────────

  function show(onDone) {
    const screen = document.getElementById("customizerScreen");
    screen.classList.add("active");
    _buildTabs();
    _activateTab("names");
    _startPreview();

    document.getElementById("custStartBtn").onclick = () => {
      save();
      _stopPreview();
      screen.classList.remove("active");
      onDone();
    };
  }

  // ── Tab system ───────────────────────────────────────────

  const TABS = [
    { id: "names",    label: "👤 Names"   },
    { id: "player",   label: "💃 Player"  },
    { id: "partner",  label: "🕺 Partner" },
    { id: "gameplay", label: "⚙️ Rules"   },
  ];

  function _buildTabs() {
    const nav = document.getElementById("custTabNav");
    nav.innerHTML = "";
    TABS.forEach(tab => {
      const btn       = document.createElement("button");
      btn.className   = "cust-tab-btn";
      btn.dataset.tab = tab.id;
      btn.textContent = tab.label;
      btn.onclick = () => _activateTab(tab.id);
      nav.appendChild(btn);
    });
  }

  function _activateTab(id) {
    activeTab = id;

    document.querySelectorAll(".cust-tab-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === id);
    });

    const panel   = document.getElementById("custPanel");
    panel.innerHTML = "";

    switch (id) {
      case "names":    _buildNamesPanel(panel);                              break;
      case "player":   _buildCharPanel(panel, "playerCharacter",  "Player"); break;
      case "partner":  _buildCharPanel(panel, "partnerCharacter", "Partner");break;
      case "gameplay": _buildGameplayPanel(panel);                           break;
    }
  }

  // ── Panel builders ────────────────────────────────────────

  function _buildNamesPanel(panel) {
    _addSection(panel, "Who is this for?", [
      _fieldText("Recipient name", "player.name",     GAME_CONFIG.player.name),
      _fieldText("Your name",      "sender.name",     GAME_CONFIG.sender.name),
      _fieldText("Intro subtitle", "player.subtitle", GAME_CONFIG.player.subtitle),
    ]);
    _addSection(panel, "Messages", [
      _fieldTextarea("Win message",        "messages.win",         GAME_CONFIG.messages.win),
      _fieldTextarea("Lose message",       "messages.lose",        GAME_CONFIG.messages.lose,
                     "Use {remaining} for the hearts-remaining count"),
      _fieldTextarea("Hug scene title",    "messages.hugTitle",    GAME_CONFIG.messages.hugTitle,
                     "Use {name} for the recipient's name"),
      _fieldTextarea("Hug scene subtitle", "messages.hugSubtitle", GAME_CONFIG.messages.hugSubtitle),
    ]);
  }

  function _buildCharPanel(panel, configKey, label) {
    const cfg = GAME_CONFIG[configKey];
    const styleList = configKey === "playerCharacter"
      ? Renderer.PLAYER_HAIR_STYLES
      : Renderer.PARTNER_HAIR_STYLES;

    _addSection(panel, "Hair Style", [
      _fieldHairStyle(`${configKey}.hairStyle`, cfg.hairStyle, styleList),
    ]);
    _addSection(panel, "Hair Colors", [
      _fieldColor("Dark / back layer", `${configKey}.hairColors.0`, cfg.hairColors[0]),
      _fieldColor("Main hair color",   `${configKey}.hairColors.1`, cfg.hairColors[1]),
      _fieldColor("Highlight",         `${configKey}.hairColors.2`, cfg.hairColors[2]),
    ]);
    _addSection(panel, "Skin & Face", [
      _fieldColor("Skin tone", `${configKey}.skinColor`, cfg.skinColor),
    ]);
    _addSection(panel, "Outfit", [
      _fieldColor("Main outfit color", `${configKey}.outfitColor`,    cfg.outfitColor),
      _fieldColor("Outfit highlight",  `${configKey}.outfitHighlight`, cfg.outfitHighlight),
      ...(cfg.accentColor  ? [_fieldColor("Belt / accent",  `${configKey}.accentColor`,  cfg.accentColor)]  : []),
      ...(cfg.shirtColor   ? [_fieldColor("Shirt / inner",  `${configKey}.shirtColor`,   cfg.shirtColor)]   : []),
      ...(cfg.trouserColor ? [_fieldColor("Trousers",       `${configKey}.trouserColor`, cfg.trouserColor)] : []),
      _fieldColor("Shoes", `${configKey}.shoeColor`, cfg.shoeColor),
    ]);
  }

  function _buildGameplayPanel(panel) {
    const gp = GAME_CONFIG.gameplay;
    const th = GAME_CONFIG.theme;
    _addSection(panel, "Challenge", [
      _fieldNumber("Hearts to win",  "gameplay.targetScore", gp.targetScore, 10, 500, 10),
      _fieldNumber("Time limit (s)", "gameplay.timeLimit",   gp.timeLimit,   10, 120,  5),
    ]);
    _addSection(panel, "Heart types", [
      _fieldRange("Broken heart chance", "gameplay.brokenHeartChance", gp.brokenHeartChance, 0, 0.5, 0.01, v => `${Math.round(v * 100)}%`),
      _fieldRange("Gold heart chance",   "gameplay.goldHeartChance",   gp.goldHeartChance,   0, 0.5, 0.01, v => `${Math.round(v * 100)}%`),
    ]);
    _addSection(panel, "Scoring", [
      _fieldNumber("Penalty points",    "gameplay.penaltyPoints", gp.penaltyPoints,  1,  10,   1),
      _fieldNumber("Gold points",       "gameplay.goldPoints",    gp.goldPoints,     1,  20,   1),
      _fieldNumber("Combo points",      "gameplay.comboPoints",   gp.comboPoints,    1,  10,   1),
      _fieldNumber("Combo window (ms)", "gameplay.comboWindow",   gp.comboWindow,  200, 2000, 100),
    ]);
    _addSection(panel, "Visual theme", [
      _fieldColor("Background",    "theme.background",    th.background),
      _fieldColor("HUD accent",    "theme.hudAccent",     th.hudAccent),
      _fieldColor("Heart color 1", "theme.heartColors.0", th.heartColors[0]),
      _fieldColor("Heart color 2", "theme.heartColors.1", th.heartColors[1]),
      _fieldColor("Heart color 3", "theme.heartColors.2", th.heartColors[2]),
      _fieldColor("Heart color 4", "theme.heartColors.3", th.heartColors[3]),
      _fieldNumber("Star count",   "theme.starCount",     th.starCount, 0, 200, 10),
    ]);
  }

  // ── Field factories ───────────────────────────────────────

  function _fieldText(label, path, value) {
    const wrap  = _wrap(label);
    const input = document.createElement("input");
    input.type      = "text";
    input.value     = value;
    input.className = "cust-input";
    input.addEventListener("input", () => {
      _setPath(GAME_CONFIG, path, input.value);
      _refreshPreview();
    });
    wrap.appendChild(input);
    return wrap;
  }

  function _fieldTextarea(label, path, value, hint = "") {
    const wrap = _wrap(label, hint);
    const ta   = document.createElement("textarea");
    ta.value     = value;
    ta.rows      = 3;
    ta.className = "cust-input cust-textarea";
    ta.addEventListener("input", () => _setPath(GAME_CONFIG, path, ta.value));
    wrap.appendChild(ta);
    return wrap;
  }

  function _fieldColor(label, path, value) {
    const wrap = _wrap(label);
    const row  = document.createElement("div");
    row.className = "cust-color-row";

    // Give this picker a unique id so the <label> can point to it.
    // Clicking the colored swatch (the label) opens the OS color picker.
    const uid = "cp_" + Math.random().toString(36).slice(2, 8);

    // Colored swatch — acts as a visible clickable label
    const swatchLabel = document.createElement("label");
    swatchLabel.htmlFor   = uid;
    swatchLabel.className = "cust-swatch";
    swatchLabel.style.background = value;
    swatchLabel.title = "Click to pick color";

    // The actual native color input — visually hidden but still interactive
    const input = document.createElement("input");
    input.type      = "color";
    input.id        = uid;
    input.value     = _toSixDigitHex(value);
    input.className = "cust-color-hidden";

    // Hex readout
    const hex = document.createElement("span");
    hex.className   = "cust-hex";
    hex.textContent = input.value.toUpperCase();

    input.addEventListener("input", () => {
      const v = input.value;
      swatchLabel.style.background = v;
      hex.textContent = v.toUpperCase();
      _setPath(GAME_CONFIG, path, v);
      _refreshPreview();
    });

    row.appendChild(swatchLabel);
    row.appendChild(input);
    row.appendChild(hex);
    wrap.appendChild(row);
    return wrap;
  }

  function _fieldHairStyle(path, current, styles) {
    const wrap = _wrap("Style");
    const grid = document.createElement("div");
    grid.className = "cust-hair-grid";

    styles.forEach(style => {
      const btn = document.createElement("button");
      btn.className = "cust-hair-btn" + (style === current ? " active" : "");
      btn.textContent = style;
      btn.title = style;
      btn.addEventListener("click", () => {
        grid.querySelectorAll(".cust-hair-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        _setPath(GAME_CONFIG, path, style);
        _refreshPreview();
      });
      grid.appendChild(btn);
    });

    wrap.appendChild(grid);
    return wrap;
  }

  function _fieldNumber(label, path, value, min, max, step) {
    const wrap  = _wrap(label);
    const row   = document.createElement("div");
    row.className = "cust-color-row";
    const input = document.createElement("input");
    input.type      = "number";
    input.value     = value;
    input.min       = min;
    input.max       = max;
    input.step      = step;
    input.className = "cust-input cust-number";
    input.addEventListener("input", () => {
      _setPath(GAME_CONFIG, path, Number(input.value));
    });
    row.appendChild(input);
    wrap.appendChild(row);
    return wrap;
  }

  function _fieldRange(label, path, value, min, max, step, display) {
    const wrap  = _wrap(label);
    const row   = document.createElement("div");
    row.className = "cust-range-row";
    const input = document.createElement("input");
    input.type      = "range";
    input.value     = value;
    input.min       = min;
    input.max       = max;
    input.step      = step;
    input.className = "cust-range";
    const val       = document.createElement("span");
    val.className   = "cust-range-val";
    val.textContent = display(value);
    input.addEventListener("input", () => {
      const v = Number(input.value);
      val.textContent = display(v);
      _setPath(GAME_CONFIG, path, v);
    });
    row.appendChild(input);
    row.appendChild(val);
    wrap.appendChild(row);
    return wrap;
  }

  // ── Layout helpers ────────────────────────────────────────

  function _wrap(label, hint = "") {
    const wrap      = document.createElement("div");
    wrap.className  = "cust-field";
    const lbl       = document.createElement("label");
    lbl.className   = "cust-label";
    lbl.textContent = label;
    wrap.appendChild(lbl);
    if (hint) {
      const h       = document.createElement("span");
      h.className   = "cust-hint";
      h.textContent = hint;
      wrap.appendChild(h);
    }
    return wrap;
  }

  function _addSection(panel, title, fields) {
    const section     = document.createElement("div");
    section.className = "cust-section";
    const h           = document.createElement("div");
    h.className       = "cust-section-title";
    h.textContent     = title;
    section.appendChild(h);
    fields.forEach(f => section.appendChild(f));
    panel.appendChild(section);
  }

  // ── Live preview ──────────────────────────────────────────

  function _startPreview() {
    previewCanvas = document.getElementById("custPreviewCanvas");
    previewCtx    = previewCanvas.getContext("2d");
    previewFrame  = 0;
    _previewLoop();
  }

  function _stopPreview() {
    if (previewRaf) { cancelAnimationFrame(previewRaf); previewRaf = null; }
  }

  function _refreshPreview() { /* redraws automatically every frame */ }

  function _previewLoop() {
    const W = previewCanvas.width;
    const H = previewCanvas.height;

    previewCtx.fillStyle = GAME_CONFIG.theme.canvasBackground || "#0f0a18";
    previewCtx.fillRect(0, 0, W, H);

    const t = Date.now() * 0.001;
    for (let i = 0; i < 20; i++) {
      const sx = (i * 137 + 10) % W;
      const sy = (i * 97  + 20) % H;
      const a  = 0.3 + 0.4 * Math.sin(t + i);
      Renderer.pxRect(previewCtx, sx, sy, 3, 3, `rgba(255,255,255,${a})`);
    }

    previewCtx.fillStyle = GAME_CONFIG.theme.groundColor || "#1a0a2e";
    previewCtx.fillRect(0, H - 10, W, 10);

    const bob = Math.sin(previewFrame * 0.05) * 2;
    const cx  = W / 2;
    const cy  = H / 2 + 15 + bob;

    if (activeTab === "partner") {
      Renderer.drawPartnerCharacter(previewCtx, cx, cy, GAME_CONFIG.partnerCharacter, 1.2);
    } else if (activeTab === "gameplay") {
      Renderer.drawHugScene(previewCtx, W, H - 10, previewFrame, GAME_CONFIG);
    } else {
      Renderer.drawPlayerCharacter(previewCtx, cx, cy, GAME_CONFIG.playerCharacter, 1.2);
    }

    if (activeTab === "names" || activeTab === "player") {
      previewCtx.font      = "bold 9px 'Press Start 2P', monospace";
      previewCtx.fillStyle = "#ffd700";
      previewCtx.textAlign = "center";
      previewCtx.fillText(GAME_CONFIG.player.name || "???", cx, H - 14);
    }

    previewFrame++;
    previewRaf = requestAnimationFrame(_previewLoop);
  }

  // ── Helpers ───────────────────────────────────────────────

  /**
   * Ensure a color is a valid 6-digit hex for <input type="color">.
   * Browsers reject 3-digit shorthand or named colors as initial values.
   */
  function _toSixDigitHex(color) {
    if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
    if (/^#[0-9a-fA-F]{3}$/.test(color)) {
      const [, a, b, c] = color;
      return `#${a}${a}${b}${b}${c}${c}`;
    }
    // Resolve named / rgb() colors via a tiny canvas
    try {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 1;
      const cx = cv.getContext("2d");
      cx.fillStyle = color;
      cx.fillRect(0, 0, 1, 1);
      const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
      return "#" + [r, g, b].map(n => n.toString(16).padStart(2, "0")).join("");
    } catch {
      return "#ff0000";
    }
  }

  /**
   * Set a nested value by dot-path, e.g.
   *   "player.name"  or  "playerCharacter.hairColors.0"
   */
  function _setPath(obj, path, value) {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]];
    }
    const last = parts[parts.length - 1];
    cur[isNaN(last) ? last : Number(last)] = value;
  }

  /**
   * Deep-merge src into dst.
   * Arrays are merged element-by-element so hair-color arrays
   * (and other arrays) are correctly restored from localStorage.
   */
  function _deepMerge(dst, src) {
    for (const key of Object.keys(src)) {
      if (Array.isArray(src[key]) && Array.isArray(dst[key])) {
        src[key].forEach((item, i) => { dst[key][i] = item; });
      } else if (
        typeof src[key] === "object" && src[key] !== null &&
        typeof dst[key] === "object" && dst[key] !== null
      ) {
        _deepMerge(dst[key], src[key]);
      } else {
        dst[key] = src[key];
      }
    }
  }

  // ── Public API ────────────────────────────────────────────
  return { loadSaved, save, show };

})();
