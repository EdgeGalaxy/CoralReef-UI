'use client';

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GatewayStatusChartProps {
  data: { status: string; count: number }[];
}

// 网关状态翻译映射，对应 gateways.py 中的 GatewayStatus 枚举
const gatewayStatusTranslations: Record<string, string> = {
  online: '在线',
  offline: '离线',
  deleted: '已删除'
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const GatewayStatusChart = ({ data }: GatewayStatusChartProps) => {
  const chartData = data.map((d) => ({
    name: gatewayStatusTranslations[d.status] || d.status, // 使用中文翻译，如果没有翻译则使用原状态
    value: d.count,
    originalStatus: d.status // 保留原始状态用于其他用途
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>网关状态</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, '数量']}
              labelFormatter={(label) => `状态: ${label}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export { GatewayStatusChart as PieGraph };
