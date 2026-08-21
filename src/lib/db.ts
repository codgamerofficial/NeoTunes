import postgres from 'postgres';

const globalForDb = global as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
};

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || '';

export const sql = (() => {
  if (!databaseUrl) {
    console.warn('[NeoTunes DB] DATABASE_URL is not set. Database operations will safely mock/noop.');
    // Return a proxy that swallows queries safely
    const noopProxy = new Proxy(() => Promise.resolve([]), {
      get: () => noopProxy,
      apply: () => Promise.resolve([]),
    });
    return noopProxy as unknown as ReturnType<typeof postgres>;
  }

  try {
    return (
      globalForDb.sql ??
      postgres(databaseUrl, {
        ssl: 'require',
        max: 10,
        idle_timeout: 20,
        connect_timeout: 5,
      })
    );
  } catch (err) {
    console.error('[NeoTunes DB] Failed to connect to Postgres:', err);
    const noopProxy = new Proxy(() => Promise.resolve([]), {
      get: () => noopProxy,
      apply: () => Promise.resolve([]),
    });
    return noopProxy as unknown as ReturnType<typeof postgres>;
  }
})();

if (process.env.NODE_ENV !== 'production' && databaseUrl) {
  globalForDb.sql = sql;
}

export async function ensureDbUser(user: any) {
  if (!user || !user.id || !databaseUrl) return;

  const email = user.email || '';
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url || '';

  try {
    await sql`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES (${user.id}, ${email}, ${JSON.stringify(user.user_metadata || {})})
      ON CONFLICT (id) DO NOTHING
    `;

    await sql`
      INSERT INTO public.profiles (id, display_name, avatar_url)
      VALUES (${user.id}, ${fullName}, ${avatarUrl})
      ON CONFLICT (id) DO NOTHING
    `;

    await sql`
      INSERT INTO public.user_preferences (user_id)
      VALUES (${user.id})
      ON CONFLICT (user_id) DO NOTHING
    `;
  } catch (err) {
    console.warn('[NeoTunes DB] Non-fatal user sync warning:', err);
  }
}
