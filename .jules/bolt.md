## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2026-06-16 - Array Sort Bottleneck
**Learning:** Instantiating `new Date()` inside an array `.sort()` callback is exceptionally slow and causes an O(N log N) performance bottleneck, especially on large datasets like exercise logs. Using native string comparisons (e.g., `a < b ? -1 : (a > b ? 1 : 0)`) for ISO 8601 date strings is up to 30x faster.
**Action:** Always use direct lexicographical string comparisons instead of `new Date()` instantiations or `localeCompare()` for sorting ISO 8601 date strings in this codebase.

## 2024-05-18 - Replacing O(N log N) sorts with O(N) reduce
**Learning:** Found several places in `app.js` where arrays of entries or keys are being sorted entirely (O(N log N)) simply to find the single latest or maximum element using `[0]` or `.reverse()[0]`. Due to `app.js`'s monolithic structure and frequent re-renders, these sorts can become main-thread blockers as log entries grow over time.
**Action:** Replace `array.sort((a,b) => ...)[0]` patterns with `array.reduce((max, curr) => ..., undefined)` to achieve O(N) linear time complexity. Always include comments marking these optimizations and ensure `undefined` is passed as the initial value to prevent `TypeError` on empty arrays.
