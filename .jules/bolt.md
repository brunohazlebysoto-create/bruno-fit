## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.

## 2024-05-25 - React.memo custom comparison functions
**Learning:** Using `JSON.stringify` as a custom comparator in `React.memo` (e.g. `React.memo(Component, (p,n) => JSON.stringify(p) === JSON.stringify(n))`) is a performance anti-pattern. While it prevents re-renders, the CPU cost of serializing large objects/arrays to strings blocks the main thread and can be slower than the React re-render itself.
**Action:** Use faster array/object comparators checking length and specific key elements, or fix the parent to pass stable references instead.
