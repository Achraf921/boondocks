/* cast.js — character designs. Each entry is a build + palette + head/outfit painters. */
(() => {
  'use strict';
  const BD = window.BD, U = BD.U;
  const { skull, ear, eye, features, lobes, circ, capsule } = BD.Face;
  const { sin, cos, PI } = Math;
  const TAU = PI * 2;
  const EYE = '#f5f0e6';

  /* ------------------------------------------------------------ shared bits */
  function cap(g, R, c, ol, col, o) {
    o = o || {};
    const f = o.front === undefined ? 0.78 : o.front, hl = o.line === undefined ? -0.58 : o.line, up = o.puff || 0;
    g.fillStyle = col; g.strokeStyle = c.out; g.lineWidth = ol * 1.6;
    g.beginPath();
    g.moveTo(f * R, hl * R + 0.06 * R);
    g.bezierCurveTo((f - 0.04) * R, (-1.22 - up) * R, -0.92 * R, (-1.2 - up) * R, -0.88 * R, -0.3 * R);
    g.bezierCurveTo(-0.88 * R, 0.1 * R, -0.8 * R, 0.34 * R, -0.7 * R, 0.46 * R);
    g.lineTo(-0.64 * R, 0.1 * R);
    g.quadraticCurveTo(-0.6 * R, -0.16 * R, -0.3 * R, -0.2 * R);
    g.lineTo(-0.24 * R, hl * R + 0.2 * R);
    g.quadraticCurveTo(0.2 * R, hl * R - 0.07 * R, f * R, hl * R + 0.06 * R);
    g.closePath(); g.stroke(); g.fill();
  }
  function glasses(g, R, c, ol, col, tint, ey) {
    ey = (ey === undefined ? -0.02 : ey) * R;
    g.strokeStyle = col; g.lineWidth = ol * 1.3; g.fillStyle = tint || 'rgba(255,255,255,0.16)';
    g.beginPath(); g.roundRect(-0.12 * R, ey - 0.28 * R, 0.6 * R, 0.52 * R, 0.12 * R); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(0.55 * R, ey - 0.27 * R, 0.31 * R, 0.5 * R, 0.1 * R); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0.48 * R, ey - 0.1 * R); g.lineTo(0.55 * R, ey - 0.1 * R);
    g.moveTo(-0.12 * R, ey - 0.14 * R); g.lineTo(-0.5 * R, ey - 0.02 * R); g.stroke();
    if (!tint) {
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = ol;
      g.beginPath(); g.moveTo(0, ey + 0.14 * R); g.lineTo(0.2 * R, ey - 0.2 * R); g.stroke();
    }
  }
  function wrinkles(g, R, c, ol, j) {
    g.strokeStyle = c.skinS; g.lineWidth = ol * 0.9; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(0, 0.26 * R); g.quadraticCurveTo(0.2 * R, 0.34 * R, 0.4 * R, 0.27 * R);
    g.moveTo(0.32 * R, 0.42 * R); g.quadraticCurveTo(0.24 * R, 0.6 * R * j, 0.29 * R, 0.8 * R * j);
    g.moveTo(0.1 * R, -0.66 * R); g.quadraticCurveTo(0.42 * R, -0.74 * R, 0.72 * R, -0.62 * R);
    g.stroke(); g.lineCap = 'butt';
  }
  /** suit front: shirt V, tie, lapels. Torso space: x forward, y up negative, clipped to the torso. */
  function suitFront(g, L, ws, c, tie, bow) {
    g.fillStyle = c.shirt2;
    g.beginPath(); g.moveTo(ws * 0.05, -L - 6); g.lineTo(ws * 0.86, -L - 6); g.lineTo(ws * 0.5, -L * 0.42); g.closePath(); g.fill();
    if (bow) {
      g.fillStyle = c[tie];
      g.beginPath(); g.moveTo(ws * 0.24, -L + 1); g.lineTo(ws * 0.46, -L + 5); g.lineTo(ws * 0.24, -L + 9); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(ws * 0.68, -L + 1); g.lineTo(ws * 0.46, -L + 5); g.lineTo(ws * 0.68, -L + 9); g.closePath(); g.fill();
    } else if (tie) {
      g.fillStyle = c[tie];
      g.beginPath(); g.moveTo(ws * 0.38, -L); g.lineTo(ws * 0.56, -L); g.lineTo(ws * 0.6, -L * 0.52); g.lineTo(ws * 0.5, -L * 0.42); g.lineTo(ws * 0.4, -L * 0.52); g.closePath(); g.fill();
    }
    g.strokeStyle = c.shirtS; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(ws * 0.05, -L - 2); g.lineTo(ws * 0.5, -L * 0.42); g.lineTo(ws * 0.86, -L - 2);
    g.moveTo(ws * 0.5, -L * 0.42); g.lineTo(ws * 0.5, 14); g.stroke();
  }
  function vestFront(g, L, ws, ww, c, vest) {
    // shirt shows at the shoulders/sleeves, vest covers the body
    g.fillStyle = c[vest];
    g.beginPath(); g.moveTo(-ws - 4, -L * 0.86); g.lineTo(ws * 0.1, -L * 0.98); g.lineTo(ws * 0.46, -L * 0.5); g.lineTo(ws * 0.84, -L * 0.98); g.lineTo(ws + 12, -L * 0.8); g.lineTo(ws + 14, 20); g.lineTo(-ws - 6, 20); g.closePath(); g.fill();
    g.fillStyle = c[vest + 'S'];
    g.beginPath(); g.moveTo(-ws - 4, -L * 0.86); g.lineTo(-ws * 0.3, -L * 0.9); g.lineTo(-ww * 0.35, 20); g.lineTo(-ws - 6, 20); g.closePath(); g.fill();
    g.strokeStyle = c.out; g.lineWidth = 1; g.globalAlpha = 0.5;
    g.beginPath(); g.moveTo(ws * 0.46, -L * 0.5); g.lineTo(ws * 0.46, 20); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = '#e6c15a';
    for (let i = 0; i < 3; i++) { circ(g, ws * 0.56, -L * (0.4 - i * 0.16), 1.3); g.fill(); }
  }

  /* --------------------------------------------------------------- the kids */
  // one big round afro: a core mass plus a ring of small bumps (none hanging in front of the face)
  const AFRO_BACK = [[-0.22, -0.8, 1.34, 0.5]];
  for (let i = 0; i < 17; i++) { const a = 1.72 + (i / 16) * 4.26; AFRO_BACK.push([-0.22 + Math.cos(a) * 1.3, -0.8 + Math.sin(a) * 1.3, 0.27 + (i % 3) * 0.035, 1]); }
  const AFRO_FRONT = [[0.34, -0.98, 0.42, 0.45], [-0.12, -1.03, 0.5, 0.45], [0.72, -0.85, 0.3, 0.45], [-0.58, -0.42, 0.42, 0.45], [-0.62, -0.82, 0.5, 0.45]];
  const AFRO_SHEEN = [[-0.3, -1.5, 0.7], [0.3, -1.3, 0.6], [-0.9, -1.2, 0.6]];

  function hueyHead(g, R, c, e, rig, flat) {
    const ol = rig.ol, hx = rig.hair.x, hy = rig.hair.y;
    lobes(g, AFRO_BACK, R, hx, hy, c.out, ol);
    lobes(g, AFRO_BACK, R, hx, hy, c.hair, 0);
    skull(g, R, c, { ol });
    lobes(g, AFRO_FRONT, R, hx, hy, c.hair, 0);
    ear(g, R, c, { ol });
    if (flat) return;
    g.strokeStyle = c.hairHi; g.lineWidth = 0.1 * R; g.lineCap = 'round';
    for (const l of AFRO_SHEEN) { g.beginPath(); g.arc(l[0] * R + hx, l[1] * R + hy, l[2] * R * 0.66, -2.2, -1.0); g.stroke(); }
    g.lineCap = 'butt';
    features(g, R, c, e, { ol, brow: 0.13 });
  }

  function rileyHead(g, R, c, e, rig, flat) {
    const ol = rig.ol, sw = rig.hair.x * 0.5;
    // braid tails at the nape
    for (let i = 0; i < 4; i++) {
      const x0 = (-0.56 - i * 0.09) * R, y0 = (0.42 - i * 0.07) * R, x1 = x0 - (0.14 + i * 0.03) * R + sw, y1 = y0 + (0.5 - i * 0.03) * R;
      g.strokeStyle = c.out; g.lineWidth = 0.15 * R + ol * 2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = c.hair; g.lineWidth = 0.15 * R; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.lineCap = 'butt';
    skull(g, R, c, { ol });
    cap(g, R, c, ol, c.hair, { front: 0.8, line: -0.6 });
    ear(g, R, c, { ol });
    if (flat) return;
    // cornrows: scalp showing between the braids
    g.strokeStyle = c.skinS; g.lineWidth = 0.05 * R; g.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const fx = (0.7 - i * 0.2) * R, by = (-0.62 + i * 0.2) * R;
      g.beginPath(); g.moveTo(fx, -0.62 * R - (i > 3 ? 0.02 : 0) * R);
      g.bezierCurveTo(fx - 0.1 * R, (-1.14 + i * 0.07) * R, -0.8 * R, (-1.1 + i * 0.22) * R, -0.84 * R, by + 0.42 * R);
      g.stroke();
    }
    g.lineCap = 'butt';
    features(g, R, c, e, { ol, brow: 0.1 });
    if (rig.vars.goggles) { // airsoft safety first
      g.fillStyle = 'rgba(120,200,255,0.3)'; g.strokeStyle = '#22252b'; g.lineWidth = ol * 1.6;
      g.beginPath(); g.roundRect(-0.14 * R, -0.3 * R, 1.02 * R, 0.62 * R, 0.2 * R); g.fill(); g.stroke();
      g.strokeStyle = '#c7352e'; g.lineWidth = 0.16 * R;
      g.beginPath(); g.moveTo(-0.14 * R, -0.04 * R); g.lineTo(-0.82 * R, -0.2 * R); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = ol;
      g.beginPath(); g.moveTo(0.04 * R, 0.14 * R); g.lineTo(0.24 * R, -0.2 * R); g.stroke();
    }
  }

  const PUFF_FAR = [[0.46, -1.3, 0.62], [0.92, -1.46, 0.3], [0.18, -1.78, 0.3], [0.86, -1.02, 0.28]];
  const PUFF_NEAR = [[-0.88, -1.0, 0.74], [-1.36, -1.3, 0.36], [-0.62, -1.62, 0.36], [-1.42, -0.7, 0.34], [-1.1, -0.4, 0.3]];
  function jazmineHead(g, R, c, e, rig, flat) {
    const ol = rig.ol, hx = rig.hair.x, hy = rig.hair.y;
    lobes(g, PUFF_FAR, R, hx, hy, c.out, ol); lobes(g, PUFF_FAR, R, hx, hy, c.hairS, 0);
    skull(g, R, c, { ol });
    cap(g, R, c, ol, c.hair, { front: 0.76, line: -0.62 });
    ear(g, R, c, { ol });
    lobes(g, PUFF_NEAR, R, hx, hy, c.out, ol); lobes(g, PUFF_NEAR, R, hx, hy, c.hair, 0);
    g.fillStyle = c.shirt; circ(g, -0.5 * R + hx * 0.4, -0.76 * R, 0.13 * R); g.fill();
    if (flat) return;
    g.strokeStyle = c.hairHi; g.lineWidth = 0.09 * R; g.lineCap = 'round';
    g.beginPath(); g.arc(-0.88 * R + hx, -1.0 * R + hy, 0.5 * R, -2.3, -1.1); g.stroke(); g.lineCap = 'butt';
    features(g, R, c, e, { ol, brow: 0.07, eye: 1.06 });
    g.strokeStyle = c.out; g.lineWidth = ol; // lashes
    g.beginPath(); g.moveTo(-0.08 * R, 0); g.lineTo(-0.18 * R, -0.08 * R); g.moveTo(-0.06 * R, -0.1 * R); g.lineTo(-0.14 * R, -0.2 * R); g.stroke();
  }

  /* ------------------------------------------------------------- the adults */
  const GD_HAIR = [[-0.62, -0.24, 0.3], [-0.8, 0.1, 0.27], [-0.52, -0.46, 0.24], [-0.7, 0.36, 0.2], [-0.84, -0.14, 0.22]];
  function granddadHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    skull(g, R, c, { ol, jaw: 1.08, nose: 1.06 });
    lobes(g, GD_HAIR, R, 0, 0, c.out, ol); lobes(g, GD_HAIR, R, 0, 0, c.hair, 0);
    ear(g, R, c, { ol });
    if (flat) return;
    wrinkles(g, R, c, ol, 1.08);
    features(g, R, c, e, { ol, eye: 0.78, eyeY: -0.02, brow: 0.11, jaw: 1.08, mouthY: 0.66 });
    glasses(g, R, c, ol, c.glass);
  }

  function tomHead(g, R, c, e, rig, flat) {
    const ol = rig.ol, poss = rig.def.possessed;
    skull(g, R, c, { ol, jaw: 1.08, nose: 1.05 });
    cap(g, R, c, ol, c.hair, { front: 0.74, line: -0.66 });
    ear(g, R, c, { ol });
    if (flat) return;
    if (poss) {
      g.fillStyle = 'rgba(20,30,10,0.45)';
      g.beginPath(); g.ellipse(0.42 * R, -0.02 * R, 0.52 * R, 0.3 * R, 0, 0, TAU); g.fill();
      g.strokeStyle = '#3e5a2a'; g.lineWidth = ol * 0.8;
      g.beginPath(); g.moveTo(-0.2 * R, -0.5 * R); g.lineTo(-0.05 * R, -0.36 * R); g.lineTo(-0.16 * R, -0.24 * R); g.moveTo(0.1 * R, 0.5 * R); g.lineTo(0, 0.66 * R); g.stroke();
    }
    features(g, R, c, e, { ol, eye: 0.8, eyeY: -0.02, brow: 0.09, jaw: 1.08, mouthY: 0.66 });
  }

  const RUCK_HAIR = [[-0.74, -0.34, 0.2], [-0.82, -0.02, 0.2], [-0.66, -0.6, 0.17], [-0.76, 0.26, 0.16]];
  function ruckusHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    g.save(); g.scale(1.16, 1.06);
    // jowl
    g.fillStyle = c.skinS; g.strokeStyle = c.out; g.lineWidth = ol * 2;
    g.beginPath(); g.ellipse(0.16 * R, 0.98 * R, 0.62 * R, 0.34 * R, 0, 0, TAU); g.stroke(); g.fill();
    skull(g, R, c, { ol, jaw: 1.12, nose: 1.15 });
    lobes(g, RUCK_HAIR, R, 0, 0, c.hair, 0);
    ear(g, R, c, { ol });
    if (!flat) {
      const eN = rig._eN || (rig._eN = {}), eF = rig._eF || (rig._eF = {});
      Object.assign(eN, e, { lid: e.lid >= 0.95 ? 1 : 0.03, tilt: e.tilt * 0.3, pupil: 0.52, lookX: 0.45 });
      Object.assign(eF, e, { lid: e.lid >= 0.95 ? 1 : 0.6 });
      eye(g, 0.15 * R, -0.1 * R, 0.56 * R, 0.6 * R, eN, c, 1, ol);
      eye(g, 0.68 * R, -0.04 * R, 0.25 * R, 0.3 * R, eF, c, -1, ol);
      features(g, R, c, e, { ol, noEyes: true, eye: 0.9, eyeY: -0.12, brow: 0.08, jaw: 1.12, mouthY: 0.64, mouthW: 1.4 });
      g.strokeStyle = c.skinS; g.lineWidth = ol * 1.4; g.lineCap = 'round'; // heavy lower lip
      g.beginPath(); g.moveTo(0.26 * R, 0.86 * R); g.quadraticCurveTo(0.52 * R, 0.96 * R, 0.76 * R, 0.84 * R); g.stroke(); g.lineCap = 'butt';
    }
    g.restore();
  }

  const STINK_HAIR = [[-0.66, -0.3, 0.26], [-0.82, 0.02, 0.24], [-0.56, -0.56, 0.2], [-0.74, 0.3, 0.2], [-0.86, -0.28, 0.2]];
  function stinkHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    skull(g, R, c, { ol, jaw: 1.06, nose: 1.13 });
    lobes(g, STINK_HAIR, R, 0, 0, c.out, ol); lobes(g, STINK_HAIR, R, 0, 0, c.hair, 0);
    ear(g, R, c, { ol });
    if (!flat) {
      wrinkles(g, R, c, ol, 1.06);
      features(g, R, c, e, { ol, eye: 0.8, eyeY: -0.03, brow: 0.12, jaw: 1.06, mouthY: 0.64, mouthW: 1.3 });
      if (e.mouth === 'grin' && e.open < 0.1) { g.fillStyle = '#2a0f12'; g.fillRect(0.5 * R, 0.66 * R, 0.09 * R, 0.14 * R); } // the missing tooth
      g.fillStyle = c.hair; // chin stubble
      for (let i = 0; i < 5; i++) { circ(g, (0.2 + i * 0.1) * R, (0.98 - Math.abs(i - 2) * 0.03) * R * 1.03, 0.035 * R); g.fill(); }
    }
    if (rig.def.kasa) {
      g.fillStyle = c.hat; g.strokeStyle = c.out; g.lineWidth = ol * 2;
      g.beginPath(); g.moveTo(-1.66 * R, -0.42 * R); g.quadraticCurveTo(-0.3 * R, -1.5 * R, 0.08 * R, -1.62 * R);
      g.quadraticCurveTo(0.5 * R, -1.5 * R, 1.66 * R, -0.5 * R); g.quadraticCurveTo(0, -0.22 * R, -1.66 * R, -0.42 * R); g.closePath(); g.stroke(); g.fill();
      if (!flat) {
        g.strokeStyle = c.hatS; g.lineWidth = ol;
        g.beginPath();
        for (let i = -3; i <= 3; i++) { g.moveTo(0.08 * R, -1.6 * R); g.lineTo(i * 0.46 * R, (-0.4 + Math.abs(i) * 0.02) * R); }
        g.stroke();
        g.fillStyle = 'rgba(0,0,0,0.28)'; // brim shadow over the eyes
        g.beginPath(); g.moveTo(-0.8 * R, -0.34 * R); g.quadraticCurveTo(0, -0.24 * R, 0.9 * R, -0.36 * R); g.lineTo(0.9 * R, -0.06 * R); g.quadraticCurveTo(0, 0.08 * R, -0.8 * R, -0.04 * R); g.closePath(); g.fill();
      }
    }
  }

  const SWOOP = [[0.42, -0.98, 0.36], [0.72, -0.84, 0.24], [0.1, -1.04, 0.36]];
  function guestHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    skull(g, R, c, { ol, jaw: 1.08, nose: 1.09 });
    cap(g, R, c, ol, c.hair, { front: 0.72, line: -0.66, puff: 0.04 });
    lobes(g, SWOOP, R, 0, 0, c.hair, 0);
    ear(g, R, c, { ol });
    if (flat) return;
    g.strokeStyle = c.hairHi; g.lineWidth = 0.08 * R; g.lineCap = 'round';
    g.beginPath(); g.arc(0.3 * R, -0.96 * R, 0.3 * R, -2.4, -0.9); g.stroke(); g.lineCap = 'butt';
    features(g, R, c, e, { ol, eye: 0.74, eyeY: -0.04, brow: 0.07, jaw: 1.08, mouthY: 0.66 });
    if (rig.def.monocle) {
      g.strokeStyle = '#d9b34a'; g.lineWidth = ol * 1.2; circ(g, 0.19 * R, -0.04 * R, 0.3 * R); g.stroke();
      g.beginPath(); g.moveTo(0.19 * R, 0.26 * R); g.quadraticCurveTo(0.1 * R, 0.8 * R, 0.3 * R, 1.2 * R); g.stroke();
    }
  }

  function guardHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    g.save(); g.scale(1.06, 1.02);
    skull(g, R, c, { ol, jaw: 1.14, nose: 1.08 });
    cap(g, R, c, ol, c.hair, { front: 0.76, line: -0.74 });
    ear(g, R, c, { ol });
    if (!flat) {
      features(g, R, c, e, { ol, noEyes: true, eye: 0.8, eyeY: -0.04, brow: 0.01, jaw: 1.14, mouthY: 0.66 });
      g.fillStyle = '#101014'; g.strokeStyle = c.out; g.lineWidth = ol;
      g.beginPath(); g.moveTo(-0.14 * R, -0.3 * R); g.lineTo(0.9 * R, -0.3 * R); g.lineTo(0.86 * R, 0.08 * R); g.quadraticCurveTo(0.66 * R, 0.2 * R, 0.52 * R, 0); g.quadraticCurveTo(0.2 * R, 0.3 * R, -0.12 * R, 0.06 * R); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-0.14 * R, -0.22 * R); g.lineTo(-0.5 * R, -0.06 * R); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.moveTo(0.02 * R, -0.02 * R); g.lineTo(0.2 * R, -0.24 * R); g.stroke();
      g.strokeStyle = '#d8d2c4'; g.lineWidth = ol; // earpiece coil
      g.beginPath(); g.moveTo(-0.5 * R, 0.3 * R); g.bezierCurveTo(-0.7 * R, 0.6 * R, -0.4 * R, 0.8 * R, -0.6 * R, 1.2 * R); g.stroke();
    }
    g.restore();
  }

  function managerHead(g, R, c, e, rig, flat) {
    const ol = rig.ol, boss = !rig.variant;
    if (boss) { // headband tails
      const w = sin(rig.t * 7) * 0.12 + rig.hair.x * 0.05;
      g.strokeStyle = c.out; g.lineCap = 'round';
      for (let i = 0; i < 2; i++) {
        const y1 = (-0.2 + i * 0.34 + w) * R;
        g.strokeStyle = c.out; g.lineWidth = 0.2 * R + ol * 2; g.beginPath(); g.moveTo(-0.8 * R, -0.52 * R); g.quadraticCurveTo(-1.2 * R, -0.5 * R, -1.6 * R, y1); g.stroke();
        g.strokeStyle = c.band; g.lineWidth = 0.2 * R; g.beginPath(); g.moveTo(-0.8 * R, -0.52 * R); g.quadraticCurveTo(-1.2 * R, -0.5 * R, -1.6 * R, y1); g.stroke();
      }
      g.lineCap = 'butt';
    }
    skull(g, R, c, { ol, jaw: 1.1, nose: 1.07 });
    cap(g, R, c, ol, c.hair, { front: 0.8, line: -0.56, puff: boss ? 0.06 : 0 });
    ear(g, R, c, { ol });
    if (boss) {
      g.fillStyle = c.band; g.strokeStyle = c.out; g.lineWidth = ol * 1.4;
      g.beginPath(); g.moveTo(0.86 * R, -0.62 * R); g.quadraticCurveTo(0, -0.82 * R, -0.86 * R, -0.62 * R); g.lineTo(-0.87 * R, -0.42 * R); g.quadraticCurveTo(0, -0.6 * R, 0.89 * R, -0.42 * R); g.closePath(); g.stroke(); g.fill();
    }
    if (flat) return;
    features(g, R, c, e, { ol, eye: 0.76, eyeY: -0.02, brow: 0.09, jaw: 1.1, mouthY: 0.7 });
    if (boss) { g.strokeStyle = c.hair; g.lineWidth = 0.07 * R; g.lineCap = 'round'; g.beginPath(); g.moveTo(0.3 * R, 0.6 * R); g.quadraticCurveTo(0.56 * R, 0.52 * R, 0.8 * R, 0.6 * R); g.stroke(); g.lineCap = 'butt'; }
  }

  const CRAB_BEARD = [[0.5, 0.9, 0.3], [0.2, 1.02, 0.34], [-0.16, 0.94, 0.32], [-0.46, 0.68, 0.3], [0.74, 0.7, 0.2], [-0.62, 0.4, 0.2]];
  function crabHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    skull(g, R, c, { ol, jaw: 1.06, nose: 1.14 });
    lobes(g, CRAB_BEARD, R, 0, 0, c.out, ol); lobes(g, CRAB_BEARD, R, 0, 0, c.hair, 0);
    ear(g, R, c, { ol });
    if (!flat) {
      wrinkles(g, R, c, ol, 1.06);
      const eF = rig._eF || (rig._eF = {}); Object.assign(eF, e, { lid: e.lid >= 0.95 ? 1 : 0.66 });
      features(g, R, c, e, { ol, eye: 0.78, eyeY: -0.02, brow: 0.13, jaw: 1.06, mouthY: 0.66, eF });
    }
    // flat cap
    g.fillStyle = c.hat; g.strokeStyle = c.out; g.lineWidth = ol * 2;
    g.beginPath(); g.moveTo(-0.92 * R, -0.5 * R); g.bezierCurveTo(-0.9 * R, -1.3 * R, 0.6 * R, -1.34 * R, 0.92 * R, -0.66 * R);
    g.lineTo(1.3 * R, -0.5 * R); g.quadraticCurveTo(1.0 * R, -0.42 * R, 0.8 * R, -0.5 * R); g.quadraticCurveTo(0, -0.7 * R, -0.92 * R, -0.5 * R); g.closePath(); g.stroke(); g.fill();
  }

  const BUN = [[-0.52, -1.24, 0.44], [-0.2, -1.42, 0.2]];
  function gripeHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    lobes(g, BUN, R, rig.hair.x * 0.4, 0, c.out, ol); lobes(g, BUN, R, rig.hair.x * 0.4, 0, c.hair, 0);
    skull(g, R, c, { ol, jaw: 1.04, nose: 1.07 });
    cap(g, R, c, ol, c.hair, { front: 0.74, line: -0.6, puff: 0.03 });
    ear(g, R, c, { ol });
    if (flat) return;
    g.fillStyle = '#d9b34a'; circ(g, -0.46 * R, 0.5 * R, 0.09 * R); g.fill();
    wrinkles(g, R, c, ol, 1.04);
    g.fillStyle = 'rgba(110,60,130,0.45)'; // eyeshadow
    g.beginPath(); g.ellipse(0.19 * R, -0.2 * R, 0.24 * R, 0.12 * R, 0, 0, TAU); g.fill();
    features(g, R, c, e, { ol, eye: 0.78, eyeY: -0.02, brow: 0.05, jaw: 1.04, mouthY: 0.68, mouthW: 0.8 });
    glasses(g, R, c, ol, '#d9b34a', null, -0.0);
  }

  const STACHE = [[0.5, 0.54, 0.2], [0.74, 0.6, 0.16], [0.28, 0.6, 0.2], [0.1, 0.7, 0.14]];
  function pistHead(g, R, c, e, rig, flat) {
    const ol = rig.ol;
    g.save(); g.scale(1.1, 1.04);
    skull(g, R, c, { ol, jaw: 1.14, nose: 1.12 });
    lobes(g, [[-0.8, 0.0, 0.2], [-0.74, 0.3, 0.18]], R, 0, 0, c.hair, 0);
    ear(g, R, c, { ol });
    if (!flat) {
      wrinkles(g, R, c, ol, 1.14);
      features(g, R, c, e, { ol, eye: 0.72, eyeY: -0.04, brow: 0.16, jaw: 1.14, mouthY: 0.72 });
      lobes(g, STACHE, R, 0, 0, c.out, ol * 0.8); lobes(g, STACHE, R, 0, 0, c.hair, 0);
    }
    g.restore();
  }

  /* -------------------------------------------------------------- the cast */
  const big = (k) => (b) => ({ wShoulder: b.wShoulder * k, wWaist: b.wWaist * (k + 0.1), rThigh: b.rThigh * k, rKnee: b.rKnee * k, rShoulder: b.rShoulder * k, rElbow: b.rElbow * k, rWrist: b.rWrist * (k * 0.94), hand: b.hand * 1.1 });

  BD.CAST = {
    huey: {
      name: 'Huey', full: 'Huey Freeman', color: '#b3262d', voice: 1.18,
      build: 'kid', idle: 'stand', portraitPose: 'armsCrossed', face: { lid: 0.2, tilt: 0.36, mouth: 'frown' },
      sleeve: 'long', hem: 9, sock: 'sock',
      colors: { skin: '#9a6644', hair: '#1d1613', hairHi: '#4a3a32', shirt: '#7c2026', shirt2: '#4d1115', pants: '#303b55', shoe: '#17171b', sock: '#ece6d6', eye: EYE, iris: '#6a3d1c' },
      keep: [],
      head: hueyHead,
      outfit(g, L, ws, ww, hem, c) {
        g.strokeStyle = c.shirt2; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(ws * 0.44, -L); g.quadraticCurveTo(ws * 0.54, -L * 0.5, ws * 0.48, hem + 2); g.stroke();
        g.lineWidth = 2; g.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const y = -L * (0.76 - i * 0.26); g.beginPath(); g.moveTo(ws * 0.2, y); g.lineTo(ws * 0.74, y); g.stroke(); }
        g.lineCap = 'butt';
      },
      over(g, L, ws, ww, hem, c, r) {
        g.fillStyle = c.shirt2; g.strokeStyle = c.out; g.lineWidth = r.ol * 1.6;
        g.beginPath(); g.roundRect(-ws * 0.34, -L - 5.5, ws * 1.0, 6.5, 2.5); g.stroke(); g.fill();
      },
    },
    riley: {
      name: 'Riley', full: 'Riley Freeman', color: '#2e6fd0', voice: 1.5,
      build: 'kid', scale: 0.94, idle: 'stand', portraitPose: 'lean', face: { lid: 0.16, tilt: 0.2, mouth: 'smirk' },
      sleeve: 'short', hem: 15, baggy: 1.7, wrist: 'accent', sole: 'accent',
      dims: (b) => ({ wWaist: b.wWaist + 5, wShoulder: b.wShoulder + 2 }),
      colors: { skin: '#96633f', hair: '#17110e', shirt: '#f1ede3', gold: '#e2b93f', pants: '#3d629b', shoe: '#f5f2ea', accent: '#c7352e', eye: EYE, iris: '#6a3d1c' },
      head: rileyHead,
      outfit(g, L, ws, ww, hem, c) {
        g.strokeStyle = c.gold; g.lineWidth = 1.7;
        g.beginPath(); g.moveTo(-ws * 0.1, -L - 2); g.quadraticCurveTo(ws * 0.3, -L * 0.5, ws * 0.78, -L - 1); g.stroke();
        g.fillStyle = c.gold; g.beginPath(); g.roundRect(ws * 0.2, -L * 0.72, 5, 6, 1.2); g.fill();
      },
    },
    jazmine: {
      name: 'Jazmine', full: 'Jazmine DuBois', color: '#e77fa0', voice: 1.7,
      build: 'kid', scale: 0.93, face: { tilt: -0.3, brow: 0.2, mouth: 'smirk' },
      sleeve: 'short', hem: 4, legs: 'bare', sock: 'sock',
      colors: { skin: '#dcab86', hair: '#dc9a5c', hairHi: '#f3c489', shirt: '#e77fa0', pants: '#6189cc', shoe: '#f5f2ea', sock: '#f5f2ea', eye: EYE, iris: '#3f8a4a' },
      head: jazmineHead,
      skirt(g, J, c, r) {
        const w = r.b.wWaist * 0.5;
        g.save(); g.translate(J.hip[0], J.hip[1]); g.rotate(J.torsoAng * 0.4);
        g.fillStyle = c.pants; g.strokeStyle = c.out; g.lineWidth = r.ol * 2;
        g.beginPath(); g.moveTo(-w, -3); g.lineTo(w + 1, -3); g.lineTo(w + 9, 20); g.quadraticCurveTo(0, 25, -w - 8, 20); g.closePath(); g.stroke(); g.fill();
        g.restore();
      },
    },
    granddad: {
      name: 'Granddad', full: 'Robert Freeman', color: '#7c8a3d', voice: 0.72,
      build: 'adult', scale: 0.97, stoop: 0.05, face: { lid: 0.18, tilt: 0.22, mouth: 'frown' },
      sleeve: 'long', hem: 8, cuff: 'shirt2',
      colors: { skin: '#7d5137', hair: '#f0ece3', shirt: '#6f7d3c', shirt2: '#efe6cf', pants: '#7a654c', shoe: '#5b3a29', glass: '#1d1b20', eye: EYE, iris: '#6a3d1c' },
      head: granddadHead,
      outfit(g, L, ws, ww, hem, c) { // cardigan open over a cream shirt
        g.fillStyle = c.shirt2;
        g.beginPath(); g.moveTo(ws * 0.08, -L - 6); g.lineTo(ws * 0.86, -L - 6); g.lineTo(ws * 0.66, hem + 4); g.lineTo(ws * 0.3, hem + 4); g.closePath(); g.fill();
        g.strokeStyle = c.shirtS; g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(ws * 0.08, -L - 2); g.lineTo(ws * 0.3, hem + 4); g.moveTo(ws * 0.86, -L - 2); g.lineTo(ws * 0.66, hem + 4); g.stroke();
        g.fillStyle = c.shirt2S;
        for (let i = 0; i < 4; i++) { circ(g, ws * 0.48, -L * (0.8 - i * 0.22), 1.4); g.fill(); }
        g.fillStyle = '#3b2416'; g.fillRect(-ws - 4, hem - 3, ws * 2 + 20, 4);
      },
    },
    tom: {
      name: 'Tom', full: 'Tom DuBois', color: '#5a6478', voice: 0.95,
      build: 'adult', face: { tilt: -0.4, brow: 0.3 }, sleeve: 'long', hem: 13, cuff: 'shirt2',
      colors: { skin: '#b98a62', hair: '#1c1613', shirt: '#3d4352', shirt2: '#f2f0ea', tie: '#a3262b', pants: '#3d4352', shoe: '#191919', eye: EYE, iris: '#6a3d1c' },
      head: tomHead,
      outfit(g, L, ws, ww, hem, c) { suitFront(g, L, ws, c, 'tie'); },
    },
    tomP: {
      name: 'Tom?', full: 'Stinkmeaner-in-Tom', color: '#5fae4a', voice: 0.6,
      build: 'adult', possessed: true, idle: 'stance', expr: 'angry', face: { tilt: 0.5, lid: 0.1 }, sleeve: 'long', hem: 13, cuff: 'shirt2', stoop: 0.1,
      colors: { skin: '#9a8a66', hair: '#1c1613', shirt: '#343a44', shirt2: '#dfe3d2', tie: '#a3262b', pants: '#343a44', shoe: '#191919', eye: '#f4ffd0', iris: '#c8102e' },
      head: tomHead,
      outfit(g, L, ws, ww, hem, c) {
        suitFront(g, L, ws, c, null);
        g.fillStyle = c.tie; // tie yanked loose and flung over the shoulder
        g.beginPath(); g.moveTo(ws * 0.4, -L + 4); g.lineTo(ws * 0.58, -L + 3); g.lineTo(ws * 0.1, -L * 0.5); g.lineTo(-ws * 0.1, -L * 0.56); g.closePath(); g.fill();
      },
    },
    ruckus: {
      name: 'Uncle Ruckus', full: 'Uncle Ruckus (no relation)', color: '#c98a2b', voice: 0.62,
      build: 'adult', scale: 0.98, belly: 16, hem: 6, sleeve: 'long', sleeveCol: 'shirt2', face: { tilt: -0.1, mouth: 'grin' }, stoop: 0.04,
      dims: big(1.36),
      colors: { skin: '#4d3125', hair: '#8f8a82', shirt: '#f0ede5', shirt2: '#f0ede5', vest: '#b52b2b', tie: '#17171b', pants: '#23232b', shoe: '#161616', eye: EYE, iris: '#6a3d1c' },
      head: ruckusHead,
      outfit(g, L, ws, ww, hem, c) {
        vestFront(g, L, ws, ww, c, 'vest');
        g.fillStyle = c.tie; // bow tie
        g.beginPath(); g.moveTo(ws * 0.24, -L - 1); g.lineTo(ws * 0.46, -L + 4); g.lineTo(ws * 0.24, -L + 9); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(ws * 0.68, -L - 1); g.lineTo(ws * 0.46, -L + 4); g.lineTo(ws * 0.68, -L + 9); g.closePath(); g.fill();
        g.fillStyle = '#e6c15a'; g.fillRect(-ws * 0.1, -L * 0.72, 9, 5); // name tag
      },
    },
    stink: {
      name: 'Stinkmeaner', full: 'Col. H. Stinkmeaner', color: '#6f8f3a', voice: 0.56,
      build: 'adult', scale: 0.9, stoop: 0.16, idle: 'caneLean', prop: 'cane', face: { blind: true, lid: 0.34, tilt: 0.7, mouth: 'grin' },
      sleeve: 'long', hem: 12,
      colors: { skin: '#6b4630', hair: '#c2bdb3', shirt: '#4e5c40', shirt2: '#cdbd92', pants: '#3b342d', shoe: '#1e1915', eye: '#dfe3d6', iris: '#dfe3d6', wood: '#5a3a22' },
      head: stinkHead,
      outfit(g, L, ws, ww, hem, c) {
        g.fillStyle = c.shirt2; // turtleneck under a drab blazer
        g.beginPath(); g.moveTo(ws * 0.1, -L - 6); g.lineTo(ws * 0.86, -L - 6); g.lineTo(ws * 0.52, -L * 0.36); g.closePath(); g.fill();
        g.strokeStyle = c.shirtS; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(ws * 0.1, -L - 2); g.lineTo(ws * 0.52, -L * 0.36); g.lineTo(ws * 0.86, -L - 2); g.moveTo(ws * 0.52, -L * 0.36); g.lineTo(ws * 0.5, 16); g.stroke();
      },
    },
    stinkInk: {
      name: 'Stinkmeaner', full: 'The Blind Fury of Legend', color: '#c8102e', voice: 0.56,
      build: 'adult', scale: 0.9, stoop: 0.1, idle: 'caneLean', prop: 'blade', kasa: true, face: { blind: true, lid: 0.34, tilt: 0.7, mouth: 'grin' },
      sleeve: 'long', hem: 26, flare: 5, pelvis: 'shirt',
      dims: (b) => ({ rShoulder: b.rShoulder + 2.5, rElbow: b.rElbow + 4, rWrist: b.rWrist + 3.4 }),
      colors: { skin: '#6b4630', hair: '#c2bdb3', shirt: '#262220', sash: '#c8102e', pants: '#1c1917', shoe: '#cbb98a', hat: '#cdbb8a', eye: '#dfe3d6', iris: '#dfe3d6', wood: '#221d1a', steel: '#f6f2e8' },
      keep: ['sash'],
      head: stinkHead,
      outfit(g, L, ws, ww, hem, c) { // wrapped robe + sash
        g.strokeStyle = c.shirtS; g.lineWidth = 2;
        g.beginPath(); g.moveTo(ws * 0.86, -L - 2); g.lineTo(ws * 0.06, -L * 0.42); g.moveTo(ws * 0.04, -L - 2); g.lineTo(ws * 0.5, -L * 0.62); g.stroke();
        g.fillStyle = c.sash; g.fillRect(-ws - 8, -L * 0.26, ws * 2 + 30, 8);
      },
    },
    guest: {
      name: 'Party Guest', color: '#8fc5b2', voice: 0.9,
      build: 'adult', sleeve: 'short', hem: 5, face: { lid: 0.3, brow: 0.3 },
      colors: (v) => [
        { skin: '#eac4a8', hair: '#d8b867', hairHi: '#f2dc9c', shirt: '#8fc5b2', knot: '#f3e9c9', pants: '#cdb88d', shoe: '#7a4a2a', eye: EYE, iris: '#3a6fa0' },
        { skin: '#f0cfb5', hair: '#a3a8b0', hairHi: '#d5d9df', shirt: '#f0b3ab', knot: '#2f4a7a', pants: '#eee9dc', shoe: '#7a4a2a', eye: EYE, iris: '#3a6fa0' },
        { skin: '#dba780', hair: '#6b4a34', hairHi: '#9a7355', shirt: '#a9c3ea', knot: '#e9d37a', pants: '#b5413a', shoe: '#2b2b2b', eye: EYE, iris: '#6a4a2a' },
      ][v % 3],
      head: guestHead,
      outfit(g, L, ws, ww, hem, c) {
        g.strokeStyle = c.shirtS; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(ws * 0.46, -L); g.lineTo(ws * 0.46, -L * 0.6); g.stroke();
        g.fillStyle = '#6b4a2a'; g.fillRect(-ws - 4, hem - 3, ws * 2 + 20, 4);
      },
      over(g, L, ws, ww, hem, c, r) { // the sweater. Tied around the shoulders. Of course.
        g.strokeStyle = c.out; g.lineWidth = 7 + r.ol * 2; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-ws * 0.8, -L + 3); g.quadraticCurveTo(0, -L - 5, ws * 0.86, -L + 4); g.lineTo(ws * 0.5, -L * 0.72); g.stroke();
        g.strokeStyle = c.knot; g.lineWidth = 7;
        g.beginPath(); g.moveTo(-ws * 0.8, -L + 3); g.quadraticCurveTo(0, -L - 5, ws * 0.86, -L + 4); g.lineTo(ws * 0.5, -L * 0.72); g.stroke();
        g.strokeStyle = c.out; g.lineWidth = 6 + r.ol * 2; g.beginPath(); g.moveTo(ws * 0.5, -L * 0.72); g.lineTo(ws * 0.3, -L * 0.5); g.moveTo(ws * 0.5, -L * 0.72); g.lineTo(ws * 0.76, -L * 0.5); g.stroke();
        g.strokeStyle = c.knot; g.lineWidth = 6; g.beginPath(); g.moveTo(ws * 0.5, -L * 0.72); g.lineTo(ws * 0.3, -L * 0.5); g.moveTo(ws * 0.5, -L * 0.72); g.lineTo(ws * 0.76, -L * 0.5); g.stroke();
        g.lineCap = 'butt';
      },
    },
    tux: {
      name: 'Party Guest', color: '#2a2a30', voice: 0.82, monocle: true,
      build: 'adult', sleeve: 'long', hem: 13, cuff: 'shirt2', face: { lid: 0.34, brow: 0.36 },
      colors: (v) => [
        { skin: '#eccab0', hair: '#c9c4ba', hairHi: '#eeeae2', shirt: '#22232b', shirt2: '#f2f0ea', tie: '#16161a', pants: '#22232b', shoe: '#121214', eye: EYE, iris: '#3a6fa0' },
        { skin: '#e3b592', hair: '#3a2b22', hairHi: '#6a5244', shirt: '#eee8d8', shirt2: '#f7f5ef', tie: '#7a1f24', pants: '#22232b', shoe: '#121214', eye: EYE, iris: '#6a4a2a' },
      ][v % 2],
      head: guestHead,
      outfit(g, L, ws, ww, hem, c) { suitFront(g, L, ws, c, 'tie', true); },
    },
    guard: {
      name: 'Security', full: 'Wuncler Estate Security', color: '#3d3d46', voice: 0.6,
      build: 'adult', scale: 1.08, sleeve: 'long', hem: 13, belly: 4, idle: 'stand', face: { mouth: 'frown' },
      dims: big(1.26),
      colors: { skin: '#c9966f', hair: '#2a211b', shirt: '#1f2026', shirt2: '#f2f0ea', tie: '#1a1a1e', pants: '#1f2026', shoe: '#101012', eye: EYE, iris: '#6a3d1c' },
      head: guardHead,
      outfit(g, L, ws, ww, hem, c) { suitFront(g, L, ws, c, 'tie'); },
    },
    manager: {
      name: 'Night Manager', full: 'The Night Manager', color: '#a8262c', voice: 0.88,
      build: 'adult', scale: 0.98, sleeve: 'long', sleeveCol: 'shirt2', hem: 6, idle: 'stand', face: { tilt: 0.3, lid: 0.2 },
      dims: (b) => ({ wShoulder: b.wShoulder - 3, wWaist: b.wWaist - 3 }),
      colors: (v) => (v
        ? { skin: '#e2b592', hair: '#a8522a', shirt: '#f0ede6', shirt2: '#f0ede6', vest: '#a8262c', band: '#f2f0ea', pants: '#1f1f26', shoe: '#141416', eye: EYE, iris: '#6a4a2a' }
        : { skin: '#c08a5e', hair: '#201a17', shirt: '#f0ede6', shirt2: '#f0ede6', vest: '#a8262c', band: '#f2f0ea', pants: '#1f1f26', shoe: '#141416', eye: EYE, iris: '#6a3d1c' }),
      head: managerHead,
      outfit(g, L, ws, ww, hem, c) { vestFront(g, L, ws, ww, c, 'vest'); g.fillStyle = '#e6c15a'; g.fillRect(-ws * 0.1, -L * 0.72, 8, 4.5); },
    },
    crab: {
      name: 'Crabmiser', full: 'Lord Rufus Crabmiser', color: '#c9a23a', voice: 0.6,
      build: 'adult', scale: 0.93, belly: 8, stoop: 0.08, sleeve: 'long', hem: 18, flare: 3, prop: 'trap', idle: 'hold', face: { tilt: 0.5, lid: 0.2, mouth: 'frown' },
      dims: big(1.14),
      colors: { skin: '#6a452f', hair: '#cbc7bd', shirt: '#cfa63a', shirt2: '#8a6a1e', hat: '#3b4048', pants: '#3b4048', shoe: '#2a2a1e', eye: EYE, iris: '#6a3d1c' },
      head: crabHead,
      outfit(g, L, ws, ww, hem, c) { // fisherman's slicker with toggles
        g.strokeStyle = c.shirt2; g.lineWidth = 1.8;
        g.beginPath(); g.moveTo(ws * 0.46, -L - 4); g.lineTo(ws * 0.5, hem + 4); g.stroke();
        g.fillStyle = c.shirt2; for (let i = 0; i < 3; i++) g.fillRect(ws * 0.3, -L * (0.74 - i * 0.26), ws * 0.36, 3.2);
      },
    },
    gripe: {
      name: 'Gripenasty', full: 'Lady Esmeralda Gripenasty', color: '#7a3d8a', voice: 0.98,
      build: 'adult', scale: 0.88, sleeve: 'long', hem: 6, idle: 'stand', face: { tilt: 0.45, lid: 0.3, mouth: 'frown' },
      dims: (b) => ({ wShoulder: b.wShoulder - 6, wWaist: b.wWaist - 5, rThigh: b.rThigh - 2, rShoulder: b.rShoulder - 1.4 }),
      colors: { skin: '#7a5139', hair: '#d9d4ca', shirt: '#6a3d7a', pearl: '#f3ecdc', shawl: '#d9c9a8', pants: '#3a2a40', shoe: '#232327', eye: EYE, iris: '#6a3d1c' },
      head: gripeHead,
      outfit(g, L, ws, ww, hem, c) {
        g.strokeStyle = c.pearl; g.lineWidth = 2.6; g.setLineDash([2.6, 1.6]);
        g.beginPath(); g.moveTo(-ws * 0.1, -L - 2); g.quadraticCurveTo(ws * 0.36, -L * 0.62, ws * 0.8, -L - 1); g.stroke(); g.setLineDash([]);
      },
      skirt(g, J, c, r) {
        const w = r.b.wWaist * 0.5;
        g.save(); g.translate(J.hip[0], J.hip[1]); g.rotate(J.torsoAng * 0.4);
        g.fillStyle = c.shirt; g.strokeStyle = c.out; g.lineWidth = r.ol * 2;
        g.beginPath(); g.moveTo(-w, -4); g.lineTo(w + 1, -4); g.lineTo(w + 13, 44); g.quadraticCurveTo(0, 50, -w - 12, 44); g.closePath(); g.stroke(); g.fill();
        g.restore();
      },
    },
    pist: {
      name: 'Pistofferson', full: 'Mr. George Pistofferson', color: '#7a2a22', voice: 0.5,
      build: 'adult', scale: 1.06, belly: 14, sleeve: 'long', hem: 6, idle: 'stand', face: { tilt: 0.6, lid: 0.26, mouth: 'frown' },
      dims: big(1.4),
      colors: { skin: '#5a3a28', hair: '#d6d1c7', shirt: '#e9e3d3', brace: '#7a2a22', pants: '#4a4238', shoe: '#1b1713', eye: EYE, iris: '#6a3d1c' },
      head: pistHead,
      outfit(g, L, ws, ww, hem, c) { // suspenders + bow tie
        g.strokeStyle = c.brace; g.lineWidth = 5;
        g.beginPath(); g.moveTo(ws * 0.1, -L - 6); g.lineTo(ws * 0.2, hem + 6); g.moveTo(ws * 0.86, -L - 6); g.lineTo(ws * 0.9, hem + 6); g.stroke();
        g.fillStyle = c.brace;
        g.beginPath(); g.moveTo(ws * 0.3, -L); g.lineTo(ws * 0.5, -L + 4); g.lineTo(ws * 0.3, -L + 8); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(ws * 0.7, -L); g.lineTo(ws * 0.5, -L + 4); g.lineTo(ws * 0.7, -L + 8); g.closePath(); g.fill();
      },
    },
  };
})();
