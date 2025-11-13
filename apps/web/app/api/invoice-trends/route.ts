import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { format, subMonths, startOfMonth } from 'date-fns';

export async function GET() {
  try {
    const sixMonthsAgo = subMonths(new Date(), 6);
    
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: sixMonthsAgo,
        },
      },
      include: {
        summary: true,
      },
      orderBy: {
        invoiceDate: 'asc',
      },
    });
    
    // Group by month
    const monthlyData: Record<string, { count: number; total: number }> = {};
    
    invoices.forEach((invoice) => {
      const monthKey = format(startOfMonth(invoice.invoiceDate), 'MMM yyyy');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, total: 0 };
      }
      
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].total += Math.abs(invoice.summary?.invoiceTotal || 0);
    });
    
    const trends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      value: data.total,
    }));
    
    return NextResponse.json(trends);
  } catch (error) {
    console.error('Invoice Trends API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice trends' },
      { status: 500 }
    );
  }
}