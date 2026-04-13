# PlanetCrafter — Terraformation Index calculator

A small web app for [The Planet Crafter](https://store.steampowered.com/app/1149460/The_Planet_Crafter/) that estimates how long it takes to reach terraformation stages from your current **Terraformation Index (Ti)** and per-second generation rates (oxygen, heat, pressure, biomass).

It covers all in-game worlds (Prime, Selenea, Aqualis, Toxicity) using stage thresholds aligned with community/wiki data. Results are estimates: in-game pacing can differ from idealized continuous rates.

## Features

- **Planet selection** with full stage lists and Ti thresholds per planet  
- **Rate inputs** for oxygen, heat, pressure, and biomass (with unit hints)  
- **Optional current Ti** to plan from your present progress  
- **Timelines** showing time to the next stage and through later stages  
- **Readable durations** humanized labels and large-number Ti formatting

## Requirements

- [Node.js](https://nodejs.org/) 20+

## Getting started

```bash
git clone https://github.com/ablomer/planetcrafter.git
cd planetcrafter
npm install
npm run dev
```

Use your fork or the canonical repository URL from your host’s **Clone** button if it differs.

Then open the URL printed in the terminal (typically `http://localhost:5173`).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Vite in development mode with hot reload |
| `npm run build` | Typecheck and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format TypeScript/TSX with Prettier |
| `npm run typecheck` | Run `tsc --noEmit` without emitting files |

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- UI primitives from [shadcn/ui](https://ui.shadcn.com/) (Radix)

## Configuration

Site-specific constants (for example a profile link in the UI) live in `src/site.ts`. Adjust that file when you fork or deploy your own copy.

## Disclaimer

*The Planet Crafter* is a trademark of its respective owners. This project is an independent fan tool and is not affiliated with or endorsed by the game's developers or publishers.

## License

[MIT](LICENSE) — see the file for full text.
