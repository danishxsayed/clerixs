import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Helper to fetch external image and convert to Base64
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Fetch image failed with status ${res.status} for URL: ${url}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error(`Failed to fetch image as base64 from URL (${url}):`, err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const prescriptionId = resolvedParams.id;

  console.log(`Starting PDF generation for prescription ID: ${prescriptionId}`);

  try {
    // 1. Authenticate Request
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Unauthorized access attempt to prescription PDF:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Prescription with Deep Joins
    const { data: px, error: pxError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        organization_memberships(profiles(full_name, phone, default_organization_id)),
        patients(full_name, patient_code, age_snapshot, gender, phone, email, address),
        prescription_items(*),
        organizations(*)
      `)
      .eq('id', prescriptionId)
      .single();

    if (pxError || !px) {
      console.error(`Error fetching prescription:`, pxError);
      return NextResponse.json({ error: 'Prescription not found or database error' }, { status: 404 });
    }

    // 3. Fetch Primary Branch
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('*')
      .eq('organization_id', px.organization_id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (branchError) {
      console.warn(`Branch fetch warning:`, branchError.message);
    }

    const doctor = px.organization_memberships?.profiles;
    const patient = px.patients;
    const clinic = px.organizations;

    // 4. Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = 15;

    // 5. Letterhead Rendering
    let letterheadLoaded = false;
    if (clinic?.letterhead_url && !clinic.letterhead_url.toLowerCase().includes('.pdf')) {
      console.log(`Fetching clinic letterhead: ${clinic.letterhead_url}`);
      const letterheadBase64 = await fetchImageAsBase64(clinic.letterhead_url);
      if (letterheadBase64) {
        try {
          let imgWidth = 2000;
          let imgHeight = 200; // default to 10:1
          try {
            const imgProps = doc.getImageProperties(letterheadBase64);
            if (imgProps && imgProps.width && imgProps.height) {
              imgWidth = imgProps.width;
              imgHeight = imgProps.height;
            }
          } catch (e) {
            console.warn("Could not get image properties, using default 10:1 ratio", e);
          }

          const maxWidth = pageWidth - (margin * 2);
          const maxHeight = 40; // max height of 40mm to prevent pushing content down
          const imgRatio = imgWidth / imgHeight;

          let targetWidth = maxWidth;
          let targetHeight = maxWidth / imgRatio;

          if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            targetWidth = maxHeight * imgRatio;
          }

          // Center the letterhead horizontally if it is smaller than maxWidth
          const startX = margin + (maxWidth - targetWidth) / 2;

          doc.addImage(letterheadBase64, 'PNG', startX, currentY, targetWidth, targetHeight);
          currentY += targetHeight + 3;
          letterheadLoaded = true;
        } catch (imgErr) {
          console.error('Failed to add letterhead image to PDF:', imgErr);
        }
      }
    }

    // Text-based Fallback Header
    if (!letterheadLoaded) {
      console.log('Using text-based fallback header...');
      const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo.jpg');
      let logoAdded = false;

      if (fs.existsSync(logoPath)) {
        try {
          const logoBuffer = fs.readFileSync(logoPath);
          const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
          doc.addImage(logoBase64, 'JPEG', margin, currentY, 20, 20);
          logoAdded = true;
        } catch (logoErr) {
          console.error('Failed to add logo to PDF fallback header:', logoErr);
        }
      }

      const textStartX = logoAdded ? margin + 24 : margin;

      // Clinic Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); // Primary medical blue #1e3a8a
      doc.text(clinic?.name || 'Medical Clinic', textStartX, currentY + 6);

      // Clinic Address & Contact Info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Muted slate #64748b

      const addressLine1 = branch?.address_line1 || '';
      const addressLine2 = branch?.address_line2 ? `, ${branch.address_line2}` : '';
      const cityStatePin = branch?.city ? `${branch.city}, ${branch.state || ''} ${branch.pincode || ''}` : '';

      doc.text(`${addressLine1}${addressLine2}`, textStartX, currentY + 11);
      if (cityStatePin) {
        doc.text(cityStatePin, textStartX, currentY + 15);
      }

      // Contact block on the far right
      doc.setFontSize(8.5);
      const rightAlignX = pageWidth - margin;
      const phoneText = `Phone: ${branch?.phone || 'N/A'}`;
      const emailText = `Email: ${branch?.email || 'N/A'}`;
      const gstinText = `GSTIN: ${branch?.gstin || 'N/A'}`;

      doc.text(phoneText, rightAlignX, currentY + 6, { align: 'right' });
      doc.text(emailText, rightAlignX, currentY + 10, { align: 'right' });
      doc.text(gstinText, rightAlignX, currentY + 14, { align: 'right' });

      currentY += 25;
    }

    // Divider Line
    doc.setDrawColor(30, 58, 138); // Primary blue
    doc.setLineWidth(0.6);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // 6. Metadata Grid Box
    doc.setFillColor(248, 250, 252); // Light grey-blue bg #f8fafc
    doc.setDrawColor(226, 232, 240); // Soft grey border #e2e8f0
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 32, 3, 3, 'FD');

    // Patient Column (Left side of the box)
    const colLeftX = margin + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Muted text
    doc.text('PATIENT DETAILS', colLeftX, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59); // Dark text #1e293b
    doc.text(patient?.full_name || 'Anonymous Patient', colLeftX, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Patient ID: ${patient?.patient_code || 'N/A'}`, colLeftX, currentY + 17);
    
    const ageGender = `${patient?.age_snapshot ? `${patient.age_snapshot} yrs` : 'Age N/A'} • ${patient?.gender ? patient.gender.replace('_', ' ') : 'Gender N/A'}`;
    doc.text(ageGender, colLeftX, currentY + 22);
    doc.text(`Phone: ${patient?.phone || 'N/A'}`, colLeftX, currentY + 27);

    // Prescription Column (Right side of the box)
    const colRightX = pageWidth - margin - 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PRESCRIPTION DETAILS', colRightX, currentY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138); // Primary Blue
    const rxIdText = `Rx-${prescriptionId.split('-')[0].toUpperCase()}`;
    doc.text(rxIdText, colRightX, currentY + 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const dateText = `Date: ${format(new Date(px.created_at), 'PPP')}`;
    doc.text(dateText, colRightX, currentY + 17, { align: 'right' });
    doc.text(`Doctor: ${doctor?.full_name || 'Dr. Practitioner'}`, colRightX, currentY + 22, { align: 'right' });

    currentY += 40;

    // 7. Clinical Diagnosis Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text('⚕ Clinical Diagnosis', margin, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const diagnosisLines = doc.splitTextToSize(px.diagnosis || 'No specific diagnosis recorded.', pageWidth - (margin * 2));
    doc.text(diagnosisLines, margin, currentY);
    currentY += (diagnosisLines.length * 4.5) + 8;

    // 8. Medications Table (jsPDF-AutoTable)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text('Medications Rx', margin, currentY);
    currentY += 4;

    const tableData = (px.prescription_items || []).map((item: any) => [
      item.medicine_name,
      item.dosage || '-',
      item.frequency || '-',
      `${item.duration_days} Days`,
      item.notes || '-'
    ]);

    if (tableData.length === 0) {
      tableData.push(['No medications prescribed.', '-', '-', '-', '-']);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Medicine Name', 'Dosage', 'Frequency', 'Duration', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        font: 'helvetica'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 'auto' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // 9. General Advice / Instructions Section
    if (px.instructions) {
      // Page budget check
      if (currentY + 30 > pageHeight - 35) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('General Advice / Next Steps', margin, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const adviceLines = doc.splitTextToSize(px.instructions, pageWidth - (margin * 2));
      doc.text(adviceLines, margin, currentY);
      currentY += (adviceLines.length * 4.5) + 10;
    }

    // 10. Footer Signature Block
    // Ensure signature fits, otherwise create a new page
    if (currentY + 35 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    const footerY = pageHeight - 45;

    // Footer Disclaimer (Left side)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Muted grey #94a3b8
    const disclaimer = 'This is a computer-generated document and does not require a physical stamp inside Clerixs networks.';
    const genDate = `Generated: ${format(new Date(), 'PPp')}`;
    doc.text(disclaimer, margin, footerY + 8);
    doc.text(genDate, margin, footerY + 12);

    // Signature Area (Right side)
    const sigWidth = 48;
    const sigStartX = pageWidth - margin - sigWidth;

    // Signature Image
    if (clinic?.signature_url) {
      console.log(`Fetching clinic signature image: ${clinic.signature_url}`);
      const sigBase64 = await fetchImageAsBase64(clinic.signature_url);
      if (sigBase64) {
        try {
          doc.addImage(sigBase64, 'PNG', sigStartX + 4, footerY - 18, sigWidth - 8, 16);
        } catch (sigErr) {
          console.error('Failed to embed signature image in PDF:', sigErr);
        }
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225); // Slate-200
      doc.text('Not Electronically Signed', sigStartX + (sigWidth / 2), footerY - 4, { align: 'center' });
    }

    // Signature Line & Details
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(sigStartX, footerY, sigStartX + sigWidth, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(doctor?.full_name || 'Dr. Practitioner', sigStartX + (sigWidth / 2), footerY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signature', sigStartX + (sigWidth / 2), footerY + 9, { align: 'center' });

    // Output PDF Buffer
    const pdfBuffer = doc.output('arraybuffer');
    const bytes = new Uint8Array(pdfBuffer);

    console.log(`PDF successfully generated. Total size: ${bytes.length} bytes.`);

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="prescription-${prescriptionId}.pdf"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error: any) {
    console.error('CRITICAL ERROR in prescription PDF generation API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error during PDF generation',
        details: error.message || error
      }, 
      { status: 500 }
    );
  }
}
