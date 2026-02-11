'use client';

import { useState } from 'react';
import { Heart, Bookmark, MessageCircle, BadgeCheck, ExternalLink } from 'lucide-react';
import { Post } from '@/lib/types';
import { formatTimestamp, formatCount } from '@/lib/formatters';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.engagement.isLiked);
  const [isSaved, setIsSaved] = useState(post.engagement.isSaved);
  const [likesCount, setLikesCount] = useState(post.engagement.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <article className="bg-surface border border-(--border) rounded-sm p-5 hover:border-(--primary)/30 transition-colors duration-200">
      {/* Author Header */}
      <div className="flex items-start gap-3 mb-4">
        <img 
          src={post.author.avatar} 
          alt={post.author.name}
          className="w-11 h-11 rounded-full border border-(--border)"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-text-primary text-sm font-semibold">
              {post.author.name}
            </h4>
            {post.author.badge && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-(--primary)/10 rounded-xs text-xs text-(--primary)">
                <BadgeCheck size={12} />
                <span>{post.author.badge}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-text-muted text-xs">
              {post.author.role}
            </span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted text-xs">
              {formatTimestamp(post.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-text-primary text-lg font-display font-semibold mb-2 leading-tight">
          {post.heading}
        </h3>
        <p className="text-text-muted text-sm leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* Proof Links */}
      {post.proofLinks.length > 0 && (
        <div className="mb-4 p-3 bg-surface-elevated rounded-xs border border-(--border)">
          <p className="text-text-muted text-xs font-medium mb-2 tracking-wide">
            PROOF SOURCES
          </p>
          <div className="space-y-1.5">
            {post.proofLinks.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-(--secondary) hover:text-(--primary) transition-colors group"
              >
                <ExternalLink size={12} className="shrink-0" />
                <span className="truncate group-hover:underline">
                  {new URL(link).hostname}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-(--border)">
        <button
          onClick={handleLike}
          className={`
            flex items-center gap-2 text-xs font-medium transition-all
            ${isLiked 
              ? 'text-red-400' 
              : 'text-text-muted hover:text-red-400'
            }
          `}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="font-display">{formatCount(likesCount)}</span>
        </button>

        <button className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-(--secondary) transition-colors">
          <MessageCircle size={18} />
          <span className="font-display">{formatCount(post.engagement.comments)}</span>
        </button>

        <button
          onClick={handleSave}
          className={`
            flex items-center gap-2 text-xs font-medium transition-all
            ${isSaved 
              ? 'text-(--warning)' 
              : 'text-text-muted hover:text-(--warning)'
            }
          `}
        >
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          <span className="font-display">{formatCount(post.engagement.saves)}</span>
        </button>
      </div>
    </article>
  );
}
