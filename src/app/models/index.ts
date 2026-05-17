// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
  coverColor: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isFollowing: boolean;
  joinedAt: Date;
}

// ─── Post (Création) ──────────────────────────────────────────────────────────
export interface Post {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  likesCount: number;
  retweetsCount: number;
  commentsCount: number;
  isLiked: boolean;
  isRetweeted: boolean;
  isBookmarked: boolean;
  hashtags: string[];
  imageUrls?: string[];
  retweetedBy?: string;
  originalPost?: Post;
}

// ─── Comment ──────────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: Date;
  likesCount: number;
  isLiked: boolean;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType = 'like' | 'retweet' | 'comment' | 'follow' | 'mention';

export interface Notification {
  id: string;
  type: NotificationType;
  actor: User;
  recipientId: string;
  postId?: string;
  postContent?: string;
  isRead: boolean;
  createdAt: Date;
}

// ─── Trending Hashtag ─────────────────────────────────────────────────────────
export interface TrendingHashtag {
  id: string;
  tag: string;
  postsCount: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}
