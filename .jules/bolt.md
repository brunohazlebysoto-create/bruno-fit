## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2026-06-16 - Array Sort Bottleneck
**Learning:** Instantiating `new Date()` inside an array `.sort()` callback is exceptionally slow and causes an O(N log N) performance bottleneck, especially on large datasets like exercise logs. Using native string comparisons (e.g., `a < b ? -1 : (a > b ? 1 : 0)`) for ISO 8601 date strings is up to 30x faster.
**Action:** Always use direct lexicographical string comparisons instead of `new Date()` instantiations or `localeCompare()` for sorting ISO 8601 date strings in this codebase.
## 2024-06-03 - Bulk Upserts to prevent N+1 queries during Sync
**Learning:** During database synchronizations in `app.js` (for metrics, nutrition, and workouts logs), performing individual sequential `.upsert()` calls inside loops generates a significant N+1 network bottleneck.
**Action:** Always accumulate the objects into an array and perform a single batch `.upsert(array)` when syncing multiple records to Supabase. This reduces the time to sync 50 records from ~500ms down to ~10ms (simulated).
