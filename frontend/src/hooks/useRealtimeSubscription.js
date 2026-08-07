import { useEffect, useState } from 'react';

export function useRealtimeSubscription(subscribe, dependencies) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(subscribe));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subscribe) {
      setData([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError(null);
    const unsubscribe = subscribe((nextData) => {
      setData(nextData);
      setLoading(false);
    }, (nextError) => {
      setError(nextError);
      setLoading(false);
    });
    return unsubscribe;
    // The caller owns the dependency list because each listener has domain-specific keys.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error };
}
