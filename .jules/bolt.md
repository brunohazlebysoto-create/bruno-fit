## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2024-11-21 - Date string sorting optimization
**Learning:** In Javascript, using `new Date(a) - new Date(b)` or `a.localeCompare(b)` to sort arrays of ISO 8601 date strings is significantly slower (up to 7x) than using direct lexicographical string comparisons (`a < b ? -1 : (a > b ? 1 : 0)`).
**Action:** When sorting arrays of ISO 8601 date strings, always use direct lexicographical string comparisons to avoid performance bottlenecks, especially on large datasets.
