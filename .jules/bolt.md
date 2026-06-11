## 2024-05-24 - Memoizing Time-Dependent Values
**Learning:** When using `useMemo` in React to cache values, be careful if the calculation depends on the current time (e.g., `new Date().toISOString()`). If you cache it without the current time in the dependency array, the cached value will become stale if the user leaves the application open overnight.
**Action:** Avoid memoizing calculations that depend on the current date/time unless you also track the time as a state/dependency, or just leave them un-memoized if they are lightweight enough.
## 2024-05-24 - Fast Date Sorting with ISO Strings
**Learning:** In Javascript, parsing dates inside `sort()` callbacks via `new Date()` or using `localeCompare` introduces a major bottleneck when dealing with arrays that have many date entries, because the comparator executes $O(N \log N)$ times.
**Action:** Always prefer direct lexicographical string comparisons (`<` and `>`) when sorting ISO 8601 date strings.
