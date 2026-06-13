## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.

## 2024-06-25 - Bulk Supabase Upserts via Arrays
**Learning:** The database sync function in `app.js` was looping and performing an await on `supabase.from(...).upsert(...)` for every single date/metric/nutrition log element, creating an N+1 query issue that drastically increased synchronization latency. Supabase's `upsert` actually accepts arrays.
**Action:** When working with sync or multiple updates in Supabase, accumulate all log entries into a single array loop and run a bulk `.upsert(array)` instead to improve backend sync speed and significantly lower database hits.
