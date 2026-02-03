import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/uba-tech-camp-logo-new.png';

interface InvoiceData {
  fullName: string;
  email?: string;
  institution?: string;
  program: string;
  amount: number;
  transId: string;
  date: string;
}

export const generateInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();

  // --- BRAND COLORS (Using your Logo Blue) ---
  const colors = {
    primary: [0, 80, 179] as [number, number, number],    // Royal Blue (Logo Color)
    secondary: [15, 23, 42] as [number, number, number],  // Dark Accent
    success: [34, 197, 94] as [number, number, number],   // Green
    bgLight: [248, 250, 252] as [number, number, number], // Light Slate
    textMain: [30, 41, 59] as [number, number, number],   // Dark Slate
    textMuted: [100, 116, 139] as [number, number, number]// Slate-500
  };

  // 1. HEADER SECTION (WHITE BACKGROUND)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 50, 'F');

  // Add the Official Logo
  try {
    // Use 'FAST' compression to significantly reduce PDF file size
    doc.addImage(logo, 'PNG', 20, 10, 24, 24, undefined, 'FAST');
  } catch (err) {
    console.warn('Logo could not be loaded into PDF', err);
    // fallback circle in primary color
    doc.setFillColor(...colors.primary);
    doc.circle(32, 22, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('U', 29, 26);
  }

  // Brand Name
  doc.setTextColor(...colors.primary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('UBaTech Camp', 48, 22);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textMuted);
  doc.text('INNOVATION - TECHNOLOGY - IMPACT', 48, 27);

  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text('Reference: ' + data.transId, 190, 28, { align: 'right' });
  doc.text('Date Issued: ' + data.date, 190, 32, { align: 'right' });

  // 2. DECORATIVE DIVIDER
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // Note about registration fee
  doc.setTextColor(...colors.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('UBaTech Camp Registration', 20, 52);
  
  doc.setTextColor(...colors.textMuted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Note: This amount represents the registration fee only and does not constitute a course fee. All courses are offered at no cost.', 20, 58);

  // 3. BILLING SECTION
  doc.setTextColor(...colors.textMain);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 70);

  doc.setFontSize(13);
  doc.text(data.fullName.toUpperCase(), 20, 77);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  let billY = 82;
  if (data.email) {
    doc.text(data.email, 20, billY);
    billY += 5;
  }
  doc.text('Student / Participant', 20, billY);
  if (data.institution) {
    billY += 5;
    doc.text(data.institution, 20, billY);
  }

  // Organization Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ORGANIZATION:', 130, 70);
  doc.setFont('helvetica', 'normal');
  doc.text('UBaTech Camp', 130, 75);
  doc.text('Bambili, Bamenda', 130, 80);
  doc.text('North West Region, Cameroon', 130, 85);
  doc.text('www.ubatechcamp.org', 130, 90);

  // 4. TABLE SECTION
  autoTable(doc, {
    startY: 100,
    head: [['TRANS ID', 'COURSE', 'AMOUNT (XAF)']],
    body: [
      [
        data.transId.substring(0, 8), 
        data.program, 
        data.amount.toLocaleString()
      ],
    ],
    headStyles: { 
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 35 },
      2: { halign: 'right', cellWidth: 40 }
    }
  });

  // 5. SUMMARY SECTION
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(...colors.bgLight); 
  doc.rect(130, finalY, 60, 18, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('TOTAL PAID:', 135, finalY + 11);
  doc.text(data.amount.toLocaleString() + ' XAF', 185, finalY + 11, { align: 'right' });

  // 6. PAYMENT STATUS STAMP
  doc.setDrawColor(...colors.success);
  doc.setLineWidth(1);
  doc.rect(20, finalY, 40, 15);
  doc.setTextColor(...colors.success);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID', 40, finalY + 7, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Receipt', 40, finalY + 11, { align: 'center' });

  // 7. IMPORTANT NOTES
  doc.setTextColor(...colors.textMuted);
  doc.setFontSize(8);
  const noteY = 250;
  doc.text('IMPORTANT NOTES:', 20, noteY);
  doc.text('• Please present this receipt (printed/digital) at the orientation center.', 20, noteY + 5);
  doc.text('• Valid for UBaTech Camp 3rd edition, 2026. Non-refundable.', 20, noteY + 10);

  // 8. FOOTER
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 275, 190, 275);
  
  doc.setFontSize(8);
  doc.text('© 2026 UBaTech Camp • Building a world of digital thinkers • ubatechcamp.org', 105, 285, { align: 'center' });

  // Save the PDF with the requested filename format
  const fileName = `UBaTechCamp Receipt _ ${data.fullName}.pdf`;
  doc.save(fileName);
};
