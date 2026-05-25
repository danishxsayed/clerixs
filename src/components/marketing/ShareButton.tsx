'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ShareButton() {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Blog link copied! Share it with your colleagues.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
    >
      <Share2 size={14} />
      <span>Share Post</span>
    </button>
  );
}
