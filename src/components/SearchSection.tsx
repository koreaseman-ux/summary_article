import React, { useState } from 'react';
import { Search, X, Loader2, TrendingUp, History, Sparkles } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
  recentSearches: string[];
  onSelectRecent: (keyword: string) => void;
  onClearRecent: (keyword?: string) => void;
}

const RECOMMENDED_TOPICS = [
  '소프트웨어 공학 AI 트렌드',
  '생성형 AI 반도체 혁신',
  'LLM 에이전트 실무 구축',
  '온디바이스 AI 시장 동향',
  '2026 프론트엔드 아키텍처',
  '자율주행 최신 기술'
];

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  isLoading,
  recentSearches,
  onSelectRecent,
  onClearRecent,
}) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || isLoading) return;
    onSearch(keyword.trim());
  };

  const handleChipClick = (topic: string) => {
    setKeyword(topic);
    onSearch(topic);
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs transition-all">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-slate-400">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="관심 주제 또는 키워드 입력 (예: 소프트웨어 공학 AI 트렌드)"
          className="w-full pl-10 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          disabled={isLoading}
        />

        {keyword && !isLoading && (
          <button
            type="button"
            onClick={() => setKeyword('')}
            className="absolute right-20 sm:right-24 p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            title="입력 내용 지우기"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !keyword.trim()}
          className="absolute right-1.5 sm:right-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span className="hidden sm:inline">탐색 중</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>분석</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Keywords */}
      <div className="mt-3.5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>추천 인기 키워드</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {RECOMMENDED_TOPICS.map((topic) => {
            const isPrimary = topic === '소프트웨어 공학 AI 트렌드';
            return (
              <button
                key={topic}
                onClick={() => handleChipClick(topic)}
                disabled={isLoading}
                className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1 ${
                  isPrimary
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium hover:bg-indigo-100'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700 font-normal'
                }`}
              >
                {isPrimary && <span className="text-indigo-600 text-[10px]">★</span>}
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[80%] no-scrollbar">
            <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 shrink-0">최근:</span>
            {recentSearches.map((rec) => (
              <span
                key={rec}
                className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] shrink-0 hover:bg-slate-200 cursor-pointer transition-colors"
                onClick={() => handleChipClick(rec)}
              >
                {rec}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearRecent(rec);
                  }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={() => onClearRecent()}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline shrink-0"
          >
            기록 비우기
          </button>
        </div>
      )}
    </div>
  );
};
