## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.

## 2024-05-24 - Sorting ISO 8601 Date Strings
**Learning:** `localeCompare()` and `new Date()` are extremely slow in Javascript loops compared to direct string comparison for sorting ISO date strings like "2024-05-24". Benchmarks show lexicographical comparisons are up to 28x faster than `new Date()` and 3x faster than `localeCompare()`.
**Action:** When sorting ISO 8601 formatted date strings in arrays, always use direct lexicographical string comparisons (e.g., `a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)`) instead of `new Date()` instantiations or `localeCompare()`.
