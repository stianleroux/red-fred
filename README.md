# 🚀 Martian Robots Simulator

A fun visualisation and simulation of the classic Martian Robots programming challenge — built with [Astro](https://astro.build), plain JavaScript, and HTML Canvas.

## 🔍 Why Astro?

I chose Astro because it's quick to get started with and simple to deploy — especially to Vercel. While I prefer working in .NET for backend-heavy projects, deployment can be trickier, and Astro was the right tool for this job.

## 🧠 Architecture

- **API Endpoint:** `/api/simulate` handles robot instruction input and mimics a backend processing the simulation.
- **Frontend:** Uses HTML Canvas + `simulate.js` to draw the grid, robot movement, and scent markers.
- **JS:** Pure Vanilla JavaScript was used intentionally to showcase simplicity and make the logic easy to follow.
- **Styling:** TailwindCSS for clean, responsive UI.

There's plenty of room for improvement, but the focus was to get a working, maintainable version out - with a clean structure and quality baseline.

Supports both:

- 📦 API-based logic via `/api/simulate`
- 🎨 Visual simulation on `<canvas>` using JavaScript

> Used internally across teams to demonstrate grid-based simulation, animation, and isolated logic processing.

---

## 📁 Project Structure

```atx
├── public/
│ └── simulate.js # Frontend simulation logic (canvas, buttons)
├── src/
│ ├── pages/
│ │ ├── index.astro # Main UI with Tailwind + canvas
│ │ └── api/
│ │ └── simulate.ts # API endpoint for server-side simulation logic
│ └── styles/
├── astro.config.mjs
└── package.json
```

## 🧠 Problem Definition

The surface of Mars is modelled as a 2D grid (max 50x50). Robots are given:

- A starting position: `x y direction`
- A movement string: `LRF` instructions
- Maximum grid of 50

Robots can fall off the grid, leaving a "scent" at their last valid position. Future robots ignore instructions that would lead them off at scented points.

---

## ⚙️ Setup Locally

```bash
git clone https://github.com/stianleroux/red-fred.git
cd red-fred
npm install
```

Run the dev server:

```bash
npm run dev
```

Open your browser at http://localhost:4321

### 🧪 API Endpoint: /api/simulate

Method: POST
URL: /api/simulate
Request Body:

```json
{
  "input": "5 3\n1 1 E\nRFRFRFRF\n..."
}
```

Response:

```json
{
  "result": "1 1 E\n3 3 N LOST\n2 3 S"  
}
```

Used when running server-side-only processing (e.g. in headless environments).

Unit Test - Vitest

```bash
npx vitest run
```

---

### 🖥️ Frontend Simulation

The logic for canvas animation, grid drawing, and button control is in:

public/simulate.js

This handles:

- Initialising the grid
- Step-by-step robot movement
- Drawing scents, directions, LOST status
- Highlighting input validation errors

Main buttons:

- Button - Action
- Initialise - Parses input, draws grid
- Start/Pause - Runs simulation live
- Step - Steps through one command
- Reset - Reloads the app completely

---

### 🚨 Input Validation

Input must follow strict format:

```html
<grid width> <grid height>
<x> <y> <DIRECTION>
<instructions>
```

#### Rules

- Max grid: 50x50
- Only L, R, F in instructions
- Errors are shown below the input box
- Faulty lines are auto-highlighted

---

## 🚀 Deploy to Vercel

Already optimised for Vercel (zero-config):

```bash
npx vercel

or

vercel --prod
```

---

### 📦 Build for Production

```bash
npm run build
```

Output goes to dist/ (SSR enabled if needed).

---

## 🤝 Contributing

### Team Usage Guidelines:

Keep input parsing and output logic isolated

Any new movement commands (e.g. JUMP) must be added to both:

- [ ] src/pages/api/simulate.ts
- [ ] public/simulate.js

Keep canvas and API logic separate — test independently

PRs welcome via GitHub Issues.

---

## 📄 License

MIT (c) Stian le Roux