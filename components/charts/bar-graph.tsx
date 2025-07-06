'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeploymentStatusChartProps {
  data: { status: string; count: number }[];
}

// 状态翻译映射，对应 deployments.py 中的 OperationStatus 枚举
const statusTranslations: Record<string, string> = {
  pending: '等待中',
  running: '运行中',
  warning: '警告',
  failure: '失败',
  muted: '静音',
  stopped: '已停止',
  not_found: '未找到',
  timeout: '超时'
};

const DeploymentStatusChart = ({ data }: DeploymentStatusChartProps) => {
  const chartData = data.map((d) => ({
    name: statusTranslations[d.status] || d.status, // 使用中文翻译，如果没有翻译则使用原状态
    total: d.count,
    originalStatus: d.status // 保留原始状态用于其他用途
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>服务状态分布</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              formatter={(value, name) => [value, '数量']}
              labelFormatter={(label) => `状态: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="total"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export { DeploymentStatusChart as BarGraph };
