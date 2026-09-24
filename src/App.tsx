import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { SearchSection } from './components/SearchSection.tsx';
import { ArticleCard } from './components/ArticleCard.tsx';
import { ApiGuideModal } from './components/ApiGuideModal.tsx';
import { BookmarksDrawer } from './components/BookmarksDrawer.tsx';
import { MobileConnectModal } from './components/MobileConnectModal.tsx';
import { Toast } from './components/Toast.tsx';
import { CurationData, Article, BookmarkArticle } from './types.ts';

export default function App() {
  const [curationData, setCurationData] = useState<CurationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Storage states
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState<BookmarkArticle[]>(() => {
    try {
      const saved = localStorage.getItem('bookmarked_articles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI modal toggles
  const [isApiGuideOpen, setIsApiGuideOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isMobileConnectOpen, setIsMobileConnectOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('recent_searches', JSON.stringify(recentSearches));
    } catch {
      // ignore
    }
  }, [recentSearches]);

  useEffect(() => {
    try {
      localStorage.setItem('bookmarked_articles', JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  // Perform search
  const handleSearch = async (query: string) => {
    if (!query.trim() || isLoading) return;
    setError(null);
    setIsLoading(true);
    setLoadingStep(1);

    // Save recent
    setRecentSearches((prev) => {
      const filtered = prev.filter((k) => k !== query.trim());
      return [query.trim(), ...filtered].slice(0, 6);
    });

    // Simulated step intervals for rich UX feedback
    const step2Timer = setTimeout(() => setLoadingStep(2), 1100);
    const step3Timer = setTimeout(() => setLoadingStep(3), 2400);

    try {
      const res = await fetch('/api/search-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: query.trim() }),
      });

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (${res.status})`);
      }

      const data: CurationData = await res.json();
      setCurationData(data);
      showToast(`'${query.trim()}' 관련 웹 기사를 탐색하고 중요도 상위 3건을 선별했습니다.`);
    } catch (err: any) {
      console.error('검색 오류:', err);
      setError(err.message || '기사 검색 및 요약 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleClearRecent = (oneKeyword?: string) => {
    if (oneKeyword) {
      setRecentSearches((prev) => prev.filter((k) => k !== oneKeyword));
    } else {
      setRecentSearches([]);
    }
  };

  // Bookmarks toggle
  const handleToggleBookmark = (art: Article) => {
    if (!curationData) return;
    const exists = bookmarks.some((b) => b.id === art.id && b.keyword === curationData.keyword);
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => !(b.id === art.id && b.keyword === curationData.keyword)));
      showToast('보관함에서 제거되었습니다.');
    } else {
      const newBm: BookmarkArticle = {
        ...art,
        keyword: curationData.keyword,
        savedAt: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };
      setBookmarks((prev) => [newBm, ...prev]);
      showToast('보관함에 저장되었습니다.');
    }
  };

  const handleRemoveBookmark = (id: number, keyword: string) => {
    setBookmarks((prev) => prev.filter((b) => !(b.id === id && b.keyword === keyword)));
    showToast('보관함에서 삭제되었습니다.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Sticky Top Header */}
      <Header
        onOpenApiGuide={() => setIsApiGuideOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenMobileConnect={() => setIsMobileConnectOpen(true)}
        bookmarkCount={bookmarks.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        {/* Search Bar Section */}
        <SearchSection
          onSearch={handleSearch}
          isLoading={isLoading}
          recentSearches={recentSearches}
          onSelectRecent={handleSearch}
          onClearRecent={handleClearRecent}
        />

        {/* Loading Indicator with multi-step process */}
        {isLoading && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs text-center space-y-4 animate-in fade-in duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                '{recentSearches[0] || '관심 주제'}' 실시간 웹 기사 검색 및 중요도 평가 중...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                실시간 웹 인덱싱 ➔ Flash-Lite LLM 내용 중요도 분석 ➔ 핵심 3건 선별 요약
              </p>
            </div>

            {/* Step progress pills */}
            <div className="max-w-md mx-auto grid grid-cols-3 gap-2 text-left pt-2">
              <div
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  loadingStep >= 1
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  {loadingStep > 1 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  )}
                  <span className="font-bold">1단계</span>
                </div>
                <div className="text-[11px] leading-tight">실시간 웹 기사 수집</div>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  loadingStep >= 2
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  {loadingStep > 2 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  )}
                  <span className="font-bold">2단계</span>
                </div>
                <div className="text-[11px] leading-tight">Flash-Lite 중요도 평가</div>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  loadingStep >= 3
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="font-bold">3단계</span>
                </div>
                <div className="text-[11px] leading-tight">Top 3 한글 요약</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-rose-900">검색 중 문제가 발생했습니다</h4>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => {
                const targetKeyword = curationData?.keyword || recentSearches[0];
                if (targetKeyword) {
                  handleSearch(targetKeyword);
                }
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-xs shrink-0 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && curationData && (
          <div className="space-y-4">
            {curationData.articles.map((article, idx) => {
              const isBookmarked = bookmarks.some(
                (b) => b.id === article.id && b.keyword === curationData.keyword
              );
              return (
                <ArticleCard
                  key={article.id || idx}
                  article={article}
                  index={idx}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  onNotify={showToast}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action for Fast Search on Mobile */}
      <div className="sm:hidden fixed bottom-4 right-4 z-20">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all"
          title="상단으로 이동"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* API Implementation Guide Modal */}
      <ApiGuideModal
        isOpen={isApiGuideOpen}
        onClose={() => setIsApiGuideOpen(false)}
        onNotify={showToast}
      />

      {/* Saved Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onClearAll={() => {
          setBookmarks([]);
          showToast('보관함이 비워졌습니다.');
        }}
        onNotify={showToast}
      />

      {/* Mobile Connect Modal */}
      <MobileConnectModal
        isOpen={isMobileConnectOpen}
        onClose={() => setIsMobileConnectOpen(false)}
        onNotify={showToast}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} />
    </div>
  );
}
