'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Trash2, Check, ChevronsUpDown, Sun, Sunset, Moon, FileText, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createPrescription, updatePrescription } from '@/app/(app)/patients/[id]/prescriptions/actions';
import { searchMedicines, addMedicine } from '@/app/(app)/patients/[id]/prescriptions/medicine-actions';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LoadTemplateModal } from './load-template-modal';
import { SaveTemplateModal } from './save-template-modal';
import { Badge } from '@/components/ui/badge';

const rxSchema = z.object({
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  instructions: z.string().optional(),
  medicines: z.array(z.object({
    medicine_name: z.string().min(2, 'Medicine name required'),
    dosage: z.string().min(1, 'Required (e.g. 500mg)'),
    frequency: z.string().min(1, 'Required'),
    duration_days: z.coerce.number().min(1, 'Min 1 day'),
    notes: z.string().optional()
  })).min(1, 'At least one medicine is required')
});

// A localized debouncer hook could be used, but keeping it simple with inline debounce or direct calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function PrescriptionForm({
  patientId,
  onSuccess,
  prescriptionId,
  initialData
}: {
  patientId: string,
  onSuccess: (prescription?: any) => void,
  prescriptionId?: string,
  initialData?: any
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [openAddMedicine, setOpenAddMedicine] = React.useState(false);
  const [addMedicineInitialName, setAddMedicineInitialName] = React.useState('');
  const [activeMedicineIndex, setActiveMedicineIndex] = React.useState<number | null>(null);
  const [openLoadTemplate, setOpenLoadTemplate] = React.useState(false);
  const [openSaveTemplate, setOpenSaveTemplate] = React.useState(false);
  const [loadedTemplateName, setLoadedTemplateName] = React.useState<string | null>(null);
  const [templateData, setTemplateData] = React.useState<{ diagnosis: string; instructions?: string; medicines: any[] } | null>(null);

  const form = useForm<z.infer<typeof rxSchema>>({
    resolver: zodResolver(rxSchema) as any,
    defaultValues: {
      diagnosis: initialData?.diagnosis || '',
      instructions: initialData?.instructions || '',
      medicines: initialData?.medicines || [{ medicine_name: '', dosage: '', frequency: '1-0-1', duration_days: 5, notes: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines"
  });

  React.useEffect(() => {
    form.reset(initialData || {
      diagnosis: '',
      instructions: '',
      medicines: [{ medicine_name: '', dosage: '', frequency: '1-0-1', duration_days: 5, notes: '' }]
    });

    return () => {
      form.reset({
        diagnosis: '',
        instructions: '',
        medicines: [{ medicine_name: '', dosage: '', frequency: '1-0-1', duration_days: 5, notes: '' }]
      });
    };
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof rxSchema>) {
    setIsSubmitting(true);
    try {
      if (prescriptionId) {
        const result = await updatePrescription(prescriptionId, {
          patientId,
          diagnosis: values.diagnosis,
          instructions: values.instructions,
          medicines: values.medicines
        });
        if (result?.error) throw new Error(result.error);
        toast.success('Prescription updated successfully!');
        onSuccess(result.prescription);
      } else {
        const result = await createPrescription({
          patientId,
          diagnosis: values.diagnosis,
          instructions: values.instructions,
          medicines: values.medicines
        });
        if (result?.error) throw new Error(result.error);
        toast.success('Prescription created and saved to history!');
        onSuccess(result.prescription);
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleApplyTemplate(template: any) {
    form.setValue('diagnosis', template.diagnosis || '', { shouldDirty: true });
    form.setValue('instructions', template.general_advice || '', { shouldDirty: true });
    
    if (Array.isArray(template.medicines) && template.medicines.length > 0) {
      form.setValue('medicines', template.medicines, { shouldDirty: true, shouldValidate: true });
    }
    
    setLoadedTemplateName(template.name);
    toast.success(`Template "${template.name}" applied!`);
  }

  // Frequency Toggle Component
  const FrequencyToggles = ({ index }: { index: number }) => {
    const val = form.watch(`medicines.${index}.frequency`) || '0-0-0';
    const parts = val.includes('-') && val.split('-').length === 3 ? val.split('-') : ['0','0','0'];

    const toggle = (pos: number) => {
      const newParts = [...parts];
      newParts[pos] = newParts[pos] === '1' ? '0' : '1';
      // Ensure it doesn't default to empty min(1) fails by enforcing a format
      form.setValue(`medicines.${index}.frequency`, newParts.join('-'), { shouldDirty: true, shouldValidate: true });
    };

    return (
      <div className="flex items-center gap-1.5 mt-2">
        <Button
          type="button"
          variant={parts[0] === '1' ? 'default' : 'outline'}
          size="sm"
          className="h-8 px-2.5 text-xs flex-1 rounded-md"
          onClick={() => toggle(0)}
        >
          <Sun className={cn("h-3 w-3 mr-1.5", parts[0] === '1' && "text-yellow-300")} /> Morn
        </Button>
        <Button
          type="button"
          variant={parts[1] === '1' ? 'default' : 'outline'}
          size="sm"
          className="h-8 px-2.5 text-xs flex-1 rounded-md"
          onClick={() => toggle(1)}
        >
          <Sunset className={cn("h-3 w-3 mr-1.5", parts[1] === '1' && "text-orange-300")} /> Aft
        </Button>
        <Button
          type="button"
          variant={parts[2] === '1' ? 'default' : 'outline'}
          size="sm"
          className="h-8 px-2.5 text-xs flex-1 rounded-md"
          onClick={() => toggle(2)}
        >
          <Moon className={cn("h-3 w-3 mr-1.5", parts[2] === '1' && "text-blue-200")} /> Ngt
        </Button>
      </div>
    );
  };

  // Medicine Autocomplete Hook & State
  const AutocompleteField = ({ index, hasError }: { index: number; hasError?: boolean }) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [results, setResults] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const currentName = form.watch(`medicines.${index}.medicine_name`);

    React.useEffect(() => {
      async function fetchMeds() {
        if (debouncedSearch.length < 2) {
          setResults([]);
          return;
        }
        setLoading(true);
        const { medicines } = await searchMedicines(debouncedSearch);
        setResults(medicines || []);
        setLoading(false);
      }
      fetchMeds();
    }, [debouncedSearch]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className={cn(
          "inline-flex items-center justify-between rounded-md border border-input bg-background px-3 h-10 py-2 text-sm shadow-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full font-normal", 
          !currentName && "text-muted-foreground",
          hasError && "border-red-500 text-red-500 focus-visible:ring-red-500"
        )}>
          <span className="truncate">{currentName || "Search medicine..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Type to search database..." 
              value={search} 
              onValueChange={setSearch} 
            />
            <CommandList>
              {loading && <div className="p-4 text-sm text-center text-muted-foreground">Searching...</div>}
              {!loading && results.length === 0 && search.length >= 2 && (
                <CommandEmpty className="py-4 text-center text-sm">
                  No medicine found.
                </CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup>
                  {results.map((med) => (
                    <CommandItem
                      key={med.id}
                      value={med.generic_name}
                      onSelect={() => {
                        form.setValue(`medicines.${index}.medicine_name`, med.generic_name);
                        form.setValue(`medicines.${index}.dosage`, med.common_dosage || '');
                        setSearch('');
                        setOpen(false);
                      }}
                      className="flex flex-col items-start cursor-pointer"
                    >
                      <span className="font-medium text-sm">{med.generic_name}</span>
                      <span className="text-xs text-muted-foreground">{med.common_dosage} • {med.category || 'General'}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {search.length > 0 && (
                <div className="p-2 border-t mt-1">
                  <Button
                    variant="ghost" 
                    className="w-full justify-start text-sm text-primary font-medium h-auto py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveMedicineIndex(index);
                      setAddMedicineInitialName(search);
                      setOpen(false);
                      setOpenAddMedicine(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add "{search}" to database
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-slate-200">
            Smart Prescribe
          </Badge>
          <p className="text-xs text-muted-foreground font-medium">Use templates to save time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-9 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
            onClick={() => setOpenLoadTemplate(true)}
          >
            <FileText className="h-4 w-4 mr-2 text-primary" />
            Load Template
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-9 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
            onClick={() => {
              const values = form.getValues();
              if (!values.diagnosis && (!values.medicines || values.medicines.length === 0)) {
                toast.error("Please fill the prescription before saving as template.");
                return;
              }
              setTemplateData({
                diagnosis: values.diagnosis || '',
                instructions: values.instructions || '',
                medicines: values.medicines || []
              });
              setOpenSaveTemplate(true);
            }}
          >
            <Save className="h-4 w-4 mr-2 text-primary" />
            Save as Template
          </Button>
        </div>
      </div>

      {loadedTemplateName && (
        <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-sm font-bold truncate">Template loaded: {loadedTemplateName}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-green-600 hover:bg-green-100 rounded-full"
            onClick={() => setLoadedTemplateName(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field, fieldState }) => (
                <FormItem className="bg-white p-5 rounded-xl border shadow-sm">
                  <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Clinical Diagnosis</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Acute Pharyngitis" 
                      className={cn(
                        "mt-2 text-md h-12",
                        fieldState.error ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200"
                      )} 
                      {...field} 
                    />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-xs font-bold text-red-500 mt-1">
                      {fieldState.error.message || 'Clinical diagnosis is required'}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b pb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Medications Rx</h3>
                {form.formState.errors.medicines?.message && (
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                    {form.formState.errors.medicines.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative group flex flex-col gap-4 p-5 bg-slate-50 border rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:bg-slate-100/50">
                    {/* Header line for the row with internal delete button */}
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Search / Drug Name */}
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.medicine_name`}
                        render={({ field: _field, fieldState }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-xs font-medium text-slate-500">Drug Name</FormLabel>
                            <AutocompleteField index={index} hasError={!!fieldState.error} />
                            {fieldState.error && (
                              <p className="text-xs font-bold text-red-500 mt-1">
                                {fieldState.error.message || 'Medicine name required'}
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

                      {/* Dosage */}
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.dosage`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-slate-500">Dosage</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. 500mg" 
                                className={cn(fieldState.error ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200")} 
                                {...field} 
                              />
                            </FormControl>
                            {fieldState.error && (
                              <p className="text-xs font-bold text-red-500 mt-1">
                                {fieldState.error.message || 'Dosage required'}
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

                      {/* Duration */}
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.duration_days`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-slate-500">Duration (Days)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive")} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      {/* Frequency Toggles */}
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.frequency`}
                        render={() => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-xs font-medium text-slate-500">Frequency Schedule</FormLabel>
                            <FrequencyToggles index={index} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Instructions */}
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-xs font-medium text-slate-500">Food / Special Instructions</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. After meals" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                 <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-2 bg-transparent hover:border-primary hover:bg-primary/5 shadow-sm"
                    onClick={() => append({ medicine_name: '', dosage: '', frequency: '1-0-1', duration_days: 5, notes: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Another Medicine
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem className="bg-white p-5 rounded-xl border shadow-sm">
                    <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General Advice / Next Steps</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Drink plenty of fluids. Review after 5 days." className="min-h-[100px] resize-none mt-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" className="mr-3" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : <Check className="h-5 w-5 mr-2" />}
              {prescriptionId ? 'Save Changes' : 'Generate Prescription'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Add New Medicine Dialog */}
      <Dialog open={openAddMedicine} onOpenChange={setOpenAddMedicine}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Medicine to Global Database</DialogTitle>
          </DialogHeader>
          <AddMedicineForm 
            initialName={addMedicineInitialName} 
            onSuccess={(med) => {
              if (activeMedicineIndex !== null) {
                form.setValue(`medicines.${activeMedicineIndex}.medicine_name`, med.generic_name);
                form.setValue(`medicines.${activeMedicineIndex}.dosage`, med.common_dosage || '');
              }
              setOpenAddMedicine(false);
            }} 
            onCancel={() => setOpenAddMedicine(false)} 
          />
        </DialogContent>
      </Dialog>

      <LoadTemplateModal 
        open={openLoadTemplate} 
        onOpenChange={setOpenLoadTemplate}
        onSelect={handleApplyTemplate}
      />

      {templateData && (
        <SaveTemplateModal 
          open={openSaveTemplate} 
          onOpenChange={(open) => {
            setOpenSaveTemplate(open);
            if (!open) setTemplateData(null);
          }}
          prescriptionData={templateData}
        />
      )}
    </>
  );
}

// Subcomponent for Add Medicine Form to isolate logic
function AddMedicineForm({ initialName, onSuccess, onCancel }: { 
  initialName: string; 
  onSuccess: (med: any) => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [genericName, setGenericName] = React.useState(initialName);
  const [dosage, setDosage] = React.useState('');
  const [route, setRoute] = React.useState('Oral');
  const [category, setCategory] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!genericName || !dosage || !route) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    const result = await addMedicine({
      generic_name: genericName,
      common_dosage: dosage,
      route,
      category
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Medicine added globally!');
      onSuccess(result.medicine);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Generic Name (or Brand) <span className="text-red-500">*</span></label>
        <Input 
          value={genericName} 
          onChange={(e) => setGenericName(e.target.value)} 
          placeholder="e.g. Paracetamol" 
          required 
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Common Dosage <span className="text-red-500">*</span></label>
        <Input 
          value={dosage} 
          onChange={(e) => setDosage(e.target.value)} 
          placeholder="e.g. 500mg" 
          required 
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Administration Route <span className="text-red-500">*</span></label>
        <Select value={route} onValueChange={(val) => setRoute(val || 'Oral')} required>
          <SelectTrigger>
            <SelectValue placeholder="Select route" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Oral">Oral</SelectItem>
            <SelectItem value="Topical">Topical</SelectItem>
            <SelectItem value="Injectable">Injectable</SelectItem>
            <SelectItem value="Inhaler">Inhaler</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Category (Optional)</label>
        <Input 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          placeholder="e.g. Analgesic, Antibiotic" 
        />
      </div>
      <DialogFooter className="pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Medicine
        </Button>
      </DialogFooter>
    </form>
  );
}
