'use server';

import { createClient } from '@/lib/supabase/server';
import { getDateRangeBounds } from '@/lib/utils';
import { z } from 'zod';

export async function getBasicReportMetrics(dateFilter: string = 'this-month') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'No active organization.' };
  const orgId = membership.organization_id;

  try {
    const { start, end } = getDateRangeBounds(dateFilter);
    const startStr = start?.toISOString() || new Date(0).toISOString();
    const endStr = end?.toISOString() || new Date().toISOString();

    // To calculate % change, we need the previous period
    // Simple approximation: If range is 30 days, previous is 30 days before start.
    const rangeDurationMs = (end ? end.getTime() : new Date().getTime()) - (start ? start.getTime() : 0);
    const previousStart = new Date(new Date(startStr).getTime() - rangeDurationMs);
    const previousEnd = new Date(startStr);

    // 1. Total Revenue (Paid & Partially Paid Invoices in current period)
    const { data: currentInvoices } = await supabase
      .from('invoices')
      .select('amount_paid, issue_date')
      .eq('organization_id', orgId)
      .gte('issue_date', startStr)
      .lte('issue_date', endStr);

    const totalRevenue = currentInvoices?.reduce((sum, inv) => sum + (Number(inv.amount_paid) || 0), 0) || 0;

    // Previous Revenue
    const { data: previousInvoices } = await supabase
      .from('invoices')
      .select('amount_paid, issue_date')
      .eq('organization_id', orgId)
      .gte('issue_date', previousStart.toISOString())
      .lt('issue_date', previousEnd.toISOString());

    const previousRevenue = previousInvoices?.reduce((sum, inv) => sum + (Number(inv.amount_paid) || 0), 0) || 0;
    const revenueChange = previousRevenue === 0 ? 100 : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    // 2. Patients (Current vs Previous)
    const { count: currentPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', startStr)
      .lte('created_at', endStr);

    const { count: previousPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString());

    const patientsChange = previousPatients === 0 ? 100 : (((currentPatients || 0) - (previousPatients || 0)) / (previousPatients || 1)) * 100;

    // 3. Appointments (Current vs Previous)
    const { count: currentAppts } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr);

    const { count: previousAppts } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('appointment_date', previousStart.toISOString())
      .lt('appointment_date', previousEnd.toISOString());

    const apptsChange = previousAppts === 0 ? 100 : (((currentAppts || 0) - (previousAppts || 0)) / (previousAppts || 1)) * 100;

    // 4. Top 5 Treatments by Frequency
    const { data: allAppts } = await supabase
      .from('appointments')
      .select('reason')
      .eq('organization_id', orgId)
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr)
      .not('reason', 'is', null);

    const frequencyMap: Record<string, number> = {};
    allAppts?.forEach(a => {
      const reason = a.reason?.trim() || 'General';
      frequencyMap[reason] = (frequencyMap[reason] || 0) + 1;
    });

    const topTreatments = Object.entries(frequencyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      data: {
        revenue: { current: totalRevenue, change: revenueChange },
        patients: { current: currentPatients || 0, change: patientsChange },
        appointments: { current: currentAppts || 0, change: apptsChange },
        topTreatments,
      }
    };

  } catch (error: any) {
    console.error('Failed to fetch basic report metrics:', error);
    return { error: error.message || 'Failed to fetch metrics.' };
  }
}

export async function getAdvancedReportMetrics(dateFilter: string = 'last-6-months') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'No active organization.' };
  const orgId = membership.organization_id;

  try {
    const { start, end } = getDateRangeBounds(dateFilter);
    const startStr = start?.toISOString() || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    const endStr = end?.toISOString() || new Date().toISOString();

    // 1. Monthly Revenue Chart (Last N Months)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('issue_date, total_amount, amount_paid')
      .eq('organization_id', orgId)
      .gte('issue_date', startStr)
      .lte('issue_date', endStr)
      .order('issue_date', { ascending: true });

    // Group by Month (e.g., "Jan 2024")
    const monthlyRevenueMap: Record<string, number> = {};
    invoices?.forEach(inv => {
      if (!inv.issue_date) return;
      const date = new Date(inv.issue_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyRevenueMap[monthYear] = (monthlyRevenueMap[monthYear] || 0) + (Number(inv.amount_paid) || 0);
    });
    
    // Sort chronologically using a Date property
    const monthlyRevenueAll = Object.entries(monthlyRevenueMap).map(([month, revenue]) => {
      const [m, y] = month.split(' ');
      return { month, revenue, _date: new Date(`${m} 1, ${y}`) };
    }).sort((a, b) => a._date.getTime() - b._date.getTime());

    // Limit to maximum 12 months (most recent 12 months)
    const monthlyRevenueLimited = monthlyRevenueAll.slice(-12);
    const monthlyRevenue = monthlyRevenueLimited.map(({ month, revenue }) => ({ month, revenue }));

    // 2. Outstanding Payments (Unpaid or Partially Paid)
    const { data: outstandingInvoices } = await supabase
      .from('invoices')
      .select(`
        id, invoice_number, issue_date, due_date, status, total_amount, amount_paid,
        patients (id, full_name, patient_code)
      `)
      .eq('organization_id', orgId)
      .in('status', ['issued', 'partially_paid'])
      .order('due_date', { ascending: true });

    const outstandingPayments = outstandingInvoices?.map((inv: any) => {
      const amountDue = (Number(inv.total_amount) || 0) - (Number(inv.amount_paid) || 0);
      const isOverdue = inv.due_date ? new Date(inv.due_date) < new Date() : false;
      const daysOverdue = isOverdue && inv.due_date ? Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 3600 * 24)) : 0;
      
      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        patient_name: inv.patients?.full_name || 'Unknown',
        amount_due: amountDue,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        status: inv.status,
        days_overdue: daysOverdue,
      };
    }) || [];

    // 3. New vs Returning Patients
    // Check if appointment is the patient's FIRST appointment
    const { data: currentPeriodAppts } = await supabase
      .from('appointments')
      .select('patient_id, appointment_date')
      .eq('organization_id', orgId)
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr);

    let newPatientsCount = 0;
    let returningPatientsCount = 0;

    // Use a unique set to count actual distinct patients
    const patientIdsInPeriod = new Set(currentPeriodAppts?.map(a => a.patient_id));
    
    // If there are patients, determine their status by looking at their earliest appointment globally
    if (patientIdsInPeriod.size > 0) {
      const { data: firstAppts } = await supabase
        .from('appointments')
        .select('patient_id, appointment_date')
        .eq('organization_id', orgId)
        .in('patient_id', Array.from(patientIdsInPeriod))
        .order('appointment_date', { ascending: true });

      const firstApptMap: Record<string, string> = {};
      firstAppts?.forEach(a => {
        if (!a.patient_id) return;
        if (!firstApptMap[a.patient_id]) {
          firstApptMap[a.patient_id] = a.appointment_date;
        }
      });

      patientIdsInPeriod.forEach(pid => {
        const firstDate = firstApptMap[pid as string];
        if (firstDate && firstDate >= startStr && firstDate <= endStr) {
          newPatientsCount++;
        } else {
          returningPatientsCount++;
        }
      });
    }

    const patientRetention = [
      { name: 'New Patients', value: newPatientsCount, fill: 'var(--color-new)' },
      { name: 'Returning Patients', value: returningPatientsCount, fill: 'var(--color-returning)' }
    ];

    // 4. Appointment Status Breakdown
    const { data: apptStatuses } = await supabase
      .from('appointments')
      .select('status')
      .eq('organization_id', orgId)
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr);
      
    const statusMap: Record<string, number> = {};
    apptStatuses?.forEach(a => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });
    
    const appointmentStatus = Object.entries(statusMap).map(([name, value], i) => {
      // Color coded maps for Recharts
      const colors: any = {
        'completed': 'hsl(var(--chart-2))', // Greenish
        'scheduled': 'hsl(var(--chart-1))', // Primary
        'cancelled': 'hsl(var(--destructive))', // Red Error
        'no_show': 'hsl(var(--muted-foreground))'
      };
      // Normalize 'checked_in' and 'in_progress' to scheduled visually or distinct
      return {
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        fill: colors[name] || `hsl(var(--chart-${(i % 5) + 1}))`
      };
    }).sort((a, b) => b.value - a.value);

    // 5. Staff/Doctor Revenue & Top Treatments by Revenue
    // Query invoice line items nested via invoices
    const { data: invoiceLines } = await supabase
      .from('invoice_items')
      .select(`
        quantity, unit_price, description, 
        invoices!inner(
          organization_id, 
          issue_date, 
          appointments (
            doctor_membership_id,
            organization_memberships!doctor_membership_id(
              profiles(full_name)
            )
          )
        )
      `)
      .eq('invoices.organization_id', orgId)
      .gte('invoices.issue_date', startStr)
      .lte('invoices.issue_date', endStr);

    const staffRevenueMap: Record<string, number> = {};
    const treatmentRevenueMap: Record<string, number> = {};

    invoiceLines?.forEach((item: any) => {
      const lineTotal = (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);
      
      // Staff mapping
      const invObj: any = Array.isArray(item.invoices) ? item.invoices[0] : item.invoices;
      const apptObj = invObj?.appointments ? (Array.isArray(invObj.appointments) ? invObj.appointments[0] : invObj.appointments) : null;
      const orgMemObj = apptObj?.organization_memberships ? (Array.isArray(apptObj.organization_memberships) ? apptObj.organization_memberships[0] : apptObj.organization_memberships) : null;
      const profObj = orgMemObj?.profiles ? (Array.isArray(orgMemObj.profiles) ? orgMemObj.profiles[0] : orgMemObj.profiles) : null;
      
      const doctorName = profObj?.full_name ? `Dr. ${profObj.full_name}` : 'Unassigned';
      staffRevenueMap[doctorName] = (staffRevenueMap[doctorName] || 0) + lineTotal;

      // Treatment mapping
      const desc = item.description?.trim() || 'General';
      treatmentRevenueMap[desc] = (treatmentRevenueMap[desc] || 0) + lineTotal;
    });

    const staffRevenue = Object.entries(staffRevenueMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const topTreatmentsByRevenue = Object.entries(treatmentRevenueMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      success: true,
      data: {
        monthlyRevenue,
        outstandingPayments,
        patientRetention,
        appointmentStatus,
        staffRevenue,
        topTreatmentsByRevenue
      }
    };

  } catch (error: any) {
    console.error('Failed to fetch advanced report metrics:', error);
    return { error: error.message || 'Failed to fetch advanced metrics.' };
  }
}

export async function getPatientsExportData(dateFilter: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .single();

  if (!membership) return { error: 'No active organization.' };

  const { start, end } = getDateRangeBounds(dateFilter);
  const startStr = start?.toISOString() || new Date(0).toISOString();
  const endStr = end?.toISOString() || new Date().toISOString();

  const { data, error } = await supabase
    .from('patients')
    .select('patient_code, full_name, phone, email, date_of_birth, gender, blood_group, created_at')
    .eq('organization_id', membership.organization_id)
    .gte('created_at', startStr)
    .lte('created_at', endStr)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { success: true, data: data || [] };
}

export async function getInvoicesExportData(dateFilter: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .single();

  if (!membership) return { error: 'No active organization.' };

  const { start, end } = getDateRangeBounds(dateFilter);
  const startStr = start?.toISOString() || new Date(0).toISOString();
  const endStr = end?.toISOString() || new Date().toISOString();

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      invoice_number, issue_date, due_date, status, total_amount, amount_paid, discount_amount,
      patients (full_name, patient_code),
      profiles!doctor_membership_id (full_name)
    `)
    .eq('organization_id', membership.organization_id)
    .gte('issue_date', startStr)
    .lte('issue_date', endStr)
    .order('issue_date', { ascending: false });

  if (error) return { error: error.message };
  return { success: true, data: data || [] };
}
