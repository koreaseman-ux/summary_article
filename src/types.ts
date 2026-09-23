export interface Article {
  id: number;
  title: string;
  summary: string;
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
  articles: Article[];
  groundingSources?: { title: string; url: string }[];
}

export interface BookmarkArticle extends Article {
  savedAt: string;
  keyword: string;
}
