# FightLens

A production-ready full-stack web app for MMA/UFC fans featuring real-time fight data, fighter analytics, event tracking, and betting odds from The Odds API.

## Features

- **Real-time Odds**: Live betting odds from major sportsbooks via The Odds API
- **Event Tracking**: Upcoming UFC events with complete fight cards
- **Fighter Profiles**: Fighter stats, records, and fight history
- **User Authentication**: Secure auth with Clerk (email/password, social login)
- **Fight Matchups**: Side-by-side fighter comparison with odds
- **Predictions (Coming Soon)**: Make fight picks and track accuracy
- **Leaderboard (Coming Soon)**: Compete with other users

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: Clerk
- **API**: The Odds API (MMA/UFC odds)

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://...neon.tech/..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/sign-up"

# The Odds API
ODDS_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Getting Started

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up the database**:

   ```bash
   bunx prisma migrate dev
   bunx prisma generate
   ```

3. **Sync fight data**:

   ```bash
   # Option 1: Use the API endpoint
   curl http://localhost:3000/api/sync/odds
   
   # Option 2: Use the script (after starting dev server)
   bun tsx scripts/sync-odds.ts
   ```

4. **Run the development server**:

   ```bash
   bun dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Database Schema

### Core Models

- **User**: Clerk-linked user accounts
- **FighterCache**: Fighter profiles with stats
- **Event**: UFC events with date/location
- **Fight**: Individual matchups with fighter references
- **OddsSnapshot**: Live odds from bookmakers
- **UserPick**: User predictions (Phase 2)
- **WatchlistItem**: Saved fighters/events (Phase 2)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home dashboard with featured fights |
| `/events` | Upcoming UFC events list |
| `/events/[id]` | Event detail with fight card |
| `/fighters` | Fighter directory |
| `/fighters/[id]` | Fighter profile with stats |
| `/fight/[id]` | Fight matchup with odds comparison |
| `/predictions` | User predictions (Phase 2) |
| `/leaderboard` | Prediction leaderboard (Phase 2) |
| `/auth/sign-in` | Sign in page |
| `/auth/sign-up` | Sign up page |

## API Integration

### The Odds API

The app syncs MMA/UFC odds from The Odds API every time the dashboard loads (in production, this should be a scheduled job). Data is cached in PostgreSQL for fast access.

**Endpoints used:**

- `GET /v4/sports/mma_mixed_martial_arts/odds` - Live odds for upcoming fights

### Sync Process

1. Fetch current odds from The Odds API
2. Create/update events in database
3. Create/update fighters in database
4. Create/update fights in database
5. Store odds snapshots from each bookmaker

## Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

### Database

- Neon PostgreSQL is recommended for serverless deployment
- Use connection pooling for production

## Development

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun lint` - Run ESLint
- `bun format` - Format with Prettier
- `bun typecheck` - TypeScript type checking
- `bun tsx scripts/sync-odds.ts` - Manual odds sync

### Prisma Commands

- `bunx prisma migrate dev` - Create migration
- `bunx prisma generate` - Generate client
- `bunx prisma studio` - Open Prisma Studio
- `bunx prisma db push` - Push schema changes

## Architecture

```
app/
  (auth)/           # Auth route group (no nav)
  (main)/           # Main app route group (with nav)
    page.tsx        # Dashboard
    events/         # Events pages
    fighters/       # Fighter pages
    fight/          # Fight matchup pages
    predictions/    # Predictions (Phase 2)
    leaderboard/    # Leaderboard (Phase 2)
  api/sync/         # API routes

components/
  ui/               # shadcn/ui components
  fightlens/        # App-specific components

lib/
  api/              # API clients
  actions/          # Server actions
  db/               # Prisma client
```

## Roadmap

### Phase 1 (Current)

- [x] Dashboard with real odds
- [x] Events and fighter pages
- [x] Fight matchup comparison
- [x] User authentication
- [x] Database schema

### Phase 2 (Upcoming)

- [ ] User predictions
- [ ] Prediction accuracy tracking
- [ ] Leaderboard
- [ ] Watchlist
- [ ] Notifications
- [ ] Friend leagues

## License

MIT
