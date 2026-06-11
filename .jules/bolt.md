## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.

## 2024-05-24 - Sorting Dates in JavaScript
**Learning:** Using `new Date(a.date) - new Date(b.date)` or `.localeCompare()` inside `Array.prototype.sort()` creates a massive performance bottleneck due to continuous object instantiation or complex string parsing in O(N log N) loops.
**Action:** When dealing with standard ISO 8601 string dates (like `YYYY-MM-DDTHH:mm:ss.sssZ`), always use direct lexicographical string comparisons: `a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)`.
