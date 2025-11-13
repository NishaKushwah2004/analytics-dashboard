import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';

export async function GET() {
  try {
    const today = new Date();
    const next6Months = Array.from({ length: 6 }, (_, i) => addMonths(today, i));
    
    const forecasts = await Promise.all(
      next6Months.map(async (month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const payments = await prisma.payment.findMany({
          where: {
            dueDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          include: {
            invoice: {
              include: {
                summary: true,
              },
            },
          },
        });
        
        const totalOutflow = payments.reduce(
          (sum, payment) => sum + Math.abs(payment.invoice.summary?.invoiceTotal || 0),
          0
        );
        
        return {
          month: format(month, 'MMM yyyy'),
          outflow: totalOutflow,
        };
      })
    );
    
    return NextResponse.json(forecasts);
  } catch (error) {
    console.error('Cash Outflow API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash outflow' },
      { status: 500 }
    );
  }
}