#!/usr/bin/env node
/*
 * Headless playthrough: runs missions with BD.AUTOPLAY, no browser needed.
 *   node dev/headless.js <missionId|all> [-v]
 * Dialogue auto-advances, objectives auto-complete, enemies are knocked out for you.
 * Reports phases reached, dialogue line count and any exception or stall.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const verbose = process.argv.includes('-v');
const bufs = {};
const img = (w, h) => bufs[w + 'x' + h] || (bufs[w + 'x' + h] = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) });
function ctx() {
  const grad = { addColorStop() {} };
  return new Proxy({ globalAlpha: 1, lineWidth: 1 }, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'getImageData') return (x, y, w, h) => img(w, h);
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') return () => grad;
      if (p === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
      if (p === 'measureText') return () => ({ width: 10 });
      return () => {};
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}
const canvas = () => ({ width: 480, height: 270, style: {}, getContext() { return this._c || (this._c = ctx()); } });
const def = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
def('window', globalThis);
def('document', { createElement: canvas, getElementById: canvas, addEventListener() {}, hidden: false });
def('addEventListener', () => {});
def('navigator', { getGamepads: () => [] });
def('location', { search: '' });
def('localStorage', { getItem: () => null, setItem() {} });
def('requestAnimationFrame', () => 0);
def('innerWidth', 1280); def('innerHeight', 720);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/<script src="([^"]+)"/g)) {
  const f = path.join(root, m[1]);
  if (!fs.existsSync(f)) { console.warn('  (skipping missing ' + m[1] + ')'); continue; }
  vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: m[1] });
}
BD.pixelScale = BD.FBW / BD.W;
BD.AUTOPLAY = true;

function run(id) {
  const m = BD.MISSIONS.find((x) => x.id === id) || (BD.HUB && BD.HUB.id === id && BD.HUB);
  if (!m) { console.log('FAIL ' + id + ': no such mission'); return false; }
  const g = ctx(), dt = 1 / 30;
  let w, frames = 0, lines = 0, lastDlg = null, stuck = 0, sig0 = '', maxPhase = 0, bubbles = 0, lastB = null;
  try {
    BD.timeScale = 1; BD.hitstop = 0;
    w = new BD.World(m);
    while (!w.done && frames < 30 * 60 * 25) {
      BD.time += dt; BD.Input.press('confirm'); BD.Input.press('talk');
      if (BD.hitstop > 0) BD.hitstop -= dt;
      w.player.inv = 5; w.player.hp = w.player.max;
      if (frames % 15 === 0) for (const f of w.fighters) if (f.team === 'foe' && !f.dead) { f.inv = 0; f.armor = false; f.hp = 1; w.strike(w.player, f, { dmg: 99, kb: 300, stop: 0 }, 1); }
      w.update(dt * BD.timeScale, dt);
      if (frames % 3 === 0) w.render(g);
      if (w.dlg && w.dlg !== lastDlg) { lastDlg = w.dlg; lines++; if (verbose) console.log('    ' + (w.dlg.who || 'narr') + ': ' + w.dlg.text); }
      if (w.bubbles.length && w.bubbles[w.bubbles.length - 1] !== lastB) { lastB = w.bubbles[w.bubbles.length - 1]; bubbles++; if (verbose) console.log('    (' + lastB.f.id + ') ' + lastB.lines.join(' ')); }
      if (w.over === 'dead') throw new Error('mission failed under autoplay: ' + (w.failMsg || 'player down'));
      maxPhase = Math.max(maxPhase, w.phase);
      const sig = [w.phase, lines, bubbles, w.fighters.length, w.obj, w.cineOn, w.bgName, w.fade > 0.5, !!w.overlay, !!w.card, !!w.boss].join('|');
      if (sig === sig0) stuck++; else { stuck = 0; sig0 = sig; }
      if (stuck > 30 * 60) throw new Error('stalled for 60s of game time in phase ' + w.phase + ' (objective: ' + w.obj + ', cutscene: ' + w.cineOn + ')');
      if (m.hub && frames > 30 * 20) break;
      frames++;
    }
    if (!w.done && !m.hub) throw new Error('did not finish within 25 minutes of game time');
    console.log('OK   ' + id + ': ' + m.phases.length + ' phases, ' + lines + ' dialogue lines, ' + bubbles + ' bubbles, ' + (frames / 30 / 60).toFixed(1) + ' min of game time');
    return true;
  } catch (e) {
    console.log('FAIL ' + id + ' (phase ' + (w ? w.phase : '?') + ', frame ' + frames + '): ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n       ') : e));
    return false;
  }
}
const arg = process.argv[2] || 'all';
const ids = arg === 'all' ? BD.MISSIONS.map((m) => m.id).concat(BD.HUB ? [BD.HUB.id] : []) : [arg];
let ok = true;
for (const id of ids) ok = run(id) && ok;
process.exit(ok ? 0 : 1);
