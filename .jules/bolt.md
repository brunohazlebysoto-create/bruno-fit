## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2026-06-16 - Array Sort Bottleneck
**Learning:** Instantiating `new Date()` inside an array `.sort()` callback is exceptionally slow and causes an O(N log N) performance bottleneck, especially on large datasets like exercise logs. Using native string comparisons (e.g., `a < b ? -1 : (a > b ? 1 : 0)`) for ISO 8601 date strings is up to 30x faster.
**Action:** Always use direct lexicographical string comparisons instead of `new Date()` instantiations or `localeCompare()` for sorting ISO 8601 date strings in this codebase.
## 2024-06-27 - Array Sort Bottleneck Part 2
**Learning:** Extracting the maximum or latest value from a large array of dates by sorting the entire array (`Object.keys().sort().reverse()[0]`) is an extremely common O(N log N) anti-pattern in `app.js`.
**Action:** Replace these calls with a single-pass `reduce` (e.g., `Object.keys().reduce((max, curr) => !max || curr > max ? curr : max, undefined)`). This operates in O(N) time and avoids the expensive sort overhead. Always provide `undefined` as the initial value to prevent errors on empty arrays.
