import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: {
          include: {
            summary: true,
          },
        },
      },
    });
    
    // Calculate total spend per vendor
    const vendorSpend = vendors.map((vendor) => {
      const totalSpend = vendor.invoices.reduce(
        (sum, invoice) => sum + Math.abs(invoice.summary?.invoiceTotal || 0),
        0
      );
      
      return {
        id: vendor.id,
        name: vendor.name,
        totalSpend,
        invoiceCount: vendor.invoices.length,
      };
    });
    
    // Sort by spend and get top 10
    const top10 = vendorSpend
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);
    
    return NextResponse.json(top10);
  } catch (error) {
    console.error('Top 10 Vendors API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top 10 vendors' },
      { status: 500 }
    );
  }
}