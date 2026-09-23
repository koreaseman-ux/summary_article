import React from 'react';
import { Sparkles, Code2, Bookmark, Newspaper, Smartphone } from 'lucide-react';

interface HeaderProps {
  onOpenApiGuide: () => void;
  onOpenBookmarks: () => void;
  onOpenMobileConnect: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApiGuide,
  onOpenBookmarks,
  onOpenMobileConnect,
  bookmarkCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Newspaper className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                AI 뉴스 브리프
              </h1>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Sparkles className="w-3 h-3" /> Top 3 큐레이터
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
              최신 웹 기사 실시간 탐색 및 핵심 3문장 한글 요약
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Test Link Button */}
          <button
            onClick={onOpenMobileConnect}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/80 shadow-2xs"
            title="스마트폰에서 테스트하기"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>모바일 테스트 링크</span>
          </button>

          <button
            onClick={onOpenApiGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/70"
            title="웹앱 구현 및 API 연동 가이드"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-600" />
            <span>구현 가이드</span>
          </button>

          <button
            onClick={onOpenBookmarks}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/70"
            title="저장한 기사 보관함"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xs:inline">보관함</span>
            {bookmarkCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-slate-900 rounded-full">
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
