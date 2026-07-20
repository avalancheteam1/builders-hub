"use client";

import { useEffect, useState } from "react";
import { pchainApiPath } from "@/lib/pchain-explorer";

/**
 * Generic client fetch for the same-origin P-chain proxy. Plain
 * fetch + AbortController (matches the builders-hub stats convention;
 * react-query is scoped to the toolbox only).
 */
export function usePchainData<T>(
  network: string,
  resource: string,
  query?: Record<string, string | number | undefined>,
): { data: T | null; loading: boolean; error: string | null } {
  const key = pchainApiPath(network, resource, query);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(key, { signal: controller.signal });
        if (!res.ok) throw new Error(res.status === 404 ? "not found" : `HTTP ${res.status}`);
        setData((await res.json()) as T);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "failed to load");
        setData(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [key]);

  return { data, loading, error };
}
