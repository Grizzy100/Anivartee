'use client';

import PostCard from './PostCard';
import { Post } from '@/lib/types';

interface FeedProps {
  title: string;
  subtitle: string;
  posts: Post[];
}

export default function Feed({ title, subtitle, posts }: FeedProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Feed Header */}
      <div className="mb-6">
        <h2 className="text-text-primary text-2xl font-display font-bold mb-1">
          {title}
        </h2>
        <p className="text-text-muted text-sm">
          {subtitle}
        </p>
      </div>

      {/* Post Cards */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More Indicator */}
      <div className="mt-8 text-center">
        <p className="text-text-muted text-sm">
          Scroll for more posts
        </p>
      </div>
    </div>
  );
}
