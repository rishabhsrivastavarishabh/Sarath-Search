/**
 * Sarath Search Engine v14.0 — Unified Enterprise Types Definition
 */

export type SearchCategory = 'all' | 'images' | 'videos' | 'news' | 'docs' | 'maps' | 'shopping';

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  meta_description: string;
  favicon_url: string;
  reading_time_min: number;
  published_date: string;
  category: SearchCategory;
  score: number;
  verified_domain?: boolean;
  og_image?: string;
  video_duration?: string;
  video_channel?: string;
  doc_type?: string;
  doc_size?: string;
  price?: string;
  store_name?: string;
  address?: string;
  rating?: number;
}

export interface SearchProviderResponse {
  query: string;
  results: SearchResultItem[];
  total: number;
  provider: string;
  page?: number;
  pageSize?: number;
  detected_language?: string;
  country?: string;
  latency_ms?: number;
}

export interface AiAnswerFaqItem {
  question: string;
  answer: string;
}

export interface AiAnswerSource {
  index?: number;
  title: string;
  domain: string;
  url: string;
}

export interface AiAnswerData {
  query: string;
  overview: string;
  introduction?: string;
  detailed_explanation: string;
  quick_facts?: string[];
  key_points?: string[];
  features?: string[];
  advantages?: string[];
  disadvantages?: string[];
  code_examples?: string[];
  faq?: AiAnswerFaqItem[];
  related_topics?: string[];
  people_also_search_for?: string[];
  sources?: AiAnswerSource[];
  related_questions?: string[];
  generated_at: string;
  ai_model?: string;
  detected_language?: string;
}

export interface SearchHistoryItem {
  id?: string;
  user_id?: string | null;
  query: string;
  search_type?: string;
  ai_mode?: boolean;
  searched_at?: string;
  pinned?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'webmaster' | 'user';
  created_at?: string;
}

export interface SystemStats {
  total_searches: number;
  total_indexed_pages: number;
  total_verified_websites: number;
  average_latency_ms: number;
}
