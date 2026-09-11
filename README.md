# UKRP Website

Official UKRP community website and staff moderation portal.

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Clerk authentication and organisation roles
- Prisma 7 + PostgreSQL
- Roblox Open Cloud user restrictions
- Lucide icons

## Local setup

1. Install Node.js 20.19+.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in the required values.
4. Generate Prisma Client:

```bash
npm run db:generate
```

5. Apply the development database migrations:

```bash
npm run db:migrate
```

6. Seed the initial rules:

```bash
npm run db:seed
```

7. Start the development server:

```bash
npm run dev
```

## Production

Use the production database URL and production Clerk/Roblox credentials in your deployment environment.

Apply existing migrations with:

```bash
npm run db:deploy
```

The application expects Node.js 20.19 or newer.

## Important configuration

Public links on the homepage are controlled by:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ROBLOX_GAME_URL`
- `NEXT_PUBLIC_DISCORD_URL`

Do not commit `.env` or `.env.local` files.

## Staff roles

The current Clerk organisation roles are:

- `org:moderator`
- `org:senior_moderator`
- `org:adminsitrator`
- `org:management`

The `org:management` role is required for Rules Management.
