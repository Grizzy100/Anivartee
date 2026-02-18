"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PostData } from "./types";

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

  // Keep latest references so `load` is stable across renders
  const fetchRef = useRef(fetchItems);
  const adapterRef = useRef(adapter);
  fetchRef.current = fetchItems;
  adapterRef.current = adapter;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await fetchRef.current();
      setPosts(items.map(adapterRef.current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Client-side search filter
  const filteredPosts = searchQuery
    ? posts.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q)
        );
      })
    : posts;

  return {
    posts: filteredPosts,
    allPosts: posts,
    loading,
    error,
    retry: load,
    searchQuery,
    setSearchQuery,
  } as const;
}
