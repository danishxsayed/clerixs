'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { updateSampleStatus, submitLabResults, approveLabReport, requestLabRevision } from '@/app/(app)/lab/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Clock, 
  Printer, 
  User, 
  FlaskConical, 
  AlertTriangle, 
  Save, 
  Check, 
  History,
  FileText,
  Activity,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- Sub-components (Styled to match Clerixs UI) ---

const WorkflowStep = ({ 
  label, 
  isActive, 
  isCompleted, 
  isLast 
}: { 
  label: string; 
  isActive: boolean; 
  isCompleted: boolean; 
  isLast?: boolean;
}) => (
  <div className="flex items-center">
    <div className="flex flex-col items-center gap-2">
      <div 
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
          isCompleted ? "bg-green-600 border-green-600 text-white" : 
          isActive ? "bg-background border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm" : 
          "bg-background border-muted text-muted-foreground"
        )}
      >
        {isCompleted ? <Check className="h-4 w-4 text-white" /> : <div className="h-2 w-2 rounded-full bg-current" />}
      </div>
      <span 
        className={cn(
          "text-[11px] font-semibold uppercase tracking-tight",
          isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
    {!isLast && (
      <div className="w-12 sm:w-24 h-[2px] mx-4 bg-muted overflow-hidden mb-6">
        <motion.div 
          className="h-full bg-green-600 font-outfit"
          initial={{ width: 0 }}
          animate={{ width: isCompleted ? "100%" : "0%" }}
        />
      </div>
    )}
  </div>
);

export function OrderManagementView({ order, tests, userRole }: { order: any, tests: any[], userRole: string }) {
  const sample = order.lab_samples?.[0];
  const [sampleStatus, setSampleStatus] = React.useState(sample?.status || 'pending');
  const [barcode, setBarcode] = React.useState(sample?.barcode || '');
  const [loadingSample, setLoadingSample] = React.useState(false);

  // Result Form State
  const initialResults = React.useMemo(() => {
    const map: Record<string, any> = {};
    if (order.lab_results && order.lab_results.length > 0) {
      order.lab_results.forEach((r: any) => {
        map[r.lab_test_parameter_id] = { result_value: r.result_value, is_abnormal: r.is_abnormal };
      });
    }
    return map;
  }, [order.lab_results]);

  const [results, setResults] = React.useState<Record<string, any>>(initialResults);
  const [loadingResults, setLoadingResults] = React.useState(false);
  const [doctorComments, setDoctorComments] = React.useState(order.doctor_comments || '');
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRevising, setIsRevising] = React.useState(false);

  const handleUpdateSample = async () => {
    setLoadingSample(true);
    const newStatus = sampleStatus === 'pending' ? 'collected' : sampleStatus;
    const res = await updateSampleStatus(order.id, newStatus, barcode);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Sample updated');
      if (newStatus === 'collected') setSampleStatus('collected');
    }
    setLoadingSample(false);
  };

  const handleResultChange = (paramId: string, value: string, paramConfig: any) => {
    let is_abnormal = false;
    if (value && value.trim() !== '') {
      const expectedStr = paramConfig.expected_string_value?.trim();
      const hasMin = paramConfig.reference_range_min !== null && paramConfig.reference_range_min !== undefined && String(paramConfig.reference_range_min).trim() !== '';
      const hasMax = paramConfig.reference_range_max !== null && paramConfig.reference_range_max !== undefined && String(paramConfig.reference_range_max).trim() !== '';

      if (hasMin || hasMax) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (hasMin && numValue < parseFloat(paramConfig.reference_range_min)) is_abnormal = true;
          if (hasMax && numValue > parseFloat(paramConfig.reference_range_max)) is_abnormal = true;
        } else {
          is_abnormal = true;
        }
      } else if (expectedStr) {
        if (value.trim().toLowerCase() !== expectedStr.toLowerCase()) is_abnormal = true;
      }
    }
    setResults(prev => ({ ...prev, [paramId]: { result_value: value, is_abnormal } }));
  };

  const handleSubmitResults = async () => {
    setLoadingResults(true);
    const resultsData: any[] = [];
    tests.forEach((test: any) => {
      test.lab_test_parameters?.forEach((param: any) => {
        const val = results[param.id];
        if (val && val.result_value !== undefined && val.result_value.trim() !== '') {
          resultsData.push({
            lab_test_id: test.id,
            lab_test_parameter_id: param.id,
            result_value: val.result_value,
            is_abnormal: val.is_abnormal
          });
        }
      });
    });
    const res = await submitLabResults(order.id, resultsData);
    if (res.error) toast.error(res.error);
    else toast.success('Results submitted for doctor review.');
    setLoadingResults(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    const res = await approveLabReport(order.id, doctorComments);
    if (res.error) toast.error(res.error);
    else toast.success('Report approved and finalized!');
    setIsApproving(false);
  };

  const handleRequestRevision = async () => {
    if (!doctorComments.trim()) {
      toast.error('Please clarify the requested changes');
      return;
    }
    setIsRevising(true);
    const res = await requestLabRevision(order.id, doctorComments);
    if (res.error) toast.error(res.error);
    else toast.success('Revision requested successfully.');
    setIsRevising(false);
  };

  const isCompleted = order.status === 'completed';
  const isDoctorOrOwner = userRole === 'doctor' || userRole === 'org_owner';

  const showReviewActions = isDoctorOrOwner && !isCompleted && 
    (order.status === 'submitted' || order.status === 'ordered' || order.status === 'sample_collected' || order.status === 'revision_requested');

  if (order.is_external) {
    return (
      <Card className="max-w-2xl mx-auto mt-12 p-12 text-center space-y-6">
        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
           <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold">External Lab Report</h3>
        <p className="text-muted-foreground">{order.notes || "This is an externally uploaded report."}</p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" asChild><Link href="/lab">Back</Link></Button>
          <Button className="flex-1" asChild><a href={order.external_report_url} target="_blank" rel="noopener noreferrer">View Document</a></Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20">
      
      {/* 1. Progress Stepper */}
      <Card className="p-6 overflow-hidden">
        <div className="flex justify-center items-center">
          <WorkflowStep label="Ordered" isActive={order.status === 'ordered'} isCompleted={true} />
          <WorkflowStep label="Collected" isActive={sampleStatus === 'collected'} isCompleted={sampleStatus === 'collected' || isCompleted} />
          <WorkflowStep label="Submitted" isActive={order.status === 'submitted'} isCompleted={order.status === 'submitted' || isCompleted} />
          <WorkflowStep label="Completed" isActive={isCompleted} isCompleted={isCompleted} isLast />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Patient Context
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="text-lg font-bold">{order.patients?.full_name}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] uppercase">{order.patients?.patient_code}</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">{order.patients?.gender}</Badge>
                </div>
              </div>
              <Separator />
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span className="font-medium">{format(new Date(order.order_date), 'dd MMM, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium capitalize">{userRole.replace('_', ' ')}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between pt-2 text-green-600 font-bold border-t">
                    <span>Discount:</span>
                    <span>-₹{order.discount_amount}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-600">
                <FlaskConical className="h-4 w-4" /> Sample Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Barcode / Identifier</Label>
                  <Input 
                    value={barcode} 
                    onChange={(e) => setBarcode(e.target.value)} 
                    placeholder="Scan or enter ID" 
                    className="mt-1 font-mono"
                    disabled={isCompleted}
                  />
               </div>
               {!isCompleted && (
                 <Button 
                   className={cn(
                     "w-full gap-2",
                     sampleStatus === 'pending' 
                       ? "bg-orange-600 hover:bg-orange-700 text-white" 
                       : "bg-background hover:bg-muted text-foreground border shadow-none"
                   )}
                   onClick={handleUpdateSample}
                   disabled={loadingSample}
                 >
                   {sampleStatus === 'pending' ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                   {sampleStatus === 'pending' ? 'Collect Sample' : 'Update ID'}
                 </Button>
               )}
            </CardContent>
          </Card>

          {isCompleted && (
            <Card className="bg-green-600 text-white border-green-700">
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle className="h-10 w-10 mx-auto" />
                <div>
                  <h4 className="font-bold text-lg">Report Finalized</h4>
                  <p className="text-sm opacity-80">The medical report is validated and ready.</p>
                </div>
                <Button variant="secondary" className="w-full gap-2" asChild>
                  <Link href={`/lab/print/${order.id}`}>
                    <Printer className="h-4 w-4" /> Print Final Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results & Actions Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Review Notice */}
          <AnimatePresence>
            {(order.status === 'submitted' || order.status === 'revision_requested') && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-xl border flex gap-4 items-start shadow-sm",
                  order.status === 'submitted' 
                    ? "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30" 
                    : "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                )}
              >
                <div className="mt-1">
                  {order.status === 'submitted' 
                    ? <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" /> 
                    : <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                </div>
                <div className="space-y-1">
                  <h5 className={cn(
                    "text-sm font-bold", 
                    order.status === 'submitted' 
                      ? "text-blue-900 dark:text-blue-400" 
                      : "text-red-900 dark:text-red-400"
                  )}>
                    {order.status === 'submitted' ? 'Review Submission' : 'Revision Feedback'}
                  </h5>
                  {order.doctor_comments && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic border-l-2 border-red-200 dark:border-red-900/50 pl-3 py-1">&quot;{order.doctor_comments}&quot;</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="text-lg">Test Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {tests.map((test: any) => (
                 <div key={test.id}>
                    <div className="bg-muted/40 px-6 py-2 border-y text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      {test.name}
                    </div>
                    <div className="divide-y">
                       {test.lab_test_parameters?.map((param: any) => {
                         const val = results[param.id]?.result_value || '';
                         const isAbnormal = results[param.id]?.is_abnormal || false;

                         return (
                           <div key={param.id} className={cn(
                             "px-6 py-5 flex items-center justify-between gap-6",
                             isAbnormal ? "bg-red-50/50 dark:bg-red-950/20" : ""
                           )}>
                             <div className="flex-1">
                               <div className="text-sm font-semibold flex items-center gap-2">
                                 {param.name}
                                 {isAbnormal && <AlertTriangle className="h-4 w-4 text-red-500" />}
                               </div>
                               <div className="text-xs text-muted-foreground mt-1">
                                 Norm: {param.reference_range_min || param.reference_range_max ? `${param.reference_range_min || ''}-${param.reference_range_max || ''}` : param.expected_string_value || 'N/A'} {param.unit}
                               </div>
                             </div>
                             <div className="flex items-center gap-3 w-40 shrink-0">
                               <Input 
                                 value={val} 
                                 onChange={(e) => handleResultChange(param.id, e.target.value, param)} 
                                 className={cn("h-9 font-medium", isAbnormal && "border-red-500 focus-visible:ring-red-500")}
                                 disabled={sampleStatus === 'pending' || isCompleted}
                               />
                               <span className="text-[10px] font-bold text-muted-foreground uppercase w-8">{param.unit}</span>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
               ))}
            </CardContent>
            
            <CardFooter className="bg-muted/10 border-t p-6 flex justify-between items-center">
                <Button variant="outline" asChild><Link href="/lab">Back to Dashboard</Link></Button>
                {!isCompleted && (order.status !== 'submitted' || isDoctorOrOwner) && (
                  <Button 
                    onClick={handleSubmitResults} 
                    disabled={loadingResults || sampleStatus === 'pending'}
                    className="gap-2 px-8"
                  >
                    {loadingResults ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {order.status === 'revision_requested' ? 'Resubmit Data' : (order.status === 'submitted' ? 'Save Updates' : 'Submit Results')}
                  </Button>
                )}
            </CardFooter>
          </Card>

          {/* Dedicated Doctor Action Area */}
          <AnimatePresence>
            {showReviewActions && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800 dark:text-blue-400 uppercase tracking-widest">
                      <CheckCircle className="h-4 w-4" /> Medical Interpretation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea 
                      className="w-full h-24 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-background text-foreground p-3 text-sm focus:ring-blue-500 font-outfit" 
                      placeholder="Add medical notes or instructions..."
                      value={doctorComments}
                      onChange={(e) => setDoctorComments(e.target.value)}
                    />
                    <div className="flex gap-4">
                       <Button 
                         variant="outline" 
                         className="flex-1 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20"
                         onClick={handleRequestRevision}
                         disabled={isApproving || isRevising}
                       >
                         Request Revision
                       </Button>
                       <Button 
                         className="flex-1 bg-green-600 hover:bg-green-700"
                         onClick={handleApprove}
                         disabled={isApproving || isRevising}
                       >
                         {isApproving ? 'Finalizing...' : 'Approve & Finalize Report'}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
