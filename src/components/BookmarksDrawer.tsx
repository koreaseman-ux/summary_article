import React from 'react';
import { X, Trash2, ExternalLink, Bookmark, Copy } from 'lucide-react';
import { BookmarkArticle } from '../types.ts';
import { formatSingleArticleMarkdown } from '../utils/markdown.ts';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkArticle[];
  onRemoveBookmark: (id: number, keyword: string) => void;
  onClearAll: () => void;
  onNotify: (msg: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onClearAll,
  onNotify,
}) => {
  if (!isOpen) return null;

  const handleCopy = (art: BookmarkArticle) => {
    const md = formatSingleArticleMarkdown(art);
    navigator.clipboard.writeText(md);
    onNotify('기사 마크다운이 복사되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600 fill-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              저장한 기사 보관함 ({bookmarks.length})
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {bookmarks.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                전체 삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bookmark className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-medium text-slate-600">보관된 기사가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">
                기사 카드의 북마크 아이콘을 눌러 나중에 다시 읽을 수 있습니다.
              </p>
            </div>
          ) : (
            bookmarks.map((art) => (
              <div
                key={`${art.keyword}-${art.id}`}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1.5">
                  <span className="font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    #{art.keyword}
                  </span>
                  <span>{art.savedAt}</span>
                </div>

                <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug">
                  📌 {art.title.replace(/^📌\s*/, '')}
                </h4>

                <p className="mt-1.5 text-slate-600 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(art)}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <Copy className="w-3 h-3" /> 복사
                    </button>
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                    >
                      <span>원문 보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => onRemoveBookmark(art.id, art.keyword)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="보관함에서 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
