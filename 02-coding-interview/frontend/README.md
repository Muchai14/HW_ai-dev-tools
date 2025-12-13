# Coding Interview Platform

A real-time collaborative coding interview platform built with React, Vite, and TypeScript.

## Features

- **Create/Join Rooms**: Generate unique room links for interviews
- **Shared Code Editor**: Monaco-based editor with real-time collaboration (multi-tab sync)
- **Syntax Highlighting**: JavaScript and Python support
- **Python Execution**: Run Python code in-browser using Pyodide (WASM)
- **Console Panel**: View output and errors from code execution
- **Participants List**: See who's in the room

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development
```bash
# Start the development server
npm run dev
```
The app runs at `http://localhost:5173`

### Testing
```bash
# Run integration tests
npm test

# Run tests in watch mode
npm run test:watch
```

You can also run Vitest directly with `npx` or target a single file:

```bash
# Run Vitest directly
npx vitest run

# Run a single test file
npx vitest run src/tests/api.test.ts

# Run tests matching a name/pattern
npx vitest -t "Room Creation"
```

### Build
```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Code Editor**: Monaco Editor
- **Python Runtime**: Pyodide (WebAssembly)
- **Testing**: Vitest, Testing Library
- **State Sync**: BroadcastChannel API (multi-tab)

## Architecture

This is a **frontend-only** application with a mocked API layer (`src/services/api.ts`). The mock uses `localStorage` for persistence and `BroadcastChannel` for real-time sync across browser tabs.

To test collaboration:
1. Create a room
2. Open the same room URL in multiple browser tabs
3. Edit code in one tab - changes appear in all tabs

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks (usePyodide)
├── pages/          # Route pages (Index, Room)
├── services/       # Mock API layer
├── tests/          # Integration tests
└── lib/            # Utilities
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

## License

MIT
