# DOTS Survivors Player Mod Agent

Small closed-beta web service that turns a player's weapon balance request into a version 1 `.dsmod` file. It only generates base damage and weapon cooldown overrides. The Windows game loads those files from its persistent `Mods` directory before each run.

## Run locally

Requires Node.js 20 or newer. No npm packages are needed.

1. Copy `.env.example` to `.env`.
2. Set a private `BETA_ACCESS_CODE` for the invited testers.
3. Set `LLM_API_KEY` to a key from the configured provider. The template uses DeepSeek's OpenAI-compatible API (`https://api.deepseek.com`) with `deepseek-flash`; the DeepSeek adapter disables thinking mode for this short, structured output. Change `LLM_PROVIDER`, `LLM_BASE_URL` and `LLM_MODEL` to use another provider or model.
4. Start the service from this directory with `npm start`.
5. Open `http://127.0.0.1:4173` and enter the beta code.

The player interface opens in Simplified Chinese. Use the 中文 / EN switch in the header to change language; the browser remembers the choice. Generated mod data and the selected weapon remain the same when switching languages.

The API key stays on the server. The browser sends a generation request and receives a validated, data-only package. The service keeps generation counts in memory: four requests per IP per hour and twenty total per UTC day by default. Restarting the process resets the in-memory limits. Use HTTPS and keep the invite code private for remote testers.

## Game package contract

The agent emits the schema described in the Unity project at `D:\Unity Space\Survivor\Assets\DOTSSurvivors\AI\MarkdownDocumentation\integrations\PlayerMods.md`. The game accepts `.dsmod` files only; each package is JSON with `gameId: dots-survivors`, `schemaVersion: 1`, an id, a title, and one or more weapon-level changes. Runtime bounds and supported weapon names are checked by both the service and game loader.

This is a closed-beta prototype, not a public hosted service. Configure hosting, invite distribution, privacy terms, and durable per-account quotas before opening it to all players.
