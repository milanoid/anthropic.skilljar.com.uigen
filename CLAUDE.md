# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps + generate Prisma client + run migrations
npm run dev          # Start dev server with Turbopack at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run all tests (Vitest + jsdom)
npm run db:reset     # Reset and re-run all migrations (destructive)
```

Run a single test file:
```bash
npx vitest src/lib/__tests__/file-system.test.ts
```

After editing `prisma/schema.prisma`, run:
```bash
npx prisma migrate dev   # Create and apply new migration
npx prisma generate      # Regenerate client (into src/generated/prisma/)
```

Set `ANTHROPIC_API_KEY` in `.env` to use the real Claude API. Without it, a `MockLanguageModel` in `src/lib/provider.ts` serves static responses.

## Architecture

### Core concept: Virtual File System + Live Preview

The app lets users describe React components in a chat; Claude writes files into a **`VirtualFileSystem`** (`src/lib/file-system.ts`) — an in-memory tree, never touching disk. The preview panel (`src/components/preview/PreviewFrame.tsx`) compiles those files client-side via `@babel/standalone` and renders them in a sandboxed `<iframe>` using native ES module import maps with blob URLs.

**Transform pipeline** (`src/lib/transform/jsx-transformer.ts`):
1. Each `.jsx/.tsx/.js/.ts` file is Babel-transformed (JSX + optional TypeScript) into plain JS
2. Each transformed file becomes a `blob:` URL
3. An ES module import map is built mapping local paths + `@/` aliases → blob URLs, and third-party packages → `https://esm.sh/<pkg>`
4. Missing imports get placeholder stub modules so the preview doesn't crash
5. The iframe receives a complete HTML document (`createPreviewHTML`) with the import map and a React 19 root rendering `/App.jsx` (the required entry point)

### AI tool interface

The AI (`src/app/api/chat/route.ts`) is given two tools:
- **`str_replace_editor`** — `create`, `str_replace`, `insert` commands that write into `VirtualFileSystem`
- **`file_manager`** — `rename`, `delete` commands

The `VirtualFileSystem` instance is reconstructed on each request from the serialized `files` JSON sent by the client, then re-serialized and persisted to the DB on `onFinish`. The system prompt (`src/lib/prompts/generation.tsx`) instructs the AI to always create `/App.jsx` first and use `@/` for local imports.

### State flow

`FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) owns the client-side `VirtualFileSystem` instance and exposes `handleToolCall` — called by `ChatInterface` as AI streaming tool calls arrive, updating the FS and triggering preview re-renders via a `refreshTrigger` counter.

`ChatContext` (`src/lib/contexts/chat-context.tsx`) wraps Vercel AI SDK's `useChat`, serializing the current FS state into each `/api/chat` POST body.

### Auth & persistence

- JWT sessions via `jose`, stored in httpOnly cookies (7-day expiry). Logic in `src/lib/auth.ts`.
- Middleware (`src/middleware.ts`) guards `/api/projects` and `/api/filesystem`.
- Anonymous users work without signing in; projects are only persisted for authenticated users.
- `Project` model stores `messages` (JSON array) and `data` (serialized `VirtualFileSystem`) as strings in SQLite.
- Prisma client is generated into `src/generated/prisma/` (not the default location).

### Routing

- `/` — redirects authenticated users to their most recent project, or creates one; anonymous users get `MainContent` directly
- `/[projectId]` — loads project data and renders `MainContent` with it
- `/api/chat` — streaming POST endpoint; `maxDuration = 120s`

### Database schema

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of the data stored in the database.

### Code style

- Use comments sparingly. Only comment complex/non-obvious code.

### Key conventions

- Generated files live under `src/generated/` and should not be edited manually.
- `node-compat.cjs` is required via `NODE_OPTIONS` in all npm scripts to patch Node.js compatibility for Next.js + Turbopack.
- Tailwind v4 is used (PostCSS plugin approach, not the v3 config file).
- shadcn/ui components are in `src/components/ui/`.
- Tests use Vitest + `@testing-library/react` + jsdom; test files are colocated in `__tests__/` subdirectories.
