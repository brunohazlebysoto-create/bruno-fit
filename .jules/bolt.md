## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2026-06-16 - Array Sort Bottleneck
**Learning:** Instantiating `new Date()` inside an array `.sort()` callback is exceptionally slow and causes an O(N log N) performance bottleneck, especially on large datasets like exercise logs. Using native string comparisons (e.g., `a < b ? -1 : (a > b ? 1 : 0)`) for ISO 8601 date strings is up to 30x faster.
**Action:** Always use direct lexicographical string comparisons instead of `new Date()` instantiations or `localeCompare()` for sorting ISO 8601 date strings in this codebase.
## 2024-06-19 - Max/Min Array Sorting Bottleneck
**Learning:** Using `Object.keys().sort().reverse()[0]` or `.slice(-1)` to find the latest/maximum date in a large dataset is an O(N log N) operation that introduces unnecessary overhead. When only the maximum or minimum value is needed, the entire sort is a performance anti-pattern.
**Action:** Use an O(N) linear search (e.g., using `reduce((a, b) => a > b ? a : b)`) instead of sorting the array when finding a single maximum or minimum date value.
