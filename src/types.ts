export type AnimeCategory = "Action" | "Romance" | "Dark/Fantasy" | "Sci-Fi" | "Slice of Life" | "Other";
export type CharacterMode = "Normal" | "Roast" | "Friendly" | "Emotional" | "Motivational";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  stats?: {
    reviewsCount: number;
    likesReceived: number;
    charactersCreated: number;
  };
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  animeTitle: string;
  imageUrl?: string;
  rating: number;
  content: string;
  isAiAssisted: boolean;
  createdAt: string;
  likesCount: number;
  category: AnimeCategory;
}

export interface Character {
  id: string;
  ownerId: string;
  name: string;
  avatarUrl: string;
  personality: string;
  tone: string;
  style: string;
  background: string;
  createdAt: string;
  modes: CharacterMode[];
  chatCount?: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "character";
  text: string;
  timestamp: string;
  mode?: CharacterMode;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  title: string;
  content: string;
  createdAt: string;
  upvotes: number;
  commentsCount: number;
  reactions?: {
    fire: number;
    laugh: number;
    skull: number;
    ghost: number;
  };
}

export interface Club {
  id: string;
  name: string;
  description: string;
  bannerUrl?: string;
  memberCount: number;
  ownerId: string;
  createdAt: string;
  category?: string;
}
