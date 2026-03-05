import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { logger } from '../utils/logger.js';

export async function generateCustomerReport(res: Response, customer: any, transactions: any[], balance: number) {
  try {
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers 
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${customer.name.replace(/\s+/g, '_')}_Ledger.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Mandal Khata', { align: 'center' });
    doc.fontSize(14).text('Customer Ledger Report', { align: 'center' });
    doc.moveDown();

    // Customer Info
    doc.fontSize(12).text(`Customer Name: ${customer.name}`);
    if (customer.mobile) {
      doc.text(`Mobile: ${customer.mobile}`);
    }
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`);
    doc.text(`Current Balance: ₹${Math.abs(balance)} ${balance > 0 ? '(You will get)' : balance < 0 ? '(You will give)' : 'Settled'}`);
    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Date', 50, tableTop);
    doc.text('Type', 150, tableTop);
    doc.text('Amount', 250, tableTop);
    doc.text('Description', 350, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.font('Helvetica');

    let y = tableTop + 25;
    
    transactions.forEach((t) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      
      doc.text(new Date(t.date).toLocaleDateString(), 50, y);
      doc.text(t.type, 150, y);
      
      const amountColor = t.type === 'GAVE' ? 'red' : 'green';
      doc.fillColor(amountColor).text(`₹${Number(t.amount).toFixed(2)}`, 250, y);
      
      doc.fillColor('black').text(t.description || '-', 350, y, { width: 200, lineBreak: false });
      
      doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#e5e7eb').stroke();
      
      y += 25;
    });

    doc.end();
  } catch (error) {
    logger.error('Failed to generate PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }
}
