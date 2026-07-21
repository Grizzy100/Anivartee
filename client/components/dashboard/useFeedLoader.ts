"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { PostData } from "./types";

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generic hook for fetching items and adapting them to PostData.
 *
 * Deduplicates the identical fetch → setState → loading/error pattern
 * shared between the user dashboard and fact-checker dashboard pages.
 *
 * @param fetchItems  — Async function that returns the raw item array.
 * @param adapter     — Pure function that maps one raw item to PostData.
 */
export function useFeedLoader<T>(
  fetchItems: () => Promise<T[]>,
  adapter: (item: T) => PostData
) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const lastFetchedAt = useRef(0);

  // Keep latest references so `load` is stable across renders
  const fetchRef = useRef(fetchItems);
  const adapterRef = useRef(adapter);
  fetchRef.current = fetchItems;
  adapterRef.current = adapter;

  const load = useCallback(async (opts?: { force?: boolean; signal?: AbortSignal }) => {
    const isStale = Date.now() - lastFetchedAt.current > STALE_THRESHOLD_MS;
    
    // Skip if we have data and it's not stale, unless forced
    if (!opts?.force && lastFetchedAt.current > 0 && !isStale) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await fetchRef.current();
      
      if (opts?.signal?.aborted) return;
      
      setPosts(items.map(adapterRef.current));
      lastFetchedAt.current = Date.now();
      setLoading(false);
    } catch (err) {
      if (opts?.signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  // Refetch when the tab/window regains focus
  useEffect(() => {
    const onFocus = () => { load(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  /** Remove a single post from local state (e.g. after deletion). */
  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  // Client-side search filter
  const filteredPosts = useMemo(() => {
    return searchQuery
      ? posts.filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.author.name.toLowerCase().includes(q)
          );
        })
      : posts;
  }, [posts, searchQuery]);
  
  // Memoize the return value to prevent context consumers from unnecessary re-renders
  return useMemo(() => ({
    posts: filteredPosts,
    allPosts: posts,
    loading,
    error,
    retry: () => load({ force: true }),
    removePost,
    searchQuery,
    setSearchQuery,
  }), [filteredPosts, posts, loading, error, load, removePost, searchQuery]);
}
