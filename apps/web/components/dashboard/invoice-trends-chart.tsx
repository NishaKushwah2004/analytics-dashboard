'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TrendData {
  month: string;
  count: number;
  value: number;
}

interface InvoiceTrendsChartProps {
  data: TrendData[];
}

export function InvoiceTrendsChart({ data }: InvoiceTrendsChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-gray-900">
            Invoice Volume + Value Trend
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Invoice count and total spend over 12 months
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Date Selector */}
        <div className="mb-4 flex justify-end">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 text-sm">
            <span className="text-gray-900 font-medium px-3 py-1">October 2025</span>
          </div>
        </div>

        {/* Stats Box */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Invoice Count:</p>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spend:</p>
              <p className="text-2xl font-bold text-blue-600">€ 8,879.25</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorValue)"
              name="Total Value (€)"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#1E3A8A"
              strokeWidth={2}
              dot={{ fill: '#1E3A8A', r: 4 }}
              name="Invoice Count"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}