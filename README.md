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
| Enter | Confirm, advance dialogue |
| Esc | Pause, or skip a cutscene |

A gamepad with a standard layout also works.

## Missions

1. The Garden Party (Season 1, Episode 1)
2. Granddad's Fight (Season 1, Episode 4)
3. ...Or Die Trying (Season 2, Episode 1) and Home Alone (Season 2, Episode 12), in either order
4. Stinkmeaner Strikes Back (Season 2, Episode 4), once both of the above are done
5. The Hateocracy (Season 3, Episode 13)

Add `?unlock=1` to the URL to open every mission, `?m=home` (or `garden`, `fight`, `theater`, `strikes`, `hate`) to jump straight into one, and `?reset=1` to wipe saved progress.
