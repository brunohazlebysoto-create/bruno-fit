## 2024-05-24 - O(N log N) to O(N) Array Extractions
**Learning:** In a monolithic React component with frequent re-renders (like `app.js`), sorting large data structures (`metricslog`, `exlog`, etc.) with `.sort().reverse()[0]` just to find the latest/maximum element is a significant O(N log N) performance bottleneck.
**Action:** Always replace `.sort()[0]` patterns with a single-pass O(N) `.reduce()` operation. Ensure to pass `undefined` as the initial value to prevent fatal errors on empty arrays.
