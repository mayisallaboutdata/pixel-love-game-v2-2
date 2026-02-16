/**
 * renderer.js
 * ─────────────────────────────────────────────────────────────
 * Pixel-art drawing primitives and character renderers.
 *
 * Hair is drawn by named style functions so styles can be swapped
 * without touching the main character draw calls.
 * Each style has a back() layer (drawn behind the head) and a
 * front() layer (bangs / detail, drawn over face edges).
 * ─────────────────────────────────────────────────────────────
 */

"use strict";

const Renderer = (() => {

  const BASE_PIXEL = 3;

  // ── Primitives ───────────────────────────────────────────

  function pxRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  // ── Hearts ───────────────────────────────────────────────

  const HEART_GRID = [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
  ];

  function drawHeart(ctx, cx, cy, size, color, outline = "#8b0030") {
    const px = size;
    const sx = cx - (HEART_GRID[0].length / 2) * px;
    const sy = cy - (HEART_GRID.length  / 2)   * px;
    for (let r = 0; r < HEART_GRID.length; r++)
      for (let c = 0; c < HEART_GRID[r].length; c++)
        if (HEART_GRID[r][c])
          pxRect(ctx, sx+c*px-1, sy+r*px-1, px+2, px+2, outline);
    for (let r = 0; r < HEART_GRID.length; r++)
      for (let c = 0; c < HEART_GRID[r].length; c++)
        if (HEART_GRID[r][c])
          pxRect(ctx, sx+c*px, sy+r*px, px, px, color);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        if (HEART_GRID[r]?.[c])
          pxRect(ctx, sx+c*px, sy+r*px, px, px, "rgba(255,255,255,0.2)");
  }

  function drawBrokenHeart(ctx, cx, cy, size) {
    const px = size;
    const L = [[0,1,1,0],[1,1,1,1],[1,1,1,1],[1,1,1,0],[0,1,1,0],[0,0,1,0],[0,0,0,0]];
    const R = [[0,1,1,0],[1,1,1,1],[1,1,1,1],[0,1,1,1],[0,1,1,0],[0,1,0,0],[0,0,0,0]];
    const sx = cx-4*px, sy = cy-3.5*px;
    L.forEach((row,r) => row.forEach((v,c) => { if(v) pxRect(ctx,sx+c*px-2,sy+r*px,px,px,"#555"); }));
    R.forEach((row,r) => row.forEach((v,c) => { if(v) pxRect(ctx,sx+(c+4)*px+2,sy+r*px,px,px,"#555"); }));
  }

  // ════════════════════════════════════════════════════════════
  //  HAIR STYLE LIBRARY
  //  Each style: { back(ctx,ox,oy,p,dark,main,highlight),
  //                front(ctx,ox,oy,p,dark,main,highlight) }
  // ════════════════════════════════════════════════════════════

  const PLAYER_HAIR = {

    long: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-11*p, 10*p, 3*p, d);
        pxRect(ctx, ox-6*p, oy- 9*p, 12*p, 6*p, d);
        pxRect(ctx, ox-6*p, oy- 3*p,  3*p, 8*p, d);
        pxRect(ctx, ox+3*p, oy- 3*p,  3*p, 8*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-10*p, 10*p, 3*p, m);
        pxRect(ctx, ox-5*p, oy- 8*p,  2*p, 2*p, m);
        pxRect(ctx, ox+3*p, oy- 8*p,  2*p, 2*p, m);
        pxRect(ctx, ox-3*p, oy-11*p,  4*p,   p, h);
      },
    },

    short: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-11*p, 10*p, 3*p, d);
        pxRect(ctx, ox-6*p, oy- 9*p, 12*p, 5*p, d);
        pxRect(ctx, ox-6*p, oy- 4*p,  3*p, 3*p, d);
        pxRect(ctx, ox+3*p, oy- 4*p,  3*p, 3*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-10*p, 10*p, 3*p, m);
        pxRect(ctx, ox-5*p, oy- 8*p,  2*p,   p, m);
        pxRect(ctx, ox+3*p, oy- 8*p,  2*p,   p, m);
        pxRect(ctx, ox-2*p, oy-11*p,  3*p,   p, h);
      },
    },

    ponytail: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-11*p, 10*p, 3*p, d);
        pxRect(ctx, ox-5*p, oy- 9*p, 10*p, 3*p, d);
        pxRect(ctx, ox+2*p, oy-12*p,  2*p, 4*p, d);
        pxRect(ctx, ox+4*p, oy-14*p,  2*p, 3*p, d);
        pxRect(ctx, ox+5*p, oy-12*p,  2*p, 5*p, d);
        pxRect(ctx, ox+4*p, oy- 7*p,  2*p, 2*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-10*p, 10*p, 2*p, m);
        pxRect(ctx, ox-4*p, oy- 8*p,  2*p,   p, m);
        pxRect(ctx, ox+2*p, oy- 8*p,  2*p,   p, m);
        pxRect(ctx, ox+2*p, oy-12*p,  2*p,   p, "#ffd700"); // tie
        pxRect(ctx, ox-2*p, oy-11*p,  3*p,   p, h);
      },
    },

    bun: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-11*p, 10*p, 3*p, d);
        pxRect(ctx, ox-5*p, oy- 9*p, 10*p, 3*p, d);
        pxRect(ctx, ox-5*p, oy- 6*p,  2*p, 2*p, d);
        pxRect(ctx, ox+3*p, oy- 6*p,  2*p, 2*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-2*p, oy-14*p,  4*p, 4*p, m); // bun
        pxRect(ctx, ox-3*p, oy-13*p,  6*p, 2*p, m);
        pxRect(ctx, ox-1*p, oy-15*p,  2*p, 2*p, m);
        pxRect(ctx, ox-1*p, oy-14*p,  2*p,   p, h);
        pxRect(ctx, ox-5*p, oy-10*p,  5*p, 2*p, m); // bangs
        pxRect(ctx, ox+1*p, oy-10*p,  4*p, 2*p, m);
        pxRect(ctx, ox-3*p, oy-11*p,  3*p,   p, h);
        pxRect(ctx, ox,     oy-12*p,  2*p,   p, "#ff4a6e"); // pin
      },
    },

    curly: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-6*p, oy-11*p, 12*p, 3*p, d);
        pxRect(ctx, ox-7*p, oy- 9*p, 14*p, 6*p, d);
        pxRect(ctx, ox-7*p, oy- 3*p,  3*p, 6*p, d);
        pxRect(ctx, ox+4*p, oy- 3*p,  3*p, 6*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-6*p, oy-10*p, 12*p, 3*p, m);
        pxRect(ctx, ox-6*p, oy- 8*p,  2*p, 2*p, m);
        pxRect(ctx, ox-3*p, oy- 9*p,  2*p, 2*p, m);
        pxRect(ctx, ox,     oy- 9*p,  2*p, 2*p, m);
        pxRect(ctx, ox+3*p, oy- 9*p,  2*p, 2*p, m);
        pxRect(ctx, ox+4*p, oy- 8*p,  2*p, 2*p, m);
        pxRect(ctx, ox-4*p, oy-11*p,  4*p,   p, h);
        pxRect(ctx, ox+1*p, oy-11*p,  3*p,   p, h);
      },
    },

    pigtails: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-11*p, 10*p, 3*p, d);
        pxRect(ctx, ox-5*p, oy- 9*p, 10*p, 4*p, d);
        pxRect(ctx, ox-8*p, oy- 7*p,  3*p, 8*p, d);
        pxRect(ctx, ox-7*p, oy+ 1*p,  2*p, 2*p, d);
        pxRect(ctx, ox+5*p, oy- 7*p,  3*p, 8*p, d);
        pxRect(ctx, ox+5*p, oy+ 1*p,  2*p, 2*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-10*p, 10*p, 2*p, m);
        pxRect(ctx, ox-4*p, oy- 8*p,  2*p,   p, m);
        pxRect(ctx, ox+2*p, oy- 8*p,  2*p,   p, m);
        pxRect(ctx, ox-7*p, oy- 7*p,  2*p,   p, "#ffd700"); // ties
        pxRect(ctx, ox+5*p, oy- 7*p,  2*p,   p, "#ffd700");
        pxRect(ctx, ox-2*p, oy-11*p,  3*p,   p, h);
      },
    },

  };

  const PARTNER_HAIR = {

    long: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-12*p, 10*p, 3*p, d);
        pxRect(ctx, ox-6*p, oy-10*p, 12*p, 5*p, d);
        pxRect(ctx, ox-6*p, oy- 5*p,  3*p, 6*p, d);
        pxRect(ctx, ox+3*p, oy- 5*p,  3*p, 6*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-11*p, 10*p, 3*p, m);
        pxRect(ctx, ox-5*p, oy- 9*p,  3*p, 2*p, m);
        pxRect(ctx, ox+2*p, oy- 9*p,  3*p,   p, m);
        pxRect(ctx, ox-3*p, oy- 9*p,  2*p,   p, m);
        pxRect(ctx, ox-2*p, oy-12*p,  3*p,   p, h);
        pxRect(ctx, ox+1*p, oy-11*p,  2*p,   p, h);
      },
    },

    short: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-12*p, 10*p, 3*p, d);
        pxRect(ctx, ox-5*p, oy-10*p, 10*p, 3*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-11*p, 10*p, 3*p, m);
        pxRect(ctx, ox-4*p, oy- 9*p,  5*p,   p, m);
        pxRect(ctx, ox+1*p, oy- 9*p,  3*p,   p, m);
        pxRect(ctx, ox-3*p, oy-12*p,  5*p,   p, h);
      },
    },

    buzz: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-12*p, 10*p, 2*p, d);
        pxRect(ctx, ox-5*p, oy-11*p,  2*p,   p, d);
        pxRect(ctx, ox+3*p, oy-11*p,  2*p,   p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-4*p, oy-12*p,  8*p, 2*p, m);
        pxRect(ctx, ox-4*p, oy-11*p,  2*p,   p, m);
        pxRect(ctx, ox+2*p, oy-11*p,  2*p,   p, m);
        pxRect(ctx, ox-3*p, oy-12*p,  2*p,   p, h);
        pxRect(ctx, ox+1*p, oy-12*p,  2*p,   p, h);
      },
    },

    curly: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-6*p, oy-12*p, 12*p, 3*p, d);
        pxRect(ctx, ox-7*p, oy-10*p, 14*p, 5*p, d);
        pxRect(ctx, ox-6*p, oy- 5*p,  3*p, 4*p, d);
        pxRect(ctx, ox+3*p, oy- 5*p,  3*p, 4*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-6*p, oy-11*p, 12*p, 3*p, m);
        pxRect(ctx, ox-6*p, oy- 9*p,  2*p, 2*p, m);
        pxRect(ctx, ox-3*p, oy-10*p,  2*p, 2*p, m);
        pxRect(ctx, ox,     oy-10*p,  2*p, 2*p, m);
        pxRect(ctx, ox+3*p, oy-10*p,  2*p, 2*p, m);
        pxRect(ctx, ox+4*p, oy- 9*p,  2*p, 2*p, m);
        pxRect(ctx, ox-4*p, oy-12*p,  4*p,   p, h);
        pxRect(ctx, ox+1*p, oy-12*p,  3*p,   p, h);
      },
    },

    bald: {
      back(ctx, ox, oy, p, d, m, h) {},
      front(ctx, ox, oy, p, d, m, h) {},
    },

    undercut: {
      back(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-5*p, oy-12*p, 10*p, 2*p, d);
        pxRect(ctx, ox-5*p, oy-11*p,  2*p, 3*p, d);
        pxRect(ctx, ox+3*p, oy-11*p,  2*p, 3*p, d);
      },
      front(ctx, ox, oy, p, d, m, h) {
        pxRect(ctx, ox-4*p, oy-13*p,  8*p, 3*p, m);
        pxRect(ctx, ox-3*p, oy-11*p,  6*p, 2*p, m);
        pxRect(ctx, ox+2*p, oy-10*p,  3*p,   p, m);
        pxRect(ctx, ox-4*p, oy-13*p,  4*p,   p, h);
        pxRect(ctx, ox-5*p, oy-10*p,  2*p,   p, d); // razor line
        pxRect(ctx, ox+3*p, oy-10*p,  2*p,   p, d);
      },
    },

  };

  function _getHairStyle(library, style) {
    return library[style] || library.short;
  }

  // ════════════════════════════════════════════════════════════
  //  CHARACTER DRAW FUNCTIONS
  // ════════════════════════════════════════════════════════════

  function drawPlayerCharacter(ctx, cx, cy, cfg, scale = 1) {
    const p = Math.floor(BASE_PIXEL * scale);
    const [d, m, h] = cfg.hairColors;
    const ox   = Math.floor(cx);
    const oy   = Math.floor(cy);
    const hair = _getHairStyle(PLAYER_HAIR, cfg.hairStyle);

    hair.back(ctx, ox, oy, p, d, m, h);
    pxRect(ctx, ox-4*p, oy-8*p, 8*p, 7*p, cfg.skinColor);
    hair.front(ctx, ox, oy, p, d, m, h);

    // Eyes
    pxRect(ctx, ox-3*p, oy-5*p, 2*p, 2*p, "#2c1810");
    pxRect(ctx, ox+1*p, oy-5*p, 2*p, 2*p, "#2c1810");
    pxRect(ctx, ox-3*p, oy-5*p,   p,   p, "#fff");
    pxRect(ctx, ox+1*p, oy-5*p,   p,   p, "#fff");
    // Blush
    pxRect(ctx, ox-4*p, oy-3*p, 2*p, p, "#ff8888");
    pxRect(ctx, ox+2*p, oy-3*p, 2*p, p, "#ff8888");
    // Smile
    pxRect(ctx, ox-1*p, oy-2*p, 2*p, p, "#d4756b");

    // Dress
    pxRect(ctx, ox-3*p, oy-1*p,  6*p,   p, cfg.outfitColor);
    pxRect(ctx, ox-4*p, oy,       8*p, 5*p, cfg.outfitColor);
    pxRect(ctx, ox-5*p, oy+3*p, 10*p, 2*p, cfg.outfitColor);
    pxRect(ctx, ox-2*p, oy,       4*p,   p, cfg.outfitHighlight);
    pxRect(ctx, ox-4*p, oy+1*p,  8*p,   p, cfg.accentColor);

    // Arms
    for (let i = 1; i <= 3; i++) {
      pxRect(ctx, ox-(5+i)*p,   oy-i*p, 2*p, p, cfg.skinColor);
      pxRect(ctx, ox+(4+i-1)*p, oy-i*p, 2*p, p, cfg.skinColor);
    }

    // Legs & shoes
    pxRect(ctx, ox-3*p, oy+5*p, 2*p, 2*p, cfg.skinColor);
    pxRect(ctx, ox+1*p, oy+5*p, 2*p, 2*p, cfg.skinColor);
    pxRect(ctx, ox-3*p, oy+7*p, 2*p,   p, cfg.shoeColor);
    pxRect(ctx, ox+1*p, oy+7*p, 2*p,   p, cfg.shoeColor);
  }

  function drawPartnerCharacter(ctx, cx, cy, cfg, scale = 1) {
    const p = Math.floor(BASE_PIXEL * scale);
    const [d, m, h] = cfg.hairColors;
    const ox   = Math.floor(cx);
    const oy   = Math.floor(cy);
    const hair = _getHairStyle(PARTNER_HAIR, cfg.hairStyle);

    hair.back(ctx, ox, oy, p, d, m, h);
    pxRect(ctx, ox-4*p, oy-9*p, 8*p, 8*p, cfg.skinColor);
    pxRect(ctx, ox-3*p, oy-1*p, 6*p,   p, cfg.skinColor);
    hair.front(ctx, ox, oy, p, d, m, h);

    // Eyes & brows
    pxRect(ctx, ox-3*p, oy-6*p, 2*p, p, "#2c1810");
    pxRect(ctx, ox+1*p, oy-6*p, 2*p, p, "#2c1810");
    pxRect(ctx, ox-3*p, oy-7*p, 3*p, p, d);
    pxRect(ctx, ox+1*p, oy-7*p, 3*p, p, d);
    pxRect(ctx, ox-3*p, oy-6*p,   p, p, "#fff");
    pxRect(ctx, ox+1*p, oy-6*p,   p, p, "#fff");
    pxRect(ctx, ox,     oy-4*p,   p, p, "#e5b791"); // nose
    pxRect(ctx, ox-1*p, oy-2*p, 3*p, p, "#c4756b"); // smile

    // Jacket
    pxRect(ctx, ox-4*p, oy,     8*p, 6*p, cfg.outfitColor);
    pxRect(ctx, ox-3*p, oy,     6*p,   p, cfg.outfitHighlight);
    pxRect(ctx, ox-1*p, oy,     2*p, 3*p, cfg.shirtColor);

    // Arms & hands
    pxRect(ctx, ox-6*p, oy, 2*p, 5*p, cfg.outfitColor);
    pxRect(ctx, ox+4*p, oy, 2*p, 5*p, cfg.outfitColor);
    pxRect(ctx, ox-6*p, oy+5*p, 2*p, p, cfg.skinColor);
    pxRect(ctx, ox+4*p, oy+5*p, 2*p, p, cfg.skinColor);

    // Legs & shoes
    pxRect(ctx, ox-3*p, oy+6*p, 2*p, 3*p, cfg.trouserColor);
    pxRect(ctx, ox+1*p, oy+6*p, 2*p, 3*p, cfg.trouserColor);
    pxRect(ctx, ox-3*p, oy+9*p, 2*p,   p, cfg.shoeColor);
    pxRect(ctx, ox+1*p, oy+9*p, 2*p,   p, cfg.shoeColor);
  }

  function drawHugScene(ctx, W, H, frame, config) {
    const p   = Math.floor(BASE_PIXEL * 1.8);
    const cx  = W / 2;
    const cy  = H / 2 + 20;
    const bob = Math.sin(frame * 0.05) * 2;
    const pc  = config.playerCharacter;
    const mc  = config.partnerCharacter;

    // Partner (left)
    const mx = cx - 18, my = cy + bob;
    const [mhd,mhm,mhh] = mc.hairColors;
    const mhair = _getHairStyle(PARTNER_HAIR, mc.hairStyle);

    mhair.back(ctx, mx, my, p, mhd, mhm, mhh);
    pxRect(ctx, mx-4*p, my-9*p, 8*p, 8*p, mc.skinColor);
    pxRect(ctx, mx-3*p, my-1*p, 6*p,   p, mc.skinColor);
    mhair.front(ctx, mx, my, p, mhd, mhm, mhh);
    pxRect(ctx, mx-3*p, my-5*p, 2*p, p, "#2c1810");
    pxRect(ctx, mx+1*p, my-5*p, 2*p, p, "#2c1810");
    pxRect(ctx, mx-3*p, my-7*p, 3*p, p, mhd);
    pxRect(ctx, mx+1*p, my-7*p, 3*p, p, mhd);
    pxRect(ctx, mx-2*p, my-2*p, 4*p, p, "#c4756b");
    pxRect(ctx, mx-1*p, my-1*p, 2*p, p, "#c4756b");
    pxRect(ctx, mx-4*p, my,     8*p, 6*p, mc.outfitColor);
    pxRect(ctx, mx-1*p, my,     2*p, 3*p, mc.shirtColor);
    pxRect(ctx, mx+4*p, my,     2*p, 5*p, mc.outfitColor);
    pxRect(ctx, mx+4*p, my+5*p, 2*p,   p, mc.skinColor);
    pxRect(ctx, mx-3*p, my+6*p, 2*p, 3*p, mc.trouserColor);
    pxRect(ctx, mx+1*p, my+6*p, 2*p, 3*p, mc.trouserColor);
    pxRect(ctx, mx-3*p, my+9*p, 2*p,   p, mc.shoeColor);
    pxRect(ctx, mx+1*p, my+9*p, 2*p,   p, mc.shoeColor);

    // Player (right)
    const ax = cx + 18, ay = cy + bob;
    const [phd,phm,phh] = pc.hairColors;
    const phair = _getHairStyle(PLAYER_HAIR, pc.hairStyle);

    phair.back(ctx, ax, ay, p, phd, phm, phh);
    pxRect(ctx, ax-4*p, ay-8*p, 8*p, 7*p, pc.skinColor);
    phair.front(ctx, ax, ay, p, phd, phm, phh);
    pxRect(ctx, ax-3*p, ay-5*p, 2*p, p, "#2c1810");
    pxRect(ctx, ax+1*p, ay-5*p, 2*p, p, "#2c1810");
    pxRect(ctx, ax-4*p, ay-3*p, 2*p, p, "#ff8888");
    pxRect(ctx, ax+2*p, ay-3*p, 2*p, p, "#ff8888");
    pxRect(ctx, ax-1*p, ay-2*p, 3*p, p, "#d4756b");
    pxRect(ctx, ax,     ay-1*p,   p, p, "#d4756b");
    pxRect(ctx, ax-3*p, ay-1*p,  6*p,   p, pc.outfitColor);
    pxRect(ctx, ax-4*p, ay,       8*p, 5*p, pc.outfitColor);
    pxRect(ctx, ax-5*p, ay+3*p, 10*p, 2*p, pc.outfitColor);
    pxRect(ctx, ax-2*p, ay,       4*p,   p, pc.outfitHighlight);
    pxRect(ctx, ax-4*p, ay+1*p,  8*p,   p, pc.accentColor);
    pxRect(ctx, ax-6*p, ay,       2*p, 5*p, pc.skinColor);
    pxRect(ctx, ax-3*p, ay+5*p,  2*p, 2*p, pc.skinColor);
    pxRect(ctx, ax+1*p, ay+5*p,  2*p, 2*p, pc.skinColor);
    pxRect(ctx, ax-3*p, ay+7*p,  2*p,   p, pc.shoeColor);
    pxRect(ctx, ax+1*p, ay+7*p,  2*p,   p, pc.shoeColor);
    pxRect(ctx, ax-4*p, ay+1*p,  2*p, 3*p, mc.outfitColor);
    pxRect(ctx, ax-4*p, ay+4*p,  2*p,   p, mc.skinColor);

    const hy = cy - 70 + Math.sin(frame * 0.08) * 8;
    drawHeart(ctx, cx, hy, Math.floor(BASE_PIXEL * 1.5), "#ff4a6e", "#8b0030");
  }

  // ── Stars ────────────────────────────────────────────────

  function buildStars(count) {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 2000, y: Math.random() * 2000,
      blink: Math.random() * Math.PI * 2,
    }));
  }

  function drawStars(ctx, W, H, stars, t) {
    stars.forEach(s => {
      const a = 0.3 + 0.5 * Math.sin(t + s.blink);
      pxRect(ctx, s.x % W, s.y % H, BASE_PIXEL, BASE_PIXEL, `rgba(255,255,255,${a})`);
    });
  }

  // ── Public hairstyle name lists (consumed by customizer UI) ─

  const PLAYER_HAIR_STYLES  = Object.keys(PLAYER_HAIR);
  const PARTNER_HAIR_STYLES = Object.keys(PARTNER_HAIR);

  return {
    pxRect,
    drawHeart,
    drawBrokenHeart,
    drawPlayerCharacter,
    drawPartnerCharacter,
    drawHugScene,
    buildStars,
    drawStars,
    BASE_PIXEL,
    PLAYER_HAIR_STYLES,
    PARTNER_HAIR_STYLES,
  };

})();
