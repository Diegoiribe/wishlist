# Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run the SQL from `supabase-schema.sql`.
4. Go to Project Settings > API.
5. Copy the Project URL and anon public key.
6. Create a local `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

7. Add the same variables in Vercel:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The app falls back to `localStorage` only when these variables are missing.
