'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Menu, 
  X, 
  ArrowLeft, 
  HelpCircle, 
  Laptop,
  ExternalLink,
  Link2,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupportModal } from '@/components/support/support-modal';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DOCS_DATA } from './docs-data';

const fileToChapterId = (fileName: string): string | null => {
  const mapping: Record<string, string> = {
    '01-getting-started.md': 'getting-started',
    '02-patients.md': 'patient-management',
    '03-appointments.md': 'appointments',
    '04-queue.md': 'queue',
    '05-prescriptions.md': 'prescriptions',
    '06-lab.md': 'lab',
    '07-billing.md': 'billing',
    '08-staff.md': 'staff',
    '09-reports.md': 'reports',
    '10-settings.md': 'settings',
    '11-subscription.md': 'subscription',
    '12-whatsapp.md': 'whatsapp',
    '13-branches.md': 'branches',
    '14-shortcuts.md': 'shortcuts',
    '15-faq.md': 'faq'
  };
  return mapping[fileName] || null;
};

export default function DocsPage() {
  const [activeChapterId, setActiveChapterId] = React.useState('getting-started');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [supportCategory, setSupportCategory] = React.useState<'Technical Support' | 'Sales Inquiry' | 'Billing & Subscription' | 'Feature Request' | 'Enterprise / Branches' | 'Bug Report' | 'Other'>('Technical Support');
  const [pendingScrollTarget, setPendingScrollTarget] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<'yes' | 'no' | null>(null);
  const [copiedSectionId, setCopiedSectionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFeedback(null);
  }, [activeChapterId]);

  React.useEffect(() => {
    // Handle initial hash routing
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const matchedChapter = DOCS_DATA.find(c => c.id === hash);
        if (matchedChapter) {
          setActiveChapterId(hash);
          setPendingScrollTarget('top');
          return;
        }
        for (const chapter of DOCS_DATA) {
          const matchedSection = chapter.sections.find(s => s.id === hash);
          if (matchedSection) {
            setActiveChapterId(chapter.id);
            setPendingScrollTarget(hash);
            break;
          }
        }
      }
    }
  }, []);

  const handleCopyLink = (secId: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#${secId}`;
      navigator.clipboard.writeText(url);
      setCopiedSectionId(secId);
      setTimeout(() => {
        setCopiedSectionId(null);
      }, 2000);
    }
  };

  React.useEffect(() => {
    const currentChapter = DOCS_DATA.find(c => c.id === activeChapterId);
    if (currentChapter) {
      const cleanTitle = currentChapter.title.replace(/^\d+\.\s+/, '');
      document.title = `${cleanTitle} | Docs | Clerixs`;
    } else {
      document.title = 'Documentation | Clerixs';
    }
  }, [activeChapterId]);

  // Handle scrolling after page content updates or clicks
  React.useEffect(() => {
    if (!pendingScrollTarget) return;

    const mainPane = document.getElementById('docs-main-pane');
    if (mainPane) {
      if (pendingScrollTarget === 'top') {
        const originalScrollBehavior = mainPane.style.scrollBehavior;
        mainPane.style.scrollBehavior = 'auto';
        mainPane.scrollTop = 0;
        mainPane.style.scrollBehavior = originalScrollBehavior;
      } else {
        const element = document.getElementById(pendingScrollTarget);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const originalScrollBehavior = mainPane.style.scrollBehavior;
          mainPane.style.scrollBehavior = 'auto';
          mainPane.scrollTop = 0;
          mainPane.style.scrollBehavior = originalScrollBehavior;
        }
      }
    }
    setPendingScrollTarget(null);
  }, [activeChapterId, pendingScrollTarget]);

  // Search filter
  const filteredDocs = DOCS_DATA.map(chapter => {
    // If search query is empty, return chapter unchanged
    if (!searchQuery) return chapter;

    // Filter sections that match search query
    const matchingSections = chapter.sections.filter(sec => 
      sec.heading.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingSections.length > 0 || chapter.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return {
        ...chapter,
        sections: matchingSections.length > 0 ? matchingSections : chapter.sections
      };
    }

    return null;
  }).filter(Boolean) as typeof DOCS_DATA;

  const currentChapter = DOCS_DATA.find(c => c.id === activeChapterId) || DOCS_DATA[0];

  const handleChapterClick = (id: string) => {
    setActiveChapterId(id);
    setMobileMenuOpen(false);
    setPendingScrollTarget('top');
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        // Handle internal subheading link in the same chapter
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          handleSubheadingClick(targetId);
          return;
        }

        // Split url path and hash
        const [urlPath, hash] = href.split('#');
        const fileName = urlPath.split('/').pop() || '';
        
        if (fileName.endsWith('.md')) {
          const chapterId = fileToChapterId(fileName);
          if (chapterId) {
            e.preventDefault();
            if (chapterId !== activeChapterId) {
              setActiveChapterId(chapterId);
              setMobileMenuOpen(false);
              setPendingScrollTarget(hash || 'top');
            } else if (hash) {
              handleSubheadingClick(hash);
            } else {
              setPendingScrollTarget('top');
            }
          }
        }
      }
    }
  };

  const handleSubheadingClick = (secId: string) => {
    const element = document.getElementById(secId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white/95 px-4 md:px-8 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
              <Image
                src="/assets/logo.png"
                alt="Clerixs Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Clerixs</span>
          </Link>
          <span className="h-5 w-px bg-slate-200" />
          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            Docs
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md mx-6 hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            type="search"
            placeholder="Search documentation..."
            className="w-full bg-slate-50 border-slate-200 pl-9 pr-4 h-9 text-xs rounded-lg focus-visible:ring-blue-600/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="text-slate-500 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5 transition-colors hidden sm:flex">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          
          {/* Mobile hamburger menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-xs h-9 px-4 rounded-lg">
            <Link href="/auth/login">Login to Clinic</Link>
          </Button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Navigation Sidebar */}
        <aside className={cn(
          "fixed inset-y-16 left-0 z-30 w-72 bg-white border-r flex flex-col transition-all duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] shrink-0 overflow-y-auto shadow-lg md:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          {/* Mobile Search input inside drawer */}
          <div className="p-4 border-b sm:hidden bg-slate-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                type="search"
                placeholder="Search documentation..."
                className="w-full bg-white border-slate-200 pl-8 h-8 text-xs rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 select-none">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Chapters</p>
            {filteredDocs.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 italic">No matching chapters</p>
            ) : (
              filteredDocs.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 text-left",
                    activeChapterId === chapter.id 
                      ? "bg-blue-50 text-blue-600 shadow-[inset_3px_0_0_0_#2563eb]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <span className="truncate">{chapter.title}</span>
                  <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 opacity-40 transition-transform", activeChapterId === chapter.id && "rotate-90 opacity-80 text-blue-600")} />
                </button>
              ))
            )}
          </nav>

          <div className="p-4 border-t bg-slate-50 text-center flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Need more help?</p>
            <p className="text-xs text-slate-600 leading-normal font-medium">Our dedicated clinical team is available 9 AM – 6 PM IST.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1 font-bold text-[11px] h-8 bg-white border-slate-200 cursor-pointer"
              onClick={() => {
                setSupportCategory('Technical Support');
                setSupportOpen(true);
              }}
            >
              <span className="flex items-center justify-center gap-1.5 font-bold">
                <HelpCircle className="h-3.5 w-3.5 text-blue-600" /> Contact Support
              </span>
            </Button>
          </div>
        </aside>

        {/* Content & outline viewpane */}
        <div className="flex-1 flex overflow-hidden min-w-0 font-sans" id="docs-content-pane">
          
          {/* Main text pane */}
          <main id="docs-main-pane" onClick={handleContentClick} className="flex-1 overflow-y-auto px-4 py-8 md:p-12 lg:px-16 bg-white flex flex-col h-full scroll-smooth">
            <div className="max-w-3xl w-full mx-auto space-y-8 flex-1">
              
              {/* Header Title Block */}
              <div className="border-b pb-6 space-y-2 group/header flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                    <BookOpen className="h-4 w-4" />
                    Documentation Guide
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{currentChapter.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{currentChapter.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink(currentChapter.id)}
                  className="opacity-0 group-hover/header:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                  title="Copy link to this chapter"
                >
                  {copiedSectionId === currentChapter.id ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 flex items-center gap-1">
                      Copied!
                    </span>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" /> Share Chapter
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Chapter Sections Rendering */}
              <div className="space-y-12">
                {currentChapter.sections.map((section) => (
                  <section 
                    key={section.id} 
                    id={section.id} 
                    className="space-y-4 pt-4 first:pt-0 scroll-mt-20 border-b border-slate-100 pb-8 last:border-none"
                  >
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 group">
                      <span className="w-1 h-6 bg-blue-600 rounded-full shrink-0" />
                      {section.heading}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(section.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 focus:opacity-100 cursor-pointer"
                        title="Copy link to this section"
                      >
                        {copiedSectionId === section.id ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5 animate-pulse">
                            Copied!
                          </span>
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                      </button>
                    </h3>
                    <div className="text-slate-700 text-sm leading-relaxed space-y-4 font-normal">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>

              {/* Simple Navigation footer */}
              <div className="pt-10 border-t flex justify-between items-center gap-4 text-xs text-slate-400">
                <p>Clerixs Platform Guide v1.0 • May 2026</p>
                <div className="flex items-center gap-1.5 transition-all duration-300 min-h-[24px]">
                  {feedback ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
                      ✓ Thanks for your feedback!
                    </span>
                  ) : (
                    <>
                      Was this helpful? 
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer font-bold animate-fade-in"
                        onClick={() => setFeedback('yes')}
                      >
                        Yes
                      </Button>
                      /
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer font-bold animate-fade-in"
                        onClick={() => setFeedback('no')}
                      >
                        No
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Right Outline Sidebar (On This Page outline) - hidden on tablet/mobile screens */}
          <aside className="w-64 border-l bg-slate-50 p-6 overflow-y-auto shrink-0 hidden lg:block h-[calc(100vh-4rem)] sticky top-16 select-none">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On This Page</p>
              <nav className="space-y-2">
                {currentChapter.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSubheadingClick(section.id)}
                    className="block text-left text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors py-0.5 truncate w-full hover:underline"
                  >
                    {section.heading}
                  </button>
                ))}
              </nav>
              
              <div className="border-t border-slate-200 pt-6 mt-6 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Laptop className="h-3.5 w-3.5 text-slate-400" />
                  Technical Links
                </div>
                <div className="space-y-2 text-xs">
                  <button 
                    type="button"
                    onClick={() => {
                      setSupportCategory('Sales Inquiry');
                      setSupportOpen(true);
                    }}
                    className="flex items-center justify-between text-slate-600 hover:text-blue-600 transition-colors text-left w-full cursor-pointer font-bold text-xs"
                  >
                    Contact Sales <ExternalLink className="h-3 w-3 opacity-60" />
                  </button>
                  <Link href="/terms-of-service" className="flex items-center justify-between text-slate-600 hover:text-blue-600 transition-colors">
                    Terms of Service <ExternalLink className="h-3 w-3 opacity-60" />
                  </Link>
                  <Link href="/privacy-policy" className="flex items-center justify-between text-slate-600 hover:text-blue-600 transition-colors">
                    Privacy Policy <ExternalLink className="h-3 w-3 opacity-60" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
      
      <SupportModal 
        open={supportOpen} 
        onOpenChange={setSupportOpen} 
        initialCategory={supportCategory} 
      />
    </div>
  );
}
