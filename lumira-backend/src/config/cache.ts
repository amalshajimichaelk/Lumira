import NodeCache from 'node-cache';

// Singleton node-cache instance
// stdTTL: default TTL in seconds (60s for dashboard)
// checkperiod: how often expired keys are deleted (every 120s)
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false, // Better performance, but don't mutate cached objects
});

export default cache;
