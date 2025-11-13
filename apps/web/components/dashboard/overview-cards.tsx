'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsData {
  totalSpend: number;
  totalInvoices: number;
  documentsUploaded: number;
  avgInvoiceValue: number;
}

interface OverviewCardsProps {
  stats: StatsData;
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Spend',
      subtitle: '(YTD)',
      value: formatCurrency(stats.totalSpend),
      change: '+8.5%',
      changeText: 'from last month',
      isPositive: true,
    },
    {
      title: 'Total Invoices Processed',
      subtitle: '',
      value: stats.totalInvoices.toString(),
      change: '+8.5%',
      changeText: 'from last month',
      isPositive: true,
    },
    {
      title: 'Documents Uploaded',
      subtitle: 'This Month',
      value: stats.documentsUploaded.toString(),
      change: '+8.5%',
      changeText: 'from last month',
      isPositive: false,
    },
    {
      title: 'Average Invoice Value',
      subtitle: '',
      value: formatCurrency(stats.avgInvoiceValue),
      change: '+8.5%',
      changeText: 'from last month',
      isPositive: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Title */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 font-medium">
                {card.title}
              </p>
              {card.subtitle && (
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              )}
            </div>

            {/* Value */}
            <div className="mb-3">
              <p className="text-3xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>

            {/* Change Indicator */}
            <div className="flex items-center space-x-2 text-sm">
              {card.isPositive ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">{card.change}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-medium">{card.change}</span>
                </>
              )}
              <span className="text-gray-500">{card.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}