'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface CategoryData {
  category: string;
  spend: number;
}

interface CategorySpendChartProps {
  data: CategoryData[];
}

const COLORS = [
  '#1E3A8A', // Navy - Operations
  '#F97316', // Orange - Marketing  
  '#3B82F6', // Blue - Facilities
];

const LEGEND_DATA = [
  { name: 'Operations', value: '$1,000', color: '#1E3A8A' },
  { name: 'Marketing', value: '$7,250', color: '#F97316' },
  { name: 'Facilities', value: '$1,000', color: '#3B82F6' },
];

export function CategorySpendChart({ data }: CategorySpendChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-gray-900">
            Spend by Category
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Distribution of spending across different categories
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="spend"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => `€${value.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend */}
        <div className="mt-6 space-y-3">
          {LEGEND_DATA.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}