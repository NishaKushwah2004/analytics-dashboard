import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import type { Invoice } from '@prisma/client';

export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
        { vendor: { is: { name: { contains: search, mode: 'insensitive' as const} } } },
      ];
    }


    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (dateFrom || dateTo) {
      where.invoiceDate = {};
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
      if (dateTo) where.invoiceDate.lte = new Date(dateTo);
    }
    
    if (minAmount || maxAmount) {
      where.summary = {};
      if (minAmount) where.summary.invoiceTotal = { gte: parseFloat(minAmount) };
      if (maxAmount) {
        where.summary.invoiceTotal = {
          ...where.summary.invoiceTotal,
          lte: parseFloat(maxAmount),
        };
      }
    }
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          vendor: true,
          summary: true,
        },
        orderBy: {
          invoiceDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);
    
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      vendor: invoice.vendor.name,
      date: invoice.invoiceDate,
      invoiceNumber: invoice.invoiceNumber,
      amount: Math.abs(invoice.summary?.invoiceTotal || 0),
      status: invoice.status,
    }));


    
    return NextResponse.json({
      invoices: formattedInvoices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Invoices API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}