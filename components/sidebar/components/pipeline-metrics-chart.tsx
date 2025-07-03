'use client';

import React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { format } from 'date-fns';
import { CalendarIcon, Maximize2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';

interface MetricsResponse {
  dates: string[];
  datasets: Array<{
    name: string;
    data: number[] | string[];
  }>;
}

interface PipelineMetricsChartProps {
  workspaceId: string;
  deploymentId: string;
}

const METRIC_COLORS = {
  Throughput: 'hsl(var(--chart-1))',
  'Frame Decoding Latency': 'hsl(var(--chart-2))',
  'Inference Latency': 'hsl(var(--chart-3))',
  'E2E Latency': 'hsl(var(--chart-4))',
  State: 'hsl(var(--chart-5))'
};

const PRESET_MINUTES = [
  { label: '最近 5 分钟', value: 5 },
  { label: '最近 15 分钟', value: 15 },
  { label: '最近 30 分钟', value: 30 },
  { label: '最近 1 小时', value: 60 },
  { label: '最近 6 小时', value: 360 },
  { label: '最近 24 小时', value: 1440 }
];

export function PipelineMetricsChart({
  workspaceId,
  deploymentId
}: PipelineMetricsChartProps) {
  const api = useAuthApi();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(false);
  const [metricsData, setMetricsData] = React.useState<MetricsResponse | null>(
    null
  );
  const [selectedMinutes, setSelectedMinutes] = React.useState(5);
  const [startTime, setStartTime] = React.useState<Date | undefined>();
  const [endTime, setEndTime] = React.useState<Date | undefined>();
  const [useCustomTime, setUseCustomTime] = React.useState(false);
  const [visibleDatasets, setVisibleDatasets] = React.useState<Set<string>>(
    new Set()
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchMetrics = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (useCustomTime && startTime && endTime) {
        params.append(
          'start_time',
          Math.floor(startTime.getTime() / 1000).toString()
        );
        params.append(
          'end_time',
          Math.floor(endTime.getTime() / 1000).toString()
        );
      } else {
        params.append('minutes', selectedMinutes.toString());
      }

      const response = await api.get(
        `api/reef/workspaces/${workspaceId}/deployments/${deploymentId}/metrics?${params}`
      );

      if (response.ok) {
        const data = (await response.json()) as MetricsResponse;
        setMetricsData(data);

        // 初始化可见数据集（默认显示所有）
        if (data.datasets.length > 0 && visibleDatasets.size === 0) {
          setVisibleDatasets(new Set(data.datasets.map((d) => d.name)));
        }
      } else {
        toast({
          title: '获取指标数据失败',
          description: '请检查网络连接后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('获取指标数据失败:', error);
      toast({
        title: '获取指标数据失败',
        description: '请检查网络连接后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [
    api,
    workspaceId,
    deploymentId,
    selectedMinutes,
    startTime,
    endTime,
    useCustomTime,
    toast,
    visibleDatasets.size
  ]);

  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // 自动刷新
  React.useEffect(() => {
    if (!useCustomTime) {
      const interval = setInterval(fetchMetrics, 30000); // 30秒刷新一次
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, useCustomTime]);

  const toggleDatasetVisibility = (datasetName: string) => {
    const newVisible = new Set(visibleDatasets);
    if (newVisible.has(datasetName)) {
      newVisible.delete(datasetName);
    } else {
      newVisible.add(datasetName);
    }
    setVisibleDatasets(newVisible);
  };

  const getChartConfig = (): ChartConfig => {
    const config: ChartConfig = {};
    metricsData?.datasets.forEach((dataset, index) => {
      const baseColor =
        Object.values(METRIC_COLORS)[
          index % Object.values(METRIC_COLORS).length
        ];
      config[dataset.name] = {
        label: dataset.name,
        color: baseColor
      };
    });
    return config;
  };

  const getChartData = () => {
    if (!metricsData || metricsData.dates.length === 0) return [];

    return metricsData.dates.map((date, index) => {
      const dataPoint: any = { date };
      metricsData.datasets.forEach((dataset) => {
        if (visibleDatasets.has(dataset.name)) {
          dataPoint[dataset.name] = dataset.data[index];
        }
      });
      return dataPoint;
    });
  };

  const formatTooltipValue = (value: any, name: string | number) => {
    const nameStr = String(name);
    if (nameStr.includes('State')) {
      return [value, nameStr];
    }
    if (typeof value === 'number') {
      return [value.toFixed(2), nameStr];
    }
    return [value, nameStr];
  };

  const chartConfig = getChartConfig();
  const chartData = getChartData();

  const ChartComponent = ({ isModal = false }: { isModal?: boolean }) => (
    <div className="relative">
      {!isModal && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8 opacity-60 hover:opacity-100"
          onClick={() => setIsModalOpen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      ) : chartData.length > 0 ? (
        <ChartContainer
          config={chartConfig}
          className={cn('w-full', isModal ? 'h-[60vh]' : 'h-[300px]')}
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return format(date, 'HH:mm');
              }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={formatTooltipValue}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, 'yyyy-MM-dd HH:mm:ss');
                  }}
                />
              }
            />
            <Legend />
            {metricsData?.datasets
              .filter((dataset) => visibleDatasets.has(dataset.name))
              .map((dataset) => (
                <Line
                  key={dataset.name}
                  type="monotone"
                  dataKey={dataset.name}
                  stroke={chartConfig[dataset.name]?.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          暂无指标数据
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription>实时监控的性能指标</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={loading}
            >
              {loading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.refreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* 优化后的时间过滤器 */}
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="custom-time"
                checked={useCustomTime}
                onCheckedChange={(checked) =>
                  setUseCustomTime(checked as boolean)
                }
              />
              <Label htmlFor="custom-time" className="text-sm font-medium">
                自定义时间范围
              </Label>
            </div>

            <div className="grid gap-4">
              {!useCustomTime ? (
                <div className="flex items-center gap-3">
                  <Label htmlFor="minutes" className="min-w-[60px] text-sm">
                    时间范围
                  </Label>
                  <Select
                    value={selectedMinutes.toString()}
                    onValueChange={(value) =>
                      setSelectedMinutes(parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_MINUTES.map((preset) => (
                        <SelectItem
                          key={preset.value}
                          value={preset.value.toString()}
                        >
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm">开始时间</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !startTime && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startTime
                            ? format(startTime, 'MM/dd HH:mm')
                            : '选择开始时间'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startTime}
                          onSelect={setStartTime}
                          initialFocus
                        />
                        <div className="border-t p-3">
                          <Input
                            type="time"
                            value={startTime ? format(startTime, 'HH:mm') : ''}
                            onChange={(e) => {
                              if (startTime && e.target.value) {
                                const [hours, minutes] =
                                  e.target.value.split(':');
                                const newDate = new Date(startTime);
                                newDate.setHours(
                                  parseInt(hours),
                                  parseInt(minutes)
                                );
                                setStartTime(newDate);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">结束时间</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !endTime && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endTime
                            ? format(endTime, 'MM/dd HH:mm')
                            : '选择结束时间'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endTime}
                          onSelect={setEndTime}
                          initialFocus
                        />
                        <div className="border-t p-3">
                          <Input
                            type="time"
                            value={endTime ? format(endTime, 'HH:mm') : ''}
                            onChange={(e) => {
                              if (endTime && e.target.value) {
                                const [hours, minutes] =
                                  e.target.value.split(':');
                                const newDate = new Date(endTime);
                                newDate.setHours(
                                  parseInt(hours),
                                  parseInt(minutes)
                                );
                                setEndTime(newDate);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 数据集过滤器 */}
          {metricsData && metricsData.datasets.length > 0 && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <Label className="text-sm font-medium">显示指标</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {metricsData.datasets.map((dataset) => (
                  <div
                    key={dataset.name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={dataset.name}
                      checked={visibleDatasets.has(dataset.name)}
                      onCheckedChange={() =>
                        toggleDatasetVisibility(dataset.name)
                      }
                    />
                    <Label
                      htmlFor={dataset.name}
                      className="text-xs leading-none"
                    >
                      {dataset.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <ChartComponent />
        </CardContent>
      </Card>

      {/* 模态框展示 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <Card className="relative h-[80vh] w-[90vw] max-w-6xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>指标数据 - 详细视图</CardTitle>
                  <CardDescription>实时监控的性能指标</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                  className="h-6 w-6"
                >
                  <Icons.close className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-120px)]">
              <ChartComponent isModal />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
