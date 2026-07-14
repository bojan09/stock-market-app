# Design system unification + dashboard redesign

Date: 2026-07-14

## Problem

Signalist has two parallel color systems: a custom hex token block in `app/globals.css` (`--color-gray-900` etc, used by the auth pages) and ad hoc arbitrary-hex Tailwind classes (`bg-[#0a0a0a]`, `bg-[#1A1D23]`, `bg-[#16191F]`, `bg-[#121212]`, `bg-[#14161B]`, `bg-[#23272F]`...) scattered across dashboard/watchlist/news/stock pages that don't reuse the token block and don't agree with each other on shade. The dashboard itself is a flat grid of 4 raw TradingView widgets with no real information hierarchy, no use of the Alerts feature just built, and no reuse of the app's own `NewsFeed` component.

## Palette

Deep navy + electric indigo, emerald/rose for gains/losses (approved by user). Replace the existing `@theme` block in `app/globals.css`:

- `--color-gray-900` (page background): `#050810` (navy-black, was `#050505`)
- `--color-gray-800` (surface / card bg): `#0F1420` (was `#141414`)
- `--color-gray-700` (raised surface / hover): `#161C2C` (was `#212328`)
- `--color-gray-600` (borders): `#232A3D` (was `#30333a`)
- `--color-gray-500` / `--color-gray-400`: unchanged (mid/light text grays already work against navy)
- `--color-indigo-500` (accent, new): `#6366F1` — replaces ad hoc `blue-500`/`blue-600` usage as *the* brand accent
- `--color-emerald-500` (gains, new): `#10B981`
- `--color-rose-500` (losses, new): `#F43F5E`
- Keep `yellow-400/500` (CTA gradient), `purple-500` (unused elsewhere, drop if unreferenced after migration)

All arbitrary-hex classes on the dashboard route are replaced with these tokens (`bg-gray-900`, `bg-gray-800`, `border-gray-600`, `text-indigo-500`, `text-emerald-500`, `text-rose-500`). Other pages (watchlist, stock detail, news) keep their current raw hex for now — out of scope this pass, tracked as follow-up.

## New shared primitive

Add `components/ui/card.tsx` (shadcn-style `Card`, `CardHeader`, `CardTitle`, `CardContent`) using the new tokens, so every dashboard panel shares one chrome (border, radius, shadow) instead of each widget hand-rolling its own wrapper div.

## Dashboard layout (`app/(root)/page.tsx`)

Row 1 (existing, restyled): Watchlist performance ticker (`DailyPerformers`) stays, restyled onto `bg-gray-900`.

Row 2 (existing widgets, restyled into `Card`): Market Overview + Global Heatmap side by side, unchanged data/widgets, new chrome.

Row 3 (new, replaces the generic "Top Stories" TradingView timeline widget):
- **Recent Alerts** card — pulls the signed-in user's alerts via `getAlertsByUserId`, shows up to 5 with symbol/condition/target, empty state links to `/watchlist`.
- **Latest News** card — calls existing `getNews()` action, maps `MarketNewsArticle[]` into the shape `NewsFeed` expects, renders via the existing `NewsFeed` component (reused, not rebuilt).

Row 4 (existing, restyled into `Card`): Market Quotes widget, unchanged data.

## Non-goals

- No changes to watchlist page, stock detail page, or news page styling this pass (tracked as separate follow-up tasks already in the project task list).
- No new data sources — Alerts and News panels use actions that already exist.
- No AI/sentiment features touched here (separate Phase D task).

## Testing

Manual QA in browser: dashboard loads for an authenticated session with an existing watchlist + alert, confirms new panels render real data (not placeholders), confirms TradingView widgets still mount, confirms no console/hydration errors, confirms typecheck passes.
