export interface Article {
  id: number;
  title: string;
  summary: string;
  importanceScore?: number;
  importanceReason?: string;
  keyPoints?: string[];
  url: string;
  source: string;
  publishedDate?: string;
  categoryTag?: string;
}

export interface CurationData {
  keyword: string;
  searchDate: string;
  overallSummary: string;
  modelUsed?: string;
  totalFoundCount?: number;
  articles: Article[];
  groundingSources?: { title: string; url: string }[];
}

export interface BookmarkArticle extends Article {
  savedAt: string;
  keyword: string;
}
