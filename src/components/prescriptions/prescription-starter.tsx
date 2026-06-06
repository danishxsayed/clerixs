'use client';

import * as React from 'react';
import { 
  FileText, 
  Search, 
  ArrowRight,
  TrendingUp,
  Loader2,
  Stethoscope,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { listPrescriptionTemplates } from '@/app/(app)/patients/[id]/prescriptions/template-actions';

interface PrescriptionStarterProps {
  onSelectTemplate: (template: any) => void;
  onStartBlank: () => void;
}

export function PrescriptionStarter({
  onSelectTemplate,
  onStartBlank,
}: PrescriptionStarterProps) {
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
    fetchTemplates();
  }, [fetchTemplates]);

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

  const recommendations = data.recentlyUsed.length > 0 ? data.recentlyUsed : data.mostUsed;
  const isFallback = data.recentlyUsed.length === 0;

  return (
    <div className="flex flex-col space-y-0 text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
      {/* Search & Header */}
      <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search all templates..."
              className="pl-9 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-950 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={onStartBlank}
            variant="outline"
            className="h-11 px-4 border-dashed border-2 border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary transition-all font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Start Blank
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh]">
        {/* Recommendations Grid */}
        <div className="bg-orange-50/50 dark:bg-orange-950/20 p-6 space-y-4 border-b border-orange-100/50 dark:border-orange-950/30">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            {isFallback ? "Most Used Recommendations" : "Recently Used"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white/50 dark:bg-slate-800/50 animate-pulse rounded-xl" />
              ))
            ) : recommendations.length === 0 ? (
              <div className="md:col-span-3 text-center py-6 text-orange-400 dark:text-orange-300 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-orange-200 dark:border-orange-900/50">
                No templates found yet.
              </div>
            ) : (
              recommendations.map((t) => (
                <button 
                  key={t.id} 
                  onClick={() => onSelectTemplate(t)}
                  className="group bg-white dark:bg-slate-900/90 p-4 rounded-xl shadow-sm border border-orange-100 dark:border-orange-950/50 flex flex-col space-y-3 text-left hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{t.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">{t.diagnosis || 'Standard Protocol'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      {Array.isArray(t.medicines) ? t.medicines.length : 0} Meds
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-orange-400 dark:text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* All Templates Grid */}
        <div className="p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            {searchQuery ? "Filter Results" : "All Clinic Templates"}
          </h3>
          
          {filteredTemplates.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Stethoscope className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No matching templates</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-left hover:border-primary hover:shadow-lg transition-all focus:outline-none"
                >
                  <div className="w-full flex items-start justify-between mb-3 text-left">
                    <div className="space-y-1 flex-1">
                      <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors block">
                        {template.name}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {template.diagnosis || 'General Case'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full pt-3 mt-auto border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {Array.isArray(template.medicines) ? template.medicines.length : 0} Medicines listed
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
