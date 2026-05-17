import { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '@config/api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Module-level cache keyed by location suburb so navigating away and back is instant.
const cache = new Map(); // suburb -> { data, time }
const pending = new Map(); // suburb -> Promise (deduplicates concurrent fetches)

function cacheKey(location) {
  return location?.suburb || '__default__';
}

async function fetchHomeData(location) {
  const locQS = location?.lat && location?.lng
    ? `lat=${location.lat}&lng=${location.lng}&`
    : '';

  const safe = async (promise) => {
    try { return await promise; } catch { return { success: false, data: [] }; }
  };

  const [hotData, dealsData, recommendedData, newData, allData, bundlesData, topRatedData] =
    await Promise.all([
      safe(fetch(`${API_BASE_URL}/products/hot?${locQS}limit=10`).then(r => r.json())),
      safe(fetch(`${API_BASE_URL}/products/flash-deals?limit=10`).then(r => r.json())),
      safe(fetch(`${API_BASE_URL}/products/recommended?${locQS}limit=10`).then(r => r.json())),
      safe(fetch(`${API_BASE_URL}/products/new-arrivals?${locQS}limit=10`).then(r => r.json())),
      safe(fetch(`${API_BASE_URL}/products?${locQS}page=1&limit=8`).then(r => r.json())),
      safe(fetch(`${API_BASE_URL}/products/bundles?${locQS}limit=10`).then(r => r.json())),
      safe(fetch(`${API_BASE_URL}/products/top-rated?${locQS}limit=10`).then(r => r.json())),
    ]);

  const arr = (d) => (d.success && Array.isArray(d.data) ? d.data : []);

  return {
    hotProducts:  arr(hotData),
    flashDeals:   arr(dealsData),
    recommended:  arr(recommendedData),
    newArrivals:  arr(newData),
    bundles:      arr(bundlesData),
    topRated:     arr(topRatedData),
    feedProducts: arr(allData),
    feedHasMore:  allData.pagination?.hasMore ?? false,
  };
}

export function useHomeData(location) {
  const key = cacheKey(location);
  const hit = cache.get(key);
  const fresh = hit && Date.now() - hit.time < CACHE_TTL;

  const [data, setData] = useState(fresh ? hit.data : null);
  const [loading, setLoading] = useState(!fresh);
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    const k = cacheKey(location);
    const cached = cache.get(k);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);

    let cancelled = false;

    // Deduplicate: if another instance already triggered a fetch for this key, share it.
    if (!pending.has(k)) {
      pending.set(k, fetchHomeData(location).finally(() => pending.delete(k)));
    }

    pending.get(k).then(result => {
      if (cancelled || keyRef.current !== k) return;
      cache.set(k, { data: result, time: Date.now() });
      setData(result);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading };
}
