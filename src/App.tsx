import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  Share2, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Cpu
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { SearchSection } from './components/SearchSection.tsx';
import { ArticleCard } from './components/ArticleCard.tsx';
import { MarkdownView } from './components/MarkdownView.tsx';
import { ApiGuideModal } from './components/ApiGuideModal.tsx';
import { BookmarksDrawer } from './components/BookmarksDrawer.tsx';
import { Toast } from './components/Toast.tsx';
import { CurationData, Article, BookmarkArticle } from './types.ts';
import { generateFullMarkdown } from './utils/markdown.ts';

const INITIAL_DATA: CurationData = {
  keyword: '소프트웨어 공학 AI 트렌드',
  searchDate: new Date().toISOString().split('T')[0],
  modelUsed: 'Gemini 3.5 / 3.1 Flash-Lite (내용 중요도 평가 엔진)',
  totalFoundCount: 15,
  overallSummary: '소프트웨어 엔지니어링 생태계는 단순 코드 자동 완성을 넘어 에이전틱 AI(Agentic AI)와 자율적 리팩토링, 테스트 자동화 도구로 급격히 진화하고 있습니다. 개발자의 역할은 반복 코딩에서 시스템 아키텍처 설계와 AI 에이전트 오케스트레이션으로 재정의되고 있습니다.',
  articles: [
    {
      id: 1,
      title: '📌 2026년 소프트웨어 공학의 대전환: "단순 코딩 보조에서 자율 에이전틱 워크플로우로"',
      summary: '최신 소프트웨어 개발 환경에서는 단순한 인라인 자동완성을 넘어 개발 이슈를 읽고 테스트 작성, 버그 수정, PR 생성까지 스스로 수행하는 에이전틱 워크플로우가 핵심 트렌드로 부상하고 있습니다. 개발팀은 반복 작업에 소요되는 시간을 대폭 줄이고 복잡한 도메인 모델링과 비즈니스 가치 창출에 집중하는 추세입니다. 테스트 주도 개발(TDD)과 코드 리뷰 파이프라인 전반에 AI 감사가 기본 탑재되고 있습니다.',
      importanceScore: 99,
      importanceReason: '소프트웨어 엔지니어링 패러다임 전환과 에이전틱 AI 실무 확산의 최고 영향력 기사',
      keyPoints: [
        '에이전틱 AI 도구가 단위 테스트 자동 생성 및 엣지 케이스 탐지를 주도',
        'CI/CD 파이프라인과 통합되어 빌드 오류를 스스로 수정 후 재배포 제안',
        '엔지니어의 핵심 역량이 프롬프트 엔지니어링에서 오케스트레이션 아키텍처로 진화'
      ],
      url: 'https://zdnet.co.kr',
      source: 'ZDNet Korea',
      publishedDate: '2026-09-20',
      categoryTag: '소프트웨어 공학'
    },
    {
      id: 2,
      title: '📌 대규모 엔터프라이즈 레거시 코드 현대화에 투입되는 생성형 AI 솔루션',
      summary: '수십 년 된 모놀리식 아키텍처와 구형 언어(COBOL, Java 8 등)로 작성된 대규모 금융 및 기간계 시스템을 클라우드 네이티브 마이크로서비스로 전환하는 데 생성형 AI가 핵심 동력으로 자리 잡았습니다. 정적 분석 도구와 LLM이 결합하여 코드의 숨겨진 비즈니스 룰을 자동 추출하고 마이그레이션 안전성을 검증합니다. 이를 통해 마이그레이션 리스크와 프로젝트 소요 기간을 종전 대비 40% 이상 절감하고 있습니다.',
      importanceScore: 96,
      importanceReason: '금융·엔터프라이즈의 레거시 현대화 및 비용 절감 사례로 실무 적용 가치 우수',
      keyPoints: [
        '수백만 줄의 레거시 코드를 컨텍스트 윈도우 확장을 통해 통합 분석',
        '비즈니스 로직 손실 없는 마이크로서비스 API 스펙 자동 추출',
        '인간 아키텍트의 승인 루프를 거치는 Human-in-the-Loop 검증 체계 확립'
      ],
      url: 'https://www.etnews.com',
      source: '전자신문',
      publishedDate: '2026-09-18',
      categoryTag: '클라우드 & 아키텍처'
    },
    {
      id: 3,
      title: '📌 AI 생성 코드 시대의 새로운 과제: 소프트웨어 공급망 보안과 코드 거버넌스',
      summary: 'AI가 생성한 코드 도입이 폭발적으로 늘어나면서 오픈소스 라이선스 위반 위험, 할루시네이션으로 인한 보안 취약점, 비밀번호 유출 등을 사전 차단하는 AI 거버넌스 플랫폼이 필수 인프라가 되었습니다. 주요 기술 기업들은 커밋 단계에서부터 AI 생성 여부와 잠재적 취약점을 정밀 스캔하는 제로 트러스트 코드 보안 파이프라인을 구축하고 있습니다. 규제 준수(Compliance)와 모델 투명성이 기업의 핵심 평가 기준으로 부각되고 있습니다.',
      importanceScore: 94,
      importanceReason: 'AI 코드 생성 급증에 따른 공급망 보안 및 규제 대응 필수 가이드라인',
      keyPoints: [
        'AI 생성 코드에 대한 실시간 취약점(SAST/DAST) 자동 진단 의무화',
        '오픈소스 라이선스 준수 여부를 검사하는 소프트웨어 자재명세서(SBOM) 자동화',
        '개발팀 내 AI 도구 사용 규정 및 데이터 프라이버시 보호 가이드라인 표준화'
      ],
      url: 'https://byline.network',
      source: '바이라인네트워크',
      publishedDate: '2026-09-15',
      categoryTag: '보안 & 거버넌스'
    }
  ],
  groundingSources: [
    { title: 'ZDNet Korea 소프트웨어 엔지니어링 트렌드', url: 'https://zdnet.co.kr' },
    { title: '전자신문 테크 리포트', url: 'https://www.etnews.com' },
    { title: '바이라인네트워크 IT 심층 분석', url: 'https://byline.network' }
  ]
};

export default function App() {
  const [curationData, setCurationData] = useState<CurationData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'markdown'>('card');
  
  // Storage states
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      return saved ? JSON.parse(saved) : ['소프트웨어 공학 AI 트렌드', '자율주행', '양자컴퓨터'];
    } catch {
      return ['소프트웨어 공학 AI 트렌드', '자율주행'];
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

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

  const handleCopyFullMarkdown = async () => {
    const md = generateFullMarkdown(curationData);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedSummary(true);
      showToast('전체 요약 마크다운이 클립보드에 복사되었습니다.');
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      showToast('복사에 실패했습니다.');
    }
  };

  const handleShareAll = async () => {
    const md = generateFullMarkdown(curationData);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `[AI 뉴스 브리프] ${curationData.keyword} 중요도 Top 3`,
          text: md,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyFullMarkdown();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Sticky Top Header */}
      <Header
        onOpenApiGuide={() => setIsApiGuideOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarkCount={bookmarks.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-2.5 py-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>실시간 웹 검색 &amp; Flash-Lite 중요도 평가 엔진 (3.5/3.1 Flash-Lite)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            관심 키워드 웹 검색 &amp; 중요도 Top 3 뉴스 요약
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            원하는 주제를 입력하면 최신 웹 기사를 실시간 수집하고, <strong>Flash-Lite LLM</strong>이 내용 중요도를 정밀 평가하여 가장 가치 있는 3건의 3문장 요약과 원문 링크를 제공합니다.
          </p>
        </div>

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
              onClick={() => handleSearch(curationData.keyword)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-xs shrink-0 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && curationData && (
          <div className="space-y-4">
            {/* Overview & Controls Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      키워드: {curationData.keyword}
                    </span>
                    <span className="text-xs text-slate-500">
                      기준 일자: {curationData.searchDate}
                    </span>
                    {curationData.totalFoundCount && curationData.totalFoundCount > 0 && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-medium">
                        웹 기사 {curationData.totalFoundCount}건 분석 완료
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      중요도 평가 상위 핵심 기사 3선
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                      • {curationData.modelUsed || 'Gemini Flash-Lite 엔진'}
                    </span>
                  </div>
                </div>

                {/* View Switcher & Action buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                  {/* Card / Markdown View Toggle */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60">
                    <button
                      onClick={() => setViewMode('card')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                        viewMode === 'card'
                          ? 'bg-white text-slate-900 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="모바일 카드 뷰"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>카드 뷰</span>
                    </button>
                    <button
                      onClick={() => setViewMode('markdown')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                        viewMode === 'markdown'
                          ? 'bg-white text-slate-900 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="구조화 마크다운 뷰"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>마크다운 뷰</span>
                    </button>
                  </div>

                  {/* One-click Markdown Copy */}
                  <button
                    onClick={handleCopyFullMarkdown}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
                    title="전체 요약 마크다운 복사"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">복사 완료</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>전체 MD 복사</span>
                      </>
                    )}
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShareAll}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors"
                    title="공유하기"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 💡 Overall Trend Insight Box */}
              {curationData.overallSummary && (
                <div className="bg-slate-50/80 rounded-xl p-3.5 sm:p-4 border border-slate-100 flex items-start gap-2.5">
                  <span className="text-base sm:text-lg select-none">💡</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block mb-0.5">
                      종합 트렌드 &amp; 내용 중요도 분석
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {curationData.overallSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Grounding Sources Pills */}
              {curationData.groundingSources && curationData.groundingSources.length > 0 && (
                <div className="pt-1 flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
                  <span className="text-[11px] font-semibold text-slate-400">실시간 웹 소스:</span>
                  {curationData.groundingSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-indigo-600 bg-slate-100/90 hover:bg-indigo-50 px-2 py-0.5 rounded-md transition-colors"
                    >
                      <span className="truncate max-w-[120px] sm:max-w-[180px]">{src.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Switching */}
            {viewMode === 'card' ? (
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
            ) : (
              <MarkdownView data={curationData} onNotify={showToast} />
            )}
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

      {/* Toast Feedback */}
      <Toast message={toastMessage} />
    </div>
  );
}
