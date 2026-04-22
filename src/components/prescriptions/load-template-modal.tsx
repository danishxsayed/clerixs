'use client';

import * as React from 'react';
import { 
  FileText, 
  Search, 
  ArrowRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { listPrescriptionTemplates, incrementTemplateUsage } from '@/app/(app)/patients/[id]/prescriptions/template-actions';
import { cn } from '@/lib/utils';

interface LoadTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: any) => void;
}

export function LoadTemplateModal({
  open,
  onOpenChange,
  onSelect,
}: LoadTemplateModalProps) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{
    templates: any[];
    recentlyUsed: any[];
    mostUsed: any[];
  }>({ templates: [], recentlyUsed: [], mostUsed: [] });
  
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPrescriptionTemplates();
      if (result) {
        setData({
          templates: result.templates || [],
          recentlyUsed: result.recentlyUsed || [],
          mostUsed: result.mostUsed || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, fetchTemplates]);

  const filteredTemplates = data.templates.filter((t) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(query) ||
        (t.diagnosis && t.diagnosis.toLowerCase().includes(query))
      );
    }
    return true;
  });

  async function handleSelect(template: any) {
    onSelect(template);
    incrementTemplateUsage(template.id);
    onOpenChange(false);
  }

  const recommendationTitle = data.recentlyUsed.length > 0 ? "Recently Used" : "Most Used Recommendations";
  const recommendations = data.recentlyUsed.length > 0 ? data.recentlyUsed : data.mostUsed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 text-slate-900">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-left">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-6 w-6 text-primary" />
                Load Prescription Template
              </DialogTitle>
              <DialogDescription>
                Select a medical protocol to auto-fill the form.
              </DialogDescription>
            </div>
            {data.mostUsed.length > 0 && (
              <Button 
                onClick={() => handleSelect(data.mostUsed[0])}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Apply Most Used
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Section 1: Recommendations */}
          <div className="bg-orange-50/50 p-6 space-y-4 border-b border-orange-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-orange-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {recommendationTitle}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loading ? (
                 Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-32 bg-white/50 animate-pulse rounded-xl" />
                 ))
              ) : recommendations.length === 0 ? (
                <div className="md:col-span-3 text-center py-6 text-orange-400 bg-white/50 rounded-xl border border-dashed border-orange-200">
                  No recently used templates yet.
                </div>
              ) : (
                recommendations.map((t) => (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col space-y-3">
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-slate-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{t.diagnosis || 'Generic Protocol'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {Array.isArray(t.medicines) ? t.medicines.length : 0} medicines
                      </span>
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="h-auto p-0 text-xs font-bold text-orange-600 hover:text-orange-700"
                        onClick={() => handleSelect(t)}
                      >
                        Use Template <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: All Templates */}
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by template name or diagnosis..."
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="group flex flex-col bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-primary hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <div className="w-full flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {template.name}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {template.diagnosis || 'General Case'}
                      </p>
                    </div>
                    {template.usage_count > 5 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        🔥 Popular
                      </div>
                    )}
                  </div>

                  <div className="w-full pt-3 mt-auto border-t border-slate-50 flex items-center justify-between">
                    <div className="flex-1 flex flex-col gap-1">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Medicines</p>
                      <p className="text-[11px] text-slate-500 font-medium truncate italic max-w-[200px]">
                        {Array.isArray(template.medicines) 
                          ? template.medicines.map((m: any) => m.medicine_name).slice(0, 2).join(', ') + (template.medicines.length > 2 ? '...' : '') 
                          : 'No meds listed'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Used</p>
                      <span className="text-[11px] font-bold text-slate-700">{template.usage_count} times</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {filteredTemplates.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FileText className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No templates matching your search</p>
                  <p className="text-xs text-slate-400">Try clinical terms or check other templates</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
