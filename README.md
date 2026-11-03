# NIBA Space Invaders for MakeCode Arcade

Reusable **Formation Manager**, **Movement Manager**, and **Invaders Settings** blocks. Supports multiple formations moving independently.

## Installation

1. Create a public GitHub repository (for example `niba-space-invaders`).
2. Upload the extension's root files (`pxt.json`, `formation.ts`, `movement.ts`, `settings.ts`, `README.md`, `LICENSE`).
3. In [MakeCode Arcade](https://arcade.makecode.com/), create/open a game, then **Extensions** and search for `github:YOUR-USERNAME/niba-space-invaders` (or paste the repository URL).
4. Remove an older `spaceInvaders` extension and duplicate `userconfig` declarations from your game before installing this one.

> The custom screen configuration is compiled into the project. It is not a runtime resize block. The default 360×320 resolution is intended for the simulator; some handheld hardware may not support it.

## Blocks

### Formation Manager (purple)
- `create formation ...` — returns a **unique numeric formation ID**; creates `SpriteKind.Enemy` sprites. `start X/Y` specifies the **center of the top-left enemy**.
- `enemies in formation ID` — get its living `Sprite[]` (reference managed internally; don't manually mutate).
- `enemies remaining in formation ID` — count living enemies.
- `formation ID defeated?` — true when known formation is empty.
- `formation ID exists?` — distinguishes a cleared ID from an empty formation.
- `set formation ID top-left enemy center X/Y` — translate the existing formation.
- `clear formation ID` / `clear all formations` — destroy and retire IDs.
- Image pattern dropdown: same image, image by row, alternating images. Enemy images stay in your game.

### Movement Manager (blue)
- `start formation ID moving speed ... drop ...` — starts/restarts one formation; moves right initially.
- `stop formation ID movement` — sets `vx=0`, stops updates for that ID.
- `set formation ID speed ...` — updates speed without changing direction.
- `set formation ID drop distance ...` — distance to descend on next wall turn.
- `set formation ID bottom limit Y ...` — optional defensive line (defaults to screen bottom).
- `formation ID reached bottom?` — latched boolean until movement is restarted.
- `formation ID is moving?` — active state.
- `forget formation ID movement settings` — advanced cleanup; use after clear or when retiring a level.

### Invaders Settings (gold)
- `screen is 360 x 320?`, `screen width`, `screen height`.
- `settings.ts` sets actual 360×320 dimensions at compile time via `userconfig`.

## Minimal example

```typescript
let imgs = [img`22222\n25552\n22222`, img`77777\n71117\n77777`]
let first = formationManager.createFormation(
    imgs, 2, 6, 36, 25, 36, 50, FormationImagePattern.ByRow
)
let second = formationManager.createFormation(
    imgs, 1, 4, 36, 25, 100, 150, FormationImagePattern.Alternating
)
spaceInvaders.startMovement(first, 20, 8)
spaceInvaders.startMovement(second, 40, 5)
spaceInvaders.setBottomLimit(second, 250)
```

See `examples/demo-main.ts` for a complete two-formation demo.

## Design / lifecycle

- Formation IDs are monotonically increasing numbers, never reused.
- Each formation has its own enemy array and movement settings.
- Only **one** `game.onUpdate` handler is registered, which processes all formations.
- Destroyed `SpriteKind.Enemy` sprites are removed from tracked formations using `sprites.onDestroyed`.
- You must call `startMovement` **after** creating that formation, and only when starting/restarting it — **not** in `game.onUpdate`.
- Before moving on to a new level, `spaceInvaders.stopMovement(id)`, `formationManager.clearFormation(id)`, then optionally `spaceInvaders.forgetMovement(id)`; afterwards create the next formation.
- Formations should be narrower than the available screen width. Separate formations can cross paths; this extension does not resolve formation-on-formation collisions.
- This implementation creates enemy sprites of built-in `SpriteKind.Enemy`. It is intended to work with your game's ordinary overlap/destroy events.

## Publish with git

```bash
git init
git add .
git commit -m "Initial NIBA Space Invaders extension"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/niba-space-invaders.git
git push -u origin main
```

Create the empty repository on GitHub first. Optionally add a `v0.1.0` release tag after simulator testing.

## Notes

This is a first implementation; test in the Arcade simulator before classroom use. Resolution changes might not work on all hardware. The test demo is not included in the extension compilation.
