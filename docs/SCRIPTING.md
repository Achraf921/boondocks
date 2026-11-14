# Writing episodes for The Woodcrest Files

Episodes are plain script files in `js/episodes/<id>.js`. Each one calls `BD.episode({...})`, which replaces the built-in mission with the same `id` (`garden`, `fight`, `theater`, `home`, `strikes`, `hate`). Board position and unlock rules carry over, so you only supply the story.

Read these before writing: `js/missions.js` (the current episodes and the enemy library), the "errands & story beats" and "mission flow" sections of `js/game.js`, and `BD.CAST` in `js/cast.js`.

## Shape of an episode

```js
(() => {
  'use strict';
  const BD = window.BD, U = BD.U, FX = BD.FX, L = BD.Lib;
  const A = () => BD.Audio;
  BD.episode({
    id: 'garden', ep: 'EPISODE 1', title: 'THE GARDEN PARTY', src: 'inspired by Season 1, Episode 1', bg: 'house',
    blurb: 'One or two sentences for the mission board.',
    loss: 'A funny line shown when Huey is knocked out.',
    *intro(w) { /* opening cutscene; runs once, already in cutscene mode */ },
    phases: [function* (w) { /* checkpoint 1 */ }, function* (w) { /* checkpoint 2 */ }],
    *outro(w) { /* closing cutscene; already in cutscene mode */ },
  });
})();
```

Scripts are generators run as coroutines: `yield 0.5` waits half a second, `yield () => cond` waits for a condition, `yield* w.something()` runs a helper.

**Phases are checkpoints.** If the player is knocked out or fails, the current phase function runs again from its first line with a healed Huey and an empty stage. So every phase must set its own stage: `w.setBg(...)`, `w.music(...)`, `w.place(x, face)`, spawn its own characters, then `yield* w.fadeIn(0.3)`. Never rely on characters spawned in an earlier phase. Use `w.def.someFlag` to avoid replaying a mid-phase cutscene on retry.

## World helpers (`w`)

Staging
- `w.setBg(name, state)`: backdrops are `hill` (1600 wide), `garden` (2800), `ink` (1900), `lobby` (3400), `theater` (1500), `house` (1700, landing platform at y=-210 from x=1180), `street` (2200, night rain), plus three arriving shortly: `block` (4200, the daytime Woodcrest street: Freeman house door near x=700, DuBois house near x=1500, bus stop near x=2300, Wuncler estate gate near x=3200, path to the hill at the far right), `lot` (2400, mall parking lot by day), `hell` (2000, fire and brimstone). Until those land, a missing name falls back to `street`, so you can use them now. State fields: `{ heat }` garden, `{ dark, flash, ghost }` house, `{ flash }` street. Call `w.relight()` after changing `w.st` fields mid-scene.
- `w.place(x, face)` puts Huey somewhere. `w.minX` / `w.maxX` bound the arena (reset by `setBg`). `w.zoom` is the free-roam camera zoom (default 1.35).
- `w.music(track, intensity)`: tracks are `title, board, garden, ink, stealth, duel, house, possessed, finale, credits`. Intensity 0..1.
- `w.fadeOut(t)`, `w.fadeIn(t)`, `w.wait(t)` (generators). `w.look(x, zoom)` locks the camera; `w.look(null)` frees it.
- `w.cine(true/false)`: cutscene mode (letterbox, no control). `intro`/`outro` are already in it. Inside a phase, wrap mid-mission cutscenes yourself.

Characters
- `w.npc(id, x, { face, pose, expr, prop, variant, idle })` returns a story character. `w.foe(id, x, { hp, ai, data, boss, title, name, speed, idle, prop, variant, armor, brk, block, expr })` returns an enemy.
- Story characters: `f.face = ±1`, `f.rig.setPose(name, 12)`, `f.rig.expr = 'shock'`, `f.gone = true` to remove. `yield* w.walk(f, x, speed, 'walk'|'run'|'patrol'|'shuffle'|'sneak')`. Huey in a cutscene: `w.player.pose('point', 12, 'deadpan')`, `w.player.face = -1`.
- Cast ids: `huey riley jazmine granddad tom tomP ruckus (variant 1 = usher uniform) stink stinkInk slick wuncler ed3 rummy bushido guest (variants 0-2) tux (0-1) guard manager (variant 1 = plain usher) crab gripe pist`. Do not invent new ids.
- Poses: see `BD.POSES` in `js/rig.js` (`stand, stance, armsCrossed, handsHips, point, pointUp, shrug, think, facepalm, cheer, cower, sit, lean, hurt, stagger, down, crouch, hold, caneLean, beltHold, aim, flashlight, overW, ...`). Expressions: `neutral, scowl, angry, shout, smirk, grin, shock, worry, deadpan, pain, closed, sly`.
- Props: `cane, blade, mallet, bottle, nunchaku, pistol, flashlight, belt, trap, umbrella, purse, mic`.

Dialogue
- `yield* w.say(castId, 'line', 'expr')`: a full dialogue box with portrait. Lines are spoken aloud by the audio engine. Keep each under about 150 characters.
- `yield* w.narr('line')`: Huey's deadpan voice-over.
- `w.bubble(f, 'short line')`: a speech bubble over a character that does not stop play. Use it for mid-fight trash talk, reactions and background jokes. Under about 70 characters.
- `w.chatter(npc, [lines], radius)`: the character mutters those lines in bubbles whenever Huey is nearby.
- `const i = yield* w.choice('huey', 'PROMPT', ['option', 'option', 'option'])`: the player picks a reply. Great for jokes: every option should be funny and get its own reaction.
- `w.toast('HINT TEXT', seconds)`: a control hint.

Things to do
- `yield* w.goTo(x, 'OBJECTIVE TEXT', { y, r })`: walk somewhere.
- `yield* w.interact(npcOrX, 'OBJECTIVE TEXT', 'TALK')`: walk up and press E.
- `yield* w.talk(npc, 'OBJECTIVE TEXT', (function* () { yield* w.say(...); })())`: interact, then a little cutscene.
- `yield* w.collect([{ x, y, name, col, on(item) }], 'OBJECTIVE TEXT')`: pick things up.
- `const ok = yield* w.timed(seconds, () => cond)`: countdown; false if time ran out.
- `const hits = yield* w.qte(['light','heavy','guard','jump','dash'], { window, gap, onHit(k, i), onMiss(k, i) })`: timed button prompts (training montages, dance-offs, belt-dodging).
- `yield* w.fail('funny reason')`: mission-failed screen, then the phase restarts.
- `const co = w.follow(npc, gap)`: npc tags along behind Huey; `co.stop()` ends it. `w.also(generator)` runs side script (banter timers, hazards).
- `w.objective('TEXT')` / `w.objective(null)` for a custom objective line.
- Stealth pieces: `w.noFight = true` disables attacks; `w.beams.push({ x, y, dir, len, hot })` draws a flashlight cone (rebuild the array every frame); `w.alert` (0..1) shows the detection meter; `w.bg.hideSpots` in the lobby; Huey hides when `w.player.state === 'crouch'`. See the lobby phase in `js/missions.js`.

Fights
- `yield* w.wave([{ id, x, hp, ai, data, prop, variant }, ...])` spawns enemies and waits until all are down.
- `yield* w.duel(bossFighter, { banner: 'DUEL!', ko: 'WHOOPED.' })` runs a boss fight with health bar and slow-motion finish. The boss needs `boss: true`.
- `BD.Lib` has the enemy brains and attacks: `E(overrides)` builds an attack; `grunt` (needs `data: { atks: [..], range }`), `shooter`, `guardAI`, `stinkAI`, `managerAI`, `rileyAI`, `tomAI`, `crabAI`, `gripeAI`, `pistAI`; attacks `PUNCH, MALLET, CORK, SHOVE, SLAM`; helpers `bark(f, 'TEXT')`, `lob`, `fireAt`, `waves`, `leap`, `near(w, dx)`, `patrol`, `CREW`. Write new brains as generators the same way when you want new behaviour. Bosses should stay beatable: telegraph everything.
- `w.shoot({...})` fires a projectile; `w.marks.push({ x, t })` warns where something will land.

## Rule: everything must pass the headless run

`node dev/headless.js <id>` plays your episode with `BD.AUTOPLAY` set: dialogue auto-advances, the helpers above auto-complete, enemies are knocked out for you. It fails on any exception or if nothing changes for 60 seconds of game time. So any wait you write by hand must be satisfiable under autoplay, for example `yield () => BD.AUTOPLAY || w.player.x > 3000`. Run it with `-v` to read the dialogue as it would play. Also run `node --check` on your file.

## The writing: this is the part that matters

The owner's verdict on the previous draft was that it missed the show's humour and that episodes felt like a cutscene bolted onto a boss fight. Fix both.

**Structure.** Each episode should play like a small chain of missions, the way an open-world game strings errands into a story: 5 to 7 phases, most of them not fights. Mix walking and talking, choices, fetch errands with a comic twist, tailing someone, a timed scramble, a button-prompt set piece, stealth, a brawl, and one boss. Every phase should advance the plot and contain jokes. Aim for 70+ spoken lines and 20+ bubbles per episode.

**Follow the episode.** Use the real plot beats of the episode it is inspired by, in order, and the characters who were actually in it. Then write new lines for those beats.

**Voices.**
- Huey: ten going on sixty. Deadpan, political, exhausted by everyone. Never jokes on purpose; the comedy is how seriously he takes everything. Narrates like a documentary about his own family.
- Riley: eight years old, thinks he is a kingpin. Calls himself Young Reezy. Confidently wrong, brand-obsessed, treats every situation like a rap video. Loves anything Huey disapproves of.
- Granddad: vain, cheap, girl-crazy, allergic to responsibility, always one sentence from reaching for the belt. Claims a heroic civil-rights past nobody can verify. Loves a bargain more than his grandchildren's safety.
- Uncle Ruckus: the joke is his absurd, total devotion to whoever is in charge and his contempt for himself and his own neighbours, which he explains with invented medical conditions and fake history. He always adds "no relation". Play it through grovelling and ridiculous claims, never through slurs.
- Tom DuBois: nervous prosecutor, terrified of jail, apologises to furniture.
- Stinkmeaner: pure recreational hatred. Creative, old-man trash talk. Enjoys nothing except other people's bad days.
- A Pimp Named Slickback: you say the whole name, every time, and he corrects anyone who doesn't. Delivers terrible advice as philosophy.
- Ed Wuncler Sr.: genial billionaire who says monstrous things politely. Ed III and Gin Rummy: armed, confident, catastrophically stupid; Rummy explains why the stupid plan is actually smart.
- Jazmine: sweet, gullible, believes everything, cries easily.

**What makes it this show.** Satire with a target: class, gentrified suburbia, celebrity worship, bad movies, consumerism, generational hypocrisy, people being proud of exactly the wrong thing. Huey states an uncomfortable truth; everyone else misses the point in their own specific way. Jokes come from character, escalate, and get called back later. Let characters interrupt, argue and talk over the action. Mild language is fine (damn, hell, ass).

**Hard limits.** No slurs of any kind, including the n-word. No real people, real brands or real film titles: invent them. Do not quote lines from the show; write new ones in the same voices. No sexual content.
