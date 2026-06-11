## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2026-06-04 - Memoizing bodyCompHistory
**Learning:** `bodyCompHistory` re-sorted `Object.keys(metricslog)` on every render in the `Registro` component. While not necessarily a huge bottleneck initially, as the user logs more days the O(N log N) sorting step would unnecessarily slow down rendering.
**Action:** Use `useMemo` on computationally heavy state derivations (like sorting large maps of data) when they depend on state that doesn't change every render (`metricslog`, `bodyComp`).
