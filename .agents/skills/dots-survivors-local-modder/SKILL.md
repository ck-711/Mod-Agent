---
name: dots-survivors-local-modder
description: Create, validate, install, and verify local DOTS Survivors weapon balance .dsmod packages with this repository's CLI. Use when a player describes a balance mod or asks an agent to make one for this game.
---

# DOTS Survivors local modder

Turn a player's request into a version 1 `.dsmod` package for the Windows game. Read the Unity project's `D:/Unity Space/Survivor/Assets/DOTSSurvivors/AI/MarkdownDocumentation/integrations/PlayerMods.md` when changing package rules. The CLI is documented in `../../../docs/cli.md` relative to this skill.

## Workflow

1. When the Unity source is available, run `npm run catalog:check -- "D:\Unity Space\Survivor"` to detect drift against its weapon upgrade assets. Run `npm run mod -- catalog --json` to inspect names, levels, base damage and cooldown. Version 1 supports only existing weapons' base damage and cooldown; Black Hole supports cooldown only. If the request needs a new weapon, art, audio or code, explain that the current game loader cannot install it yet.
2. Translate the request into exact level values. If the player has not specified a needed value, ask for it or state the numerical assumption before building. Use `npm run mod -- create --weapon TYPE --title TITLE --set LEVEL:damage=N[,cooldown=N] [--set ...]`. The CLI writes a data-only package and validates it automatically.
3. Run `npm run mod -- validate FILE`. Show the player the changed weapon levels and values. Explain that structural validation is not proof of in-game effect.
4. Run `npm run mod -- install FILE` only when the player asked for installation. The command refuses to overwrite an existing package. If the game's data path differs from the default, get the `[Player Mods]` directory from the Unity Player log and pass `--mods-dir`.
5. After the player restarts the game, run `npm run mod -- verify FILE`. It checks the installed file and the current `Player.log` for load and patch messages. Inspect actual weapon values in game when claiming gameplay verification; the log check alone does not measure them.
6. After real-game verification, record the game build, package id, request, exact changed fields, observed values, verification method and any failure in `docs/field-notes/`. Use `docs/field-notes/TEMPLATE.md`; do not mark an untested package as verified.

Keep model and beta credentials outside generated packages and field notes. Preserve the existing web generator, which uses the same package module and weapon catalog.
