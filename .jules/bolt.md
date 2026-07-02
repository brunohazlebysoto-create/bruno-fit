## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2026-06-16 - Array Sort Bottleneck
**Learning:** Instantiating `new Date()` inside an array `.sort()` callback is exceptionally slow and causes an O(N log N) performance bottleneck, especially on large datasets like exercise logs. Using native string comparisons (e.g., `a < b ? -1 : (a > b ? 1 : 0)`) for ISO 8601 date strings is up to 30x faster.
**Action:** Always use direct lexicographical string comparisons instead of `new Date()` instantiations or `localeCompare()` for sorting ISO 8601 date strings in this codebase.

## 2024-05-18 - Replacing Object.keys().sort().reverse()[0] anti-pattern
**Learning:** The codebase frequently uses `Object.keys(obj).sort().reverse()[0]` or `Object.entries(obj).sort()[0]` to find the latest date or maximum value in logs like `mLog` and `metricslog`. This is an O(N log N) operation that creates unnecessary arrays and performs full sorts just to extract a single value.
**Action:** Replace these patterns with a single-pass O(N) `.reduce()` lookup (e.g., `Object.keys(obj).reduce((max, curr) => (!max || curr > max) ? curr : max, undefined)`). Always provide `undefined` as the initial value to handle empty arrays safely and prevent `TypeError`.
