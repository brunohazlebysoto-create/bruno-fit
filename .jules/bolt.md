## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.

## 2024-05-24 - Fast ISO Date Sorting
**Learning:** In a heavily data-driven React app where large arrays of historical entries (like logs/metrics) are sorted frequently on the frontend, using `new Date(a) - new Date(b)` or `localeCompare()` for ISO 8601 strings (YYYY-MM-DD) introduces a massive O(N log N) performance penalty (over 10x slower).
**Action:** Always use direct lexicographical string comparisons (`a < b ? -1 : (a > b ? 1 : 0)`) when sorting ISO formatted date strings. This is a crucial codebase-specific pattern given the heavy use of date-keyed dictionaries like `foodlog`, `metricslog`, and `exlog`.
