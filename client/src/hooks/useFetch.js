import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";

/** GET `path` (skipped when null) and expose { data, error, loading, reload }. */
export default function useFetch(path) {
  const [tick, setTick] = useState(0);
  const request = path && `${path}#${tick}`;
  // Results are tagged with the request they answer, so "loading" is derived rather than set in the effect.
  const [result, setResult] = useState({ request: null, data: null, error: null });

  useEffect(() => {
    if (!path) return undefined;
    let live = true;
    api
      .get(path)
      .then(({ data }) => live && setResult({ request: `${path}#${tick}`, data, error: null }))
      .catch((err) => live && setResult({ request: `${path}#${tick}`, data: null, error: errorMessage(err) }));
    return () => {
      live = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const fresh = result.request === request;
  return {
    // Keep showing the previous data while a reload is in flight, so lists don't flash empty.
    data: result.request?.startsWith(`${path}#`) ? result.data : null,
    error: fresh ? result.error : null,
    loading: Boolean(path) && !fresh,
    reload,
  };
}
