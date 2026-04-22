'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { updateSampleStatus, submitLabResults } from '@/app/(app)/lab/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, Clock, Printer, User, FlaskConical, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function OrderManagementView({ order, tests }: { order: any, tests: any[] }) {
  const sample = order.lab_samples?.[0];
  const [sampleStatus, setSampleStatus] = React.useState(sample?.status || 'pending');
  const [barcode, setBarcode] = React.useState(sample?.barcode || '');
  const [loadingSample, setLoadingSample] = React.useState(false);

  // Result Form State -> Map of param_id -> { result_value, is_abnormal }
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

  const handleUpdateSample = async () => {
    setLoadingSample(true);
    const newStatus = sampleStatus === 'pending' ? 'collected' : sampleStatus;
    const res = await updateSampleStatus(order.id, newStatus, barcode);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Sample status updated');
      if (newStatus === 'collected') setSampleStatus('collected');
    }
    setLoadingSample(false);
  };

  const handleResultChange = (paramId: string, value: string, paramConfig: any) => {
    let is_abnormal = false;

    // Check abnormal condition
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
          is_abnormal = true; // Non-numeric entered in a quantitative field
        }
      } else if (expectedStr) {
        if (value.trim().toLowerCase() !== expectedStr.toLowerCase()) is_abnormal = true;
      }
    }

    setResults(prev => ({
      ...prev,
      [paramId]: { result_value: value, is_abnormal }
    }));
  };

  const handleSubmitResults = async () => {
    setLoadingResults(true);
    
    // Construct flat array
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
    else toast.success('Results saved and order marked as completed successfully!');
    setLoadingResults(false);
  };

  const isCompleted = order.status === 'completed';

  if (order.is_external) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col items-center max-w-2xl mx-auto space-y-6 text-center mt-12">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
          <FlaskConical className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">External Lab Report</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            This report was uploaded externally and does not follow the internal sample tracking workflow.
          </p>
        </div>
        
        {order.notes && (
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-left w-full border">
            <p className="font-semibold mb-1">Notes:</p>
            <p className="whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        <div className="pt-2 flex justify-center gap-4 w-full">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/lab">Back to Dashboard</Link>
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
            <a href={order.external_report_url} target="_blank" rel="noopener noreferrer">View Document</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* LEFT COL: Patient & Sample Info */}
      <div className="space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><User className="h-4 w-4"/> Patient Info</h3>
            <Badge variant="outline" className="font-mono text-xs">{order.patients?.patient_code}</Badge>
          </div>
          <div>
            <p className="text-xl font-bold">{order.patients?.full_name}</p>
            <div className="text-sm text-muted-foreground mt-1 space-y-1">
              <p>Gender: <span className="capitalize">{order.patients?.gender?.replace('_', ' ') || '-'}</span></p>
              <p>DOB: {order.patients?.date_of_birth ? format(new Date(order.patients?.date_of_birth), 'PP') : '-'}</p>
              <p>Ordered: {format(new Date(order.order_date), 'PP p')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><FlaskConical className="h-4 w-4"/> Sample Tracking</h3>
            <Badge variant={sampleStatus === 'collected' ? 'default' : 'secondary'} className="capitalize">
              {sampleStatus}
            </Badge>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Sample Type</Label>
              <p className="font-medium text-foreground">{sample?.sample_type || 'Unknown'}</p>
            </div>
            <div className="space-y-2">
              <Label>Barcode / Accession #</Label>
              <Input 
                value={barcode} 
                onChange={(e) => setBarcode(e.target.value)} 
                placeholder="Scan or enter barcode" 
                disabled={isCompleted}
              />
            </div>
            {!isCompleted && (
              <Button 
                variant={sampleStatus === 'pending' ? 'default' : 'outline'} 
                className="w-full" 
                onClick={handleUpdateSample}
                disabled={loadingSample}
              >
                {sampleStatus === 'pending' ? 'Mark Sample as Collected' : 'Update Barcode'}
              </Button>
            )}
            {sample?.collected_at && (
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Collected {format(new Date(sample.collected_at), 'MMM d, h:mm a')}
              </p>
            )}
          </div>
        </div>

        {isCompleted && (
          <div className="rounded-xl border bg-green-50 text-green-900 border-green-200 shadow-sm p-6 space-y-3">
             <div className="flex items-center gap-2 font-semibold">
               <CheckCircle className="h-5 w-5 text-green-600" /> Report Finalized
             </div>
             <p className="text-sm opacity-90">All test results have been saved and validated. The report is ready to be printed or shared with the patient.</p>
             <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" asChild>
               <Link href={`/lab/print/${order.id}`}>
                 <Printer className="w-4 h-4" /> Print Final Report
               </Link>
             </Button>
          </div>
        )}
      </div>

      {/* RIGHT COL: Results Entry */}
      <div className="md:col-span-2 space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-0 overflow-hidden">
          <div className="p-6 border-b bg-muted/20 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Test Results Entry</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter values below. Abnormal values will be flagged automatically.</p>
            </div>
            {sampleStatus === 'pending' && <Badge variant="destructive">Needs Collection</Badge>}
          </div>

          <div className="p-0">
            {tests.map((test: any, testIdx: number) => (
              <div key={test.id} className="border-b last:border-0 border-muted">
                <div className="bg-muted/40 px-6 py-3 border-y font-semibold text-foreground flex justify-between uppercase text-xs tracking-wider">
                  <span>{test.name}</span>
                </div>
                
                {(!test.lab_test_parameters || test.lab_test_parameters.length === 0) ? (
                  <div className="px-6 py-4 text-sm text-muted-foreground italic">No measurable parameters defined for this test.</div>
                ) : (
                  <div className="divide-y">
                    {test.lab_test_parameters
                      .sort((a: any, b: any) => a.display_order - b.display_order)
                      .map((param: any) => {
                        const val = results[param.id]?.result_value || '';
                        const isAbnormal = results[param.id]?.is_abnormal || false;

                        return (
                          <div key={param.id} className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${isAbnormal ? 'bg-red-50/50' : ''}`}>
                            <div className="flex-1">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {param.name} 
                                {isAbnormal && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 gap-3 flex flex-wrap">
                                {param.reference_range_min || param.reference_range_max ? (
                                  <span>Ref: {param.reference_range_min || '-'} to {param.reference_range_max || '-'} {param.unit}</span>
                                ) : param.expected_string_value ? (
                                  <span>Expected: {param.expected_string_value}</span>
                                ) : (
                                  <span>No ref range set</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 xl:w-1/3">
                              <Input 
                                value={val} 
                                onChange={(e) => handleResultChange(param.id, e.target.value, param)} 
                                placeholder="Enter value" 
                                className={`w-full ${isAbnormal ? 'border-red-500 focus-visible:ring-red-500 text-red-700 bg-red-50' : ''}`}
                                disabled={sampleStatus === 'pending'} // Require collection first
                              />
                              <span className="text-sm font-medium text-muted-foreground w-12">{param.unit}</span>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-muted/20 border-t flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/lab">Back to Dashboard</Link>
            </Button>
            <Button 
              onClick={handleSubmitResults} 
              disabled={loadingResults || sampleStatus === 'pending'}
              className="px-8 shadow-sm"
            >
              {loadingResults ? 'Saving...' : 'Save & Finalize Results'}
            </Button>
          </div>
        </div>
        {sampleStatus === 'pending' && (
          <p className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            You must mark the sample as collected before you can enter test results.
          </p>
        )}
      </div>

    </div>
  );
}
