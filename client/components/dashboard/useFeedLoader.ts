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

  // Refetch when the tab/window regains focus (catches cross-page mutations
  // such as deleting a post on My Posts then navigating back to the feed).
  useEffect(() => {
    const onFocus = () => { load(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  /** Remove a single post from local state (e.g. after deletion). */
  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

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
    removePost,
    searchQuery,
    setSearchQuery,
  } as const;
}
