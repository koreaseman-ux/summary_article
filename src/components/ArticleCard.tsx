import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Bookmark, Share2, Globe, Tag, ChevronDown, ChevronUp, Award, Lightbulb } from 'lucide-react';
import { Article } from '../types.ts';
import { formatSingleArticleMarkdown } from '../utils/markdown.ts';

interface ArticleCardProps {
  article: Article;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  onNotify: (message: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  index,
  isBookmarked,
  onToggleBookmark,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);
  const [showBullets, setShowBullets] = useState(true);

  const handleCopySingle = async () => {
    const md = formatSingleArticleMarkdown(article, index);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      onNotify(`'${article.title.slice(0, 16)}...' 마크다운이 복사되었습니다.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('복사에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `${article.title}\n\n[핵심 요약]\n${article.summary}`,
          url: article.url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopySingle();
    }
  };

  // Clean title
  const cleanTitle = article.title.replace(/^📌\s*/, '').trim();

  // Score styling
  const score = article.importanceScore ?? (98 - index * 3);
  const scoreColor =
    index === 0
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : index === 1
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Rank badge */}
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-xs tracking-tight">
              Top #{index + 1}
            </span>

            {/* Importance Score Badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${scoreColor}`}>
              <Award className="w-3 h-3" />
              중요도 {score}점
            </span>

            {/* Source badge */}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
              <Globe className="w-3 h-3 text-slate-400" />
              {article.source}
            </span>

            {/* Category tag */}
            {article.categoryTag && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded-md border border-indigo-100/80">
                <Tag className="w-2.5 h-2.5 text-indigo-500" />
                {article.categoryTag}
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleBookmark(article)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent'
              }`}
              title={isBookmarked ? '보관함에서 제거' : '보관함에 저장'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-transparent transition-colors"
              title="기사 공유"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 📌 Article Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-950 transition-colors">
          <span className="text-indigo-600 mr-1.5 font-bold">📌</span>
          {cleanTitle}
        </h3>

        {/* 💡 Importance Reason from Flash-Lite */}
        {article.importanceReason && (
          <div className="mt-2.5 px-3 py-2 bg-indigo-50/50 rounded-lg border border-indigo-100/70 text-xs text-indigo-900 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-indigo-950">선정 사유: </span>
              <span className="text-indigo-800">{article.importanceReason}</span>
            </div>
          </div>
        )}

        {/* 📝 Core Summary */}
        <div className="mt-3.5 pt-3 border-t border-slate-100/90">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
            <span className="text-slate-700">📝</span>
            <span>핵심 요약 (3~4문장)</span>
          </div>
          <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            {article.summary}
          </p>
        </div>

        {/* Key bullet points */}
        {article.keyPoints && article.keyPoints.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowBullets(!showBullets)}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>주요 핵심 포인트 ({article.keyPoints.length})</span>
              {showBullets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showBullets && (
              <ul className="mt-2 space-y-1.5 pl-1">
                {article.keyPoints.map((pt, ptIdx) => (
                  <li key={ptIdx} className="text-xs sm:text-[13px] text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: 🔗 Source Link & Copy */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={handleCopySingle}
          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/80 transition-colors"
          title="이 기사 마크다운 복사"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">복사됨</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>MD 복사</span>
            </>
          )}
        </button>

        {/* 🔗 Original Article Link */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors group/link"
        >
          <span>🔗 원문 링크 열기</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </article>
  );
};
