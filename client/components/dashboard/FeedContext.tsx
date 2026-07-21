import React, { createContext, useContext, ReactNode } from "react";
import { useFeedLoader } from "./useFeedLoader";
import type { PostData } from "./types";

type FeedContextType = ReturnType<typeof useFeedLoader>;

const FeedContext = createContext<FeedContextType | undefined>(undefined);

interface FeedProviderProps<T> {
  children: ReactNode;
  fetchItems: () => Promise<T[]>;
  adapter: (item: T) => PostData;
}

export function FeedProvider<T>({ children, fetchItems, adapter }: FeedProviderProps<T>) {
  const feedState = useFeedLoader(fetchItems, adapter);

  return (
    <FeedContext.Provider value={feedState as FeedContextType}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeedContext() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error("useFeedContext must be used within a FeedProvider");
  }
  return context;
}
