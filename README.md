# The Boondocks: The Woodcrest Files

An unofficial, non-commercial fan game. A 16-bit style brawler starring Huey Freeman, with five missions drawn from episodes of the show. Every sprite, backdrop, sound and line of dialogue is generated or written from scratch; there are no asset files.

## Play

Open `index.html` in a browser. No build step, no dependencies.

If your browser blocks local files, serve the folder instead:

```sh
python3 -m http.server 8765
# then open http://127.0.0.1:8765
```

## Controls

| Key | Action |
|---|---|
| A / D or arrows | Move |
| Space / W | Jump |
| J | Strike (three-hit combo) |
| K | Kick (hold S + K for a launcher, K in the air for a dive kick) |
| L | Guard. Tap it just before a hit lands to parry |
| Shift | Dash through attacks |
| F | Clarity, once the blue meter is full |
| S | Crouch (hide behind props in the lobby) |
| E | Talk to someone, use something, start a case at its marker |
| Tab | Open the case board from the street |
| Enter | Confirm, advance dialogue |
| Esc | Pause (spoken voices can be switched off here), or skip a cutscene |

A gamepad with a standard layout also works.

## How it plays

You start on Timid Deer Lane and can walk the block, talk to the neighbours, and start a case at its marker. Each case is an episode: a chain of errands, conversations, set pieces and fights. The case board (Tab) shows how the episodes unlock.

Dialogue is spoken with your browser's built-in speech voices, tuned per character. Nothing in the game uses audio from the show.

## Missions

1. The Garden Party (Season 1, Episode 1)
2. Granddad's Fight (Season 1, Episode 4)
3. ...Or Die Trying (Season 2, Episode 1) and Home Alone (Season 2, Episode 12), in either order
4. Stinkmeaner Strikes Back (Season 2, Episode 4), once both of the above are done
5. The Hateocracy (Season 3, Episode 13)

Add `?unlock=1` to the URL to open every mission, `?hub=1` to start on the street, `?m=home` (or `garden`, `fight`, `theater`, `strikes`, `hate`) to jump straight into one, and `?reset=1` to wipe saved progress.

## Checking the episodes without a browser

`node dev/headless.js all` plays every episode on autopilot and reports crashes or stalls. `docs/SCRIPTING.md` explains how episodes are written.
