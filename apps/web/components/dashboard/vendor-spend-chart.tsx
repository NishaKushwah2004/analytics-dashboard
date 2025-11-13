'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface VendorData {
  name: string;
  totalSpend: number;
}

interface VendorSpendChartProps {
  data: VendorData[];
}

const COLORS = [
  '#1E3A8A', // Navy
  '#3B82F6', // Blue
  '#60A5FA', // Light Blue
  '#93C5FD', // Lighter Blue
  '#BFDBFE', // Very Light Blue
  '#DBEAFE', // Pale Blue
  '#EFF6FF', // Almost White Blue
  '#F3F4F6', // Gray
  '#E5E7EB', // Light Gray
  '#D1D5DB', // Lighter Gray
];

export function VendorSpendChart({ data }: VendorSpendChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-gray-900">
            Spend by Vendor (Top 10)
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Vendor ranked with cumulative percentage distribution
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#1E3A8A] rounded-sm"></div>
              <span className="text-gray-600">Top Vendors</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={data} 
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis 
              type="number"
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              width={90}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => `€${value.toLocaleString()}`}
            />
            <Bar dataKey="totalSpend" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Total Vendor Spend */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Global Supply</p>
              <p className="text-xs text-gray-500">Vendor Spend</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">€ 8,879.25</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}