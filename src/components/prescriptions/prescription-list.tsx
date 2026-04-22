'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Plus, Printer, FileText, Edit2, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { PrescriptionForm } from './prescription-form';
import { PrescriptionStarter } from './prescription-starter';
import { sendWhatsAppPrescriptionAction } from '@/app/actions/whatsapp-actions';
import { toast } from 'sonner';

export function PrescriptionList({ 
  patientId, 
  prescriptions, 
  userRole, 
  patientName, 
  patientPhone 
}: { 
  patientId: string, 
  prescriptions: any[], 
  userRole?: string,
  patientName?: string,
  patientPhone?: string
}) {
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editingPrescription, setEditingPrescription] = React.useState<any | null>(null);
  const [workflowStep, setWorkflowStep] = React.useState<'select' | 'form'>('select');
  const [selectedTemplate, setSelectedTemplate] = React.useState<any | null>(null);

  const [isSending, setIsSending] = React.useState<string | null>(null);
  const canEdit = userRole === 'doctor' || userRole === 'org_owner';

  const handleClose = () => {
    setOpenCreate(false);
    setEditingPrescription(null);
    setWorkflowStep('select');
    setSelectedTemplate(null);
  };

  const handleStartBlank = () => {
    setSelectedTemplate(null);
    setWorkflowStep('form');
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setWorkflowStep('form');
  };

  const handleSendWhatsApp = async (px: any) => {
    if (!patientPhone) {
      toast.error("Patient phone number is missing.");
      return;
    }

    setIsSending(px.id);
    try {
      const pdfUrl = `${window.location.origin}/prescriptions/print/${px.id}`;
      
      const result = await sendWhatsAppPrescriptionAction({
        prescriptionId: px.id,
        pdfUrl,
        patientPhone,
        patientName: patientName || 'Patient',
        clinicName: 'Clerixs' // Fallback, the action will try to fetch from DB
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Prescription sent successfully via WhatsApp!");
        if (result.warning) {
          toast.warning(result.warning);
        }
      }
    } catch (error) {
      console.error("WhatsApp Send Error:", error);
      toast.error("Failed to send WhatsApp message.");
    } finally {
      setIsSending(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Medical Prescriptions</CardTitle>
          <CardDescription>History of medications prescribed to this patient</CardDescription>
        </div>
        
        
        {canEdit && (
          <Dialog open={openCreate || !!editingPrescription} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <Button size="sm" onClick={() => setOpenCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Prescription
            </Button>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto w-full">
              <DialogHeader>
                <DialogTitle id="px-list-title">
                  {editingPrescription 
                    ? 'Edit Prescription' 
                    : workflowStep === 'select' 
                      ? 'Choose Prescription Template' 
                      : 'Create New Prescription'}
                </DialogTitle>
                <DialogDescription id="px-list-description">
                  {editingPrescription 
                    ? 'Update the diagnosis and prescribed medications.' 
                    : workflowStep === 'select'
                      ? 'Select a protocol to speed up your workflow or start from scratch.'
                      : 'Customize your prescription below.'}
                </DialogDescription>
              </DialogHeader>

              {editingPrescription || workflowStep === 'form' ? (
                <PrescriptionForm 
                  patientId={patientId} 
                  onSuccess={handleClose} 
                  prescriptionId={editingPrescription?.id}
                  initialData={editingPrescription ? {
                    diagnosis: editingPrescription.diagnosis,
                    instructions: editingPrescription.instructions,
                    medicines: editingPrescription.prescription_items?.map((item: any) => ({
                      ...item,
                      notes: item.notes || ''
                    }))
                  } : selectedTemplate ? {
                    diagnosis: selectedTemplate.diagnosis || '',
                    instructions: selectedTemplate.general_advice || '',
                    medicines: selectedTemplate.medicines || []
                  } : undefined}
                />
              ) : (
                <PrescriptionStarter 
                  onSelectTemplate={handleSelectTemplate}
                  onStartBlank={handleStartBlank}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent>
        {prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg">
            <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm">No prescriptions have been recorded yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Medicines</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((px: any) => (
                <TableRow key={px.id}>
                  <TableCell className="font-medium">
                    {format(new Date(px.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {px.doctor_membership_id?.profiles?.full_name || 'Unknown Doctor'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {px.diagnosis || 'General'}
                  </TableCell>
                  <TableCell>
                    {px.prescription_items?.length || 0} drugs
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => setEditingPrescription(px)}>
                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSendWhatsApp(px)}
                      disabled={isSending === px.id}
                      className="border-green-200 hover:border-green-500 hover:bg-green-50 text-green-700"
                    >
                      {isSending === px.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/prescriptions/print/${px.id}`, '_blank')}>
                      <Printer className="h-4 w-4 mr-2" /> Print PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
