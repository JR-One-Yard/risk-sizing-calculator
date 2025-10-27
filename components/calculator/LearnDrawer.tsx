/**
 * LearnDrawer Component
 * Slide-out educational panel with articles and navigation
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Badge } from '@/components/ui';
import {
  getAllArticles,
  getArticlesByCategory,
  getArticle,
  type Article,
} from '@/lib/content';

export interface LearnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialArticleId?: string;
}

export function LearnDrawer({ isOpen, onClose, initialArticleId }: LearnDrawerProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    initialArticleId || 'risk-management-basics'
  );
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const selectedArticle = getArticle(selectedArticleId);
  const basicsArticles = getArticlesByCategory('basics');
  const volatilityArticles = getArticlesByCategory('volatility');
  const advancedArticles = getArticlesByCategory('advanced');

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus drawer
    drawerRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Restore focus
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const ArticleNav = ({ articles, title }: { articles: Article[]; title: string }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
        {title}
      </h3>
      <nav className="space-y-1">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => setSelectedArticleId(article.id)}
            className={`w-full text-left px-3 py-2 rounded-[10px] text-sm transition-colors ${
              selectedArticleId === article.id
                ? 'bg-brand-tint text-brand font-semibold'
                : 'text-ink hover:bg-brand-tint'
            }`}
          >
            {article.title}
          </button>
        ))}
      </nav>
    </div>
  );

  const drawer = (
    <div
      className="fixed inset-0 z-50 flex"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="ml-auto relative bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-slide-in"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <svg
              className="w-6 h-6 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 id="drawer-title" className="text-2xl font-bold text-ink">
              Learn Risk Management
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink-muted focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-[10px] p-2"
            aria-label="Close drawer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-border overflow-y-auto p-6 bg-bg-muted">
            <ArticleNav articles={basicsArticles} title="Basics" />
            <ArticleNav articles={volatilityArticles} title="Volatility (NEW v2)" />
            <ArticleNav articles={advancedArticles} title="Advanced" />

            <div className="mt-8 p-4 bg-brand-tint border border-border rounded-[10px]">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-brand mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-ink">
                  <strong>Tip:</strong> Read the articles in order for the best learning
                  experience.
                </p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedArticle ? (
              <article className="p-8 max-w-3xl mx-auto">
                {/* Article Category Badge */}
                <div className="mb-4">
                  <Badge
                    variant={
                      selectedArticle.category === 'volatility'
                        ? 'info'
                        : selectedArticle.category === 'advanced'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {selectedArticle.category.toUpperCase()}
                    {selectedArticle.category === 'volatility' && ' - NEW v2'}
                  </Badge>
                </div>

                {/* Article Content - Simple Markdown-like Formatting */}
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formatArticleContent(selectedArticle.content),
                  }}
                />

                {/* Navigation Arrows */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                  <div>
                    {getPreviousArticle(selectedArticle.id) && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setSelectedArticleId(getPreviousArticle(selectedArticle.id)!.id)
                        }
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </Button>
                    )}
                  </div>
                  <div>
                    {getNextArticle(selectedArticle.id) && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setSelectedArticleId(getNextArticle(selectedArticle.id)!.id)
                        }
                      >
                        Next
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-ink-muted">Select an article to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render in portal
  return createPortal(drawer, document.body);
}

/**
 * Simple markdown-like formatting
 */
function formatArticleContent(content: string): string {
  return content
    .trim()
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-ink mt-8 mb-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-ink mt-10 mb-6">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-ink mb-8">$1</h1>')
    // Bold and emphasis
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre class="bg-brand-tint border border-border rounded-[10px] p-4 my-4 overflow-x-auto"><code class="text-sm font-mono text-ink">$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-brand-tint text-sm font-mono text-brand px-1.5 py-0.5 rounded">$1</code>')
    // Lists
    .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>)/, '<ul class="list-disc list-outside ml-6 my-4 space-y-2 text-ink">$1</ul>')
    // Checkmarks and crosses
    .replace(/✅/g, '<span class="text-success font-bold">✅</span>')
    .replace(/❌/g, '<span class="text-error font-bold">❌</span>')
    // Tables (basic support)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter((cell) => cell.trim());
      const cellsHtml = cells.map((cell) => `<td class="border border-border px-4 py-2">${cell.trim()}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    })
    .replace(/(<tr>[\s\S]*?<\/tr>)+/, '<table class="table-auto border-collapse border border-gray-400 my-6 w-full">$&</table>')
    // Paragraphs
    .replace(/^(?!<[h|u|p|t|d|l]|```|#)(.+)$/gm, '<p class="text-ink leading-relaxed my-4">$1</p>')
    // Clean up extra whitespace
    .replace(/\n\n+/g, '\n');
}

/**
 * Get next article in sequence
 */
function getNextArticle(currentId: string): Article | null {
  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.id === currentId);
  if (currentIndex === -1 || currentIndex === allArticles.length - 1) {
    return null;
  }
  return allArticles[currentIndex + 1];
}

/**
 * Get previous article in sequence
 */
function getPreviousArticle(currentId: string): Article | null {
  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.id === currentId);
  if (currentIndex <= 0) {
    return null;
  }
  return allArticles[currentIndex - 1];
}
