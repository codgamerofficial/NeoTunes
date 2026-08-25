# NeoTunes Authentication & Session Management

## 1. Supabase Auth + Guest Mode Architecture

NeoTunes provides seamless authentication with dual support for authenticated users and guest listeners:

- **Authenticated Users**: Managed via Supabase Auth (`@/lib/supabase-browser` and `@/lib/supabase-server`). User profile, playlists, liked songs, and listening history persist to PostgreSQL database tables (`public.users`, `public.playlists`, `public.liked_tracks`, `public.listening_history`).
- **Guest Mode**: Unauthenticated users can stream music, search tracks, view synced lyrics, and maintain local offline downloads. Server API routes (`/api/history`, `/api/liked`, `/api/playlists`) handle unauthenticated requests gracefully with 200 OK guest responses.

---

## 2. Session Persistence

- Auth state is restored automatically upon app launch using `supabase.auth.getUser()`.
- Password and sensitive token logging is strictly forbidden.
