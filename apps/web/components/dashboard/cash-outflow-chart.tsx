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
} from 'recharts';

interface OutflowData {
  month: string;
  outflow: number;
}

interface CashOutflowChartProps {
  data: OutflowData[];
}

export function CashOutflowChart({ data }: CashOutflowChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-gray-900">
            Cash Outflow Forecast
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Expected payment obligations grouped by due date ranges
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
              formatter={(value: number) => `€${value.toLocaleString()}`}
            />
            <Bar 
              dataKey="outflow" 
              fill="#1E3A8A"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}