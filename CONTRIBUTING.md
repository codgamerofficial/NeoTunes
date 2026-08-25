# Contributing to NeoTunes

Thank you for your interest in contributing to NeoTunes!

## Development Guidelines

1. **Branching Strategy**: Use feature branches named `feature/description` or `fix/description`.
2. **Type Safety**: All TypeScript code must pass `npx tsc --noEmit` with **0 errors**.
3. **Architecture Rules**:
   - Never replace or duplicate the single global `AudioEngine` source of truth.
   - All tracks must use the canonical `Track` model (`id`, `source`, `sourceId`).
   - Deep links must be validated before playing.
4. **Pull Requests**: Submit PRs against the `main` branch with clear summaries and manual test evidence.
