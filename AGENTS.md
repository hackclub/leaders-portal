# Club Leaders Portal Development Guide

## About
Club Leaders Portal is a portal for Hack Club leaders to manage their clubs. A few features include:
- View and track club events (loaded from Airtable)
- Mark events as completed
- View club info (members, ships, level, invite codes)
- Manage club members (view, remove)
- Send announcements to club members
- Admin portal with analytics

## Commands
- `npm run dev` - Run development server
- `npm run build` - Build for production (produces large output)
- `npm run preview` - Preview production build
- `npm run check` - Run svelte-check for type checking
- `npm run db:init` - Initialize the database
- `npm run db:migrate` - Run database migrations
- `npm run db:rollback` - Rollback last migration
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- Only build the project after major changes. For smaller changes, use node --check

## Testing
- **Framework**: Vitest v2.x (do NOT use v4.x - has compatibility issues)
- **Test Location**: `tests/` directory
- **Naming**: `*.test.js` files
- **CI**: GitHub Actions runs tests, linting, security audits on push/PR to main branch (see `.github/workflows/`)

### Test Files
- `tests/club-cache.test.js` - Cache TTL and staleness logic
- `tests/rate-limit.test.js` - Rate limiting behavior
- `tests/sync-clubs.test.js` - Email resolution logic

### Mocks
SvelteKit-specific modules are mocked in `tests/mocks/`:
- `env.js` - Mocks `$env/dynamic/private`
- `stores.js` - Mocks `$app/stores`

### Writing New Tests
When testing server-side code that imports SvelteKit modules, copy the pure function logic into the test file to avoid import issues with `$env` and other SvelteKit-specific imports.

## Architecture
- **Frontend**: SvelteKit (Svelte 5) with Tailwind CSS
- **Database**: PostgreSQL with Knex.js for migrations/queries
- **External APIs**: Airtable (events), Hack Club Club API (club data)
- **Auth**: Hack Club OAuth + email OTP login
- **Email**: Email's are sent using Airtable email automations
- **Caching**: Club data is cached in PostgreSQL for faster loading

## Club Data Caching
Club data from the Hack Club Club API is cached in PostgreSQL for improved performance.
When adding new features that interact with club data, you MUST cache the data.

### How it works
- **Cache Storage**: Two tables - `club_cache` (club data) and `leader_clubs_cache` (which clubs a leader has access to)
- **Cache TTL**: 1 hour - data older than this is considered stale
- **Automatic Refresh**: A background scheduler refreshes stale caches every hour (started in `hooks.server.js`)
- **Manual Refresh**: Users can click the "Refresh" button on club pages to force a cache update
- **Fallback Behavior**: If cache is stale or missing, the system fetches from the API and caches the result

### Key Files
- `src/lib/server/club-cache.js` - Cache service with get/set/refresh functions
- `src/lib/server/cache-scheduler.js` - Hourly background refresh scheduler
- `src/lib/server/sync-clubs.js` - Updated to use cache instead of direct API calls
- `src/routes/api/club/refresh/+server.js` - API endpoint for manual cache refresh
- `src/lib/RefreshButton.svelte` - UI component for manual refresh
- `migrations/20241212000001_add_club_cache.js` - Database migration for cache tables

### Cached Data
For each club: name, id, level, location, join code, ships (array), members (array)

## Deployment
- Deployed via Docker on Coolify
- See `Dockerfile` and `docker-compose.yml` for configuration

## Code Style
- Use camelCase for variables and functions (starting with lowercase)
- Follow existing patterns in the codebase

## Styling
This project follows Hack Club's brand guidelines. See https://hackclub.com/brand/ for logos and assets.

### Colors (Hack Club Palette)
- **Primary Red**: `#ec3750` - Main accent color for buttons, links, headings
- **Blue**: `#338eda` - Secondary accent for links and info elements
- **Green**: `#33d6a6` - Success states and completed items
- **Text Dark**: `#1f2d3d` - Primary text color
- **Text Muted**: `#8492a6` - Secondary/label text
- **Border**: `#e0e6ed` - Card borders and dividers
- **Background Light**: `#f9fafc` - Card backgrounds, empty states

### Typography
- **Font**: Phantom Sans (Hack Club's custom font)
  ```css
  font-family: 'Phantom Sans', system-ui, sans-serif;
  ```
- Note: The font is referenced in CSS but not explicitly loaded; it falls back to system fonts if Phantom Sans is not installed

### Patterns
- Component styles use scoped `<style>` blocks (not Tailwind utility classes)
- Tailwind is available but primarily used for base styles
- Cards have `border-radius: 12px` with `2px solid #e0e6ed` borders
- Buttons mainly use the primary red with white text, but can use any of the Hack Club colors