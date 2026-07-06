## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2026-06-16 - Array Sort Bottleneck
**Learning:** Instantiating `new Date()` inside an array `.sort()` callback is exceptionally slow and causes an O(N log N) performance bottleneck, especially on large datasets like exercise logs. Using native string comparisons (e.g., `a < b ? -1 : (a > b ? 1 : 0)`) for ISO 8601 date strings is up to 30x faster.
**Action:** Always use direct lexicographical string comparisons instead of `new Date()` instantiations or `localeCompare()` for sorting ISO 8601 date strings in this codebase.
## 2024-05-18 - Replacing Date Sorting with Reduction
**Learning:** The codebase has a pervasive pattern of using `.sort()` on arrays of dates or objects to find the single latest or maximum entry, creating an O(N log N) performance bottleneck on each state update.
**Action:** Always replace instances like `Object.keys(metricslog).sort().reverse()[0]` or `Object.entries(metricslog).sort((a,b)=>b[0] < a[0] ? -1 : 1)[0]` with an O(N) `.reduce()` search. Ensure that `undefined` is explicitly passed as the initial value to `.reduce()` to safely mimic array `[0]` index access on empty datasets.
