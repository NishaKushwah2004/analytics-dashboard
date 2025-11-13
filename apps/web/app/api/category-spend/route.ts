import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const lineItems = await prisma.lineItem.findMany({
      select: {
        category: true,
        totalPrice: true,
      },
    });
    
    // Group by category
    const categorySpend: Record<string, number> = {};
    
    lineItems.forEach((item) => {
      const category = item.category || 'General';
      if (!categorySpend[category]) {
        categorySpend[category] = 0;
      }
      categorySpend[category] += Math.abs(item.totalPrice);
    });
    
    const result = Object.entries(categorySpend).map(([category, spend]) => ({
      category,
      spend,
    }));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Category Spend API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category spend' },
      { status: 500 }
    );
  }
}