## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.

## 2024-05-24 - Lexicographical Date String Sorting Performance
**Learning:** Using `new Date()` instantiations or `localeCompare()` inside array `.sort()` methods for ISO 8601 date strings introduces massive O(N log N) overhead during frequent React re-renders. The standard lexicographical string comparison is much more performant.
**Action:** Always use direct lexicographical string comparisons (e.g., `a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)`) for ISO date strings to prevent significant performance bottlenecks in React components.
