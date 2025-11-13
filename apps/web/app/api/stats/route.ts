import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { startOfYear } from 'date-fns';

export const revalidate = 60;

export async function GET() {
  try {
    const yearStart = startOfYear(new Date());
    
    // Total Spend (YTD) - sum of all invoice totals this year
    const totalSpendResult = await prisma.summary.aggregate({
      where: {
        invoice: {
          invoiceDate: {
            gte: yearStart,
          },
        },
      },
      _sum: {
        invoiceTotal: true,
      },
    });
    
    // Total Invoices Processed
    const totalInvoices = await prisma.invoice.count({
      where: {
        status: 'processed',
      },
    });
    
    // Documents Uploaded
    const documentsUploaded = await prisma.document.count();
    
    // Average Invoice Value
    const avgInvoiceResult = await prisma.summary.aggregate({
      _avg: {
        invoiceTotal: true,
      },
    });
    
    return NextResponse.json({
      totalSpend: Math.abs(totalSpendResult._sum.invoiceTotal || 0),
      totalInvoices,
      documentsUploaded,
      avgInvoiceValue: Math.abs(avgInvoiceResult._avg.invoiceTotal || 0),
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}