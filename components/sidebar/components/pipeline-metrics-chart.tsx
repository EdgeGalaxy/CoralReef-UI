'use client';

import React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Maximize2,
  BarChart3,
  Timer,
  Zap,
  Activity
} from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

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

const METRIC_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220, 70%, 60%)',
  'hsl(120, 70%, 60%)',
  'hsl(280, 70%, 60%)',
  'hsl(40, 70%, 60%)',
  'hsl(180, 70%, 60%)'
];

const PRESET_MINUTES = [
  { label: '最近 5 分钟', value: 5 },
  { label: '最近 15 分钟', value: 15 },
  { label: '最近 30 分钟', value: 30 },
  { label: '最近 1 小时', value: 60 },
  { label: '最近 6 小时', value: 360 },
  { label: '最近 24 小时', value: 1440 }
];

type ChartType = 'throughput' | 'latency' | 'state' | 'other';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  chartData: any[];
  datasets: any[];
  chartConfig: ChartConfig;
  formatTooltipValue: (value: any, name: string | number) => [any, string];
  icon: React.ReactNode;
  timeAxisConfig: {
    formatter: (value: any) => string;
    interval: any;
  };
}

function ChartModal({
  isOpen,
  onClose,
  title,
  description,
  chartData,
  datasets,
  chartConfig,
  formatTooltipValue,
  icon,
  timeAxisConfig
}: ChartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="h-[60vh]">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={timeAxisConfig.formatter}
                  interval={timeAxisConfig.interval}
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
                {datasets.map((dataset) => (
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
            <div className="flex h-full items-center justify-center text-muted-foreground">
              暂无指标数据
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const [modalChart, setModalChart] = React.useState<ChartType | null>(null);

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

  // 获取吞吐量数据集
  const getThroughputDatasets = () => {
    if (!metricsData?.datasets) return [];

    return metricsData.datasets.filter(
      (dataset) =>
        dataset.data &&
        dataset.data.length > 0 &&
        dataset.name.includes('Throughput') &&
        visibleDatasets.has(dataset.name)
    );
  };

  // 获取延迟相关的数据集
  const getLatencyDatasets = () => {
    if (!metricsData?.datasets) return [];

    return metricsData.datasets.filter(
      (dataset) =>
        dataset.data &&
        dataset.data.length > 0 &&
        (dataset.name.includes('Frame Decoding') ||
          dataset.name.includes('Inference Latency') ||
          dataset.name.includes('E2E Latency')) &&
        visibleDatasets.has(dataset.name)
    );
  };

  // 获取状态数据集
  const getStateDatasets = () => {
    if (!metricsData?.datasets) return [];

    return metricsData.datasets.filter(
      (dataset) =>
        dataset.data &&
        dataset.data.length > 0 &&
        dataset.name.includes('State') &&
        visibleDatasets.has(dataset.name)
    );
  };

  // 获取其他数字类型的数据集
  const getOtherNumericDatasets = () => {
    if (!metricsData?.datasets) return [];

    return metricsData.datasets.filter(
      (dataset) =>
        dataset.data &&
        dataset.data.length > 0 &&
        typeof dataset.data[0] === 'number' &&
        !dataset.name.includes('Frame Decoding') &&
        !dataset.name.includes('Inference Latency') &&
        !dataset.name.includes('E2E Latency') &&
        !dataset.name.includes('Throughput') &&
        !dataset.name.includes('State') &&
        visibleDatasets.has(dataset.name)
    );
  };

  const getChartConfig = (datasets: any[]): ChartConfig => {
    const config: ChartConfig = {};
    datasets.forEach((dataset, index) => {
      config[dataset.name] = {
        label: dataset.name,
        color: METRIC_COLORS[index % METRIC_COLORS.length]
      };
    });
    return config;
  };

  const getChartData = (datasets: any[]) => {
    if (!metricsData || metricsData.dates.length === 0 || datasets.length === 0)
      return [];

    return metricsData.dates.map((date, index) => {
      const dataPoint: any = { date };
      datasets.forEach((dataset) => {
        dataPoint[dataset.name] = dataset.data[index];
      });
      return dataPoint;
    });
  };

  // 转换状态数据为时间线格式
  const convertStateDataToTimeline = (datasets: any[]) => {
    if (!metricsData || metricsData.dates.length === 0 || datasets.length === 0)
      return [];

    return metricsData.dates.map((date, index) => {
      const dataPoint: any = { date };

      datasets.forEach((dataset) => {
        if (dataset.data && dataset.data[index] !== undefined) {
          const state = dataset.data[index];
          // 将状态转换为数字以便在图表中显示
          let stateValue = 0;
          switch (state) {
            case 'NOT_STARTED':
              stateValue = 0;
              break;
            case 'INITIALISING':
              stateValue = 1;
              break;
            case 'RESTARTING':
              stateValue = 2;
              break;
            case 'RUNNING':
              stateValue = 3;
              break;
            case 'PAUSED':
              stateValue = 4;
              break;
            case 'MUTED':
              stateValue = 5;
              break;
            case 'TERMINATING':
              stateValue = 6;
              break;
            case 'ENDED':
              stateValue = 7;
              break;
            case 'ERROR':
              stateValue = 8;
              break;
            default:
              stateValue = 0;
          }
          dataPoint[dataset.name] = stateValue;
          dataPoint[`${dataset.name}_label`] = state;
        }
      });

      return dataPoint;
    });
  };

  const formatTooltipValue = (
    value: any,
    name: string | number
  ): [any, string] => {
    const nameStr = String(name);
    if (nameStr.includes('State')) {
      return [value, nameStr];
    }
    if (typeof value === 'number') {
      return [value.toFixed(2), nameStr];
    }
    return [value, nameStr];
  };

  // 根据时间跨度计算合适的时间轴格式和间隔
  const getTimeAxisConfig = (minutes: number) => {
    if (minutes <= 5) {
      // 5分钟内：每分钟显示
      return {
        formatter: (value: any) => format(new Date(value), 'HH:mm'),
        interval: 'preserveStartEnd' as const
      };
    } else if (minutes <= 15) {
      // 15分钟内：每3分钟显示
      return {
        formatter: (value: any) => format(new Date(value), 'HH:mm'),
        interval: 2 // 大约每3个点显示一次
      };
    } else if (minutes <= 30) {
      // 30分钟内：每5分钟显示
      return {
        formatter: (value: any) => format(new Date(value), 'HH:mm'),
        interval: 4 // 大约每5个点显示一次
      };
    } else if (minutes <= 60) {
      // 1小时内：每10分钟显示
      return {
        formatter: (value: any) => format(new Date(value), 'HH:mm'),
        interval: 9 // 大约每10个点显示一次
      };
    } else if (minutes <= 360) {
      // 6小时内：每30分钟显示
      return {
        formatter: (value: any) => format(new Date(value), 'HH:mm'),
        interval: 29 // 大约每30个点显示一次
      };
    } else {
      // 超过6小时：每小时显示
      return {
        formatter: (value: any) => format(new Date(value), 'MM/dd HH:mm'),
        interval: 59 // 大约每60个点显示一次
      };
    }
  };

  const throughputDatasets = getThroughputDatasets();
  const latencyDatasets = getLatencyDatasets();
  const stateDatasets = getStateDatasets();
  const otherDatasets = getOtherNumericDatasets();

  const throughputChartData = getChartData(throughputDatasets);
  const latencyChartData = getChartData(latencyDatasets);
  const stateChartData = convertStateDataToTimeline(stateDatasets);
  const otherChartData = getChartData(otherDatasets);

  const throughputConfig = getChartConfig(throughputDatasets);
  const latencyConfig = getChartConfig(latencyDatasets);
  const stateConfig = getChartConfig(stateDatasets);
  const otherConfig = getChartConfig(otherDatasets);

  // 获取当前的时间轴配置
  const currentMinutes =
    useCustomTime && startTime && endTime
      ? Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : selectedMinutes;
  const timeAxisConfig = getTimeAxisConfig(currentMinutes);

  // 自定义状态图表的Tooltip
  const StateTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium">{`时间: ${format(
            new Date(label),
            'yyyy-MM-dd HH:mm:ss'
          )}`}</p>
          {payload.map((entry: any, index: number) => {
            const labelKey = `${entry.dataKey}_label`;
            const stateLabel = entry.payload[labelKey] || 'unknown';
            return (
              <p key={index} style={{ color: entry.color }}>
                {`${entry.dataKey}: ${stateLabel}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const MetricChart = ({
    title,
    description,
    datasets,
    chartData,
    chartConfig,
    onMaximize,
    icon,
    isStateChart = false
  }: {
    title: string;
    description: string;
    datasets: any[];
    chartData: any[];
    chartConfig: ChartConfig;
    onMaximize: () => void;
    icon: React.ReactNode;
    isStateChart?: boolean;
  }) => (
    <Card className="min-w-0 flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-60 hover:opacity-100"
            onClick={onMaximize}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[250px] items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        ) : chartData.length > 0 && datasets.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={timeAxisConfig.formatter}
                interval={timeAxisConfig.interval}
              />
              {isStateChart ? (
                <YAxis
                  domain={[0, 8]}
                  tickFormatter={(value) => {
                    switch (value) {
                      case 0:
                        return 'NOT_STARTED';
                      case 1:
                        return 'INITIALISING';
                      case 2:
                        return 'RESTARTING';
                      case 3:
                        return 'RUNNING';
                      case 4:
                        return 'PAUSED';
                      case 5:
                        return 'MUTED';
                      case 6:
                        return 'TERMINATING';
                      case 7:
                        return 'ENDED';
                      case 8:
                        return 'ERROR';
                      default:
                        return '';
                    }
                  }}
                />
              ) : (
                <YAxis />
              )}
              <ChartTooltip
                content={
                  isStateChart ? (
                    <StateTooltip />
                  ) : (
                    <ChartTooltipContent
                      formatter={formatTooltipValue}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return format(date, 'yyyy-MM-dd HH:mm:ss');
                      }}
                    />
                  )
                }
              />
              <Legend />
              {datasets.map((dataset) => (
                <Line
                  key={dataset.name}
                  type={isStateChart ? 'stepAfter' : 'monotone'}
                  dataKey={dataset.name}
                  stroke={chartConfig[dataset.name]?.color}
                  strokeWidth={isStateChart ? 1 : 2}
                  dot={isStateChart ? { r: 3 } : false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            暂无指标数据
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        {/* 控制面板 */}
        <Card>
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pipeline 指标监控</CardTitle>
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

            {/* 时间过滤器 */}
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
                              value={
                                startTime ? format(startTime, 'HH:mm') : ''
                              }
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
        </Card>

        {/* 图表展示区域 */}
        <div className="space-y-4">
          {/* 第一行：吞吐量和延迟 */}
          <div className="flex flex-col gap-4 lg:flex-row">
            <MetricChart
              title="吞吐量指标"
              description="系统处理能力趋势"
              datasets={throughputDatasets}
              chartData={throughputChartData}
              chartConfig={throughputConfig}
              onMaximize={() => setModalChart('throughput')}
              icon={<BarChart3 className="h-5 w-5" />}
            />
            <MetricChart
              title="延迟指标"
              description="响应时间性能趋势"
              datasets={latencyDatasets}
              chartData={latencyChartData}
              chartConfig={latencyConfig}
              onMaximize={() => setModalChart('latency')}
              icon={<Timer className="h-5 w-5" />}
            />
          </div>

          {/* 第二行：状态时间线和其他指标 */}
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* 状态时间线图表 */}
            {stateDatasets.length > 0 && (
              <div
                className={`${
                  stateDatasets.length > 0 && otherDatasets.length > 0
                    ? 'min-w-0 flex-1'
                    : 'w-full'
                }`}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-base">
                            状态时间线
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Pipeline组件状态变化趋势
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-60 hover:opacity-100"
                        onClick={() => setModalChart('state')}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex h-[250px] items-center justify-center">
                        <Icons.spinner className="h-8 w-8 animate-spin" />
                      </div>
                    ) : stateChartData.length > 0 ? (
                      <>
                        <ChartContainer
                          config={stateConfig}
                          className="h-[250px] w-full"
                        >
                          <LineChart data={stateChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={timeAxisConfig.formatter}
                              interval={timeAxisConfig.interval}
                            />
                            <YAxis
                              domain={[0, 8]}
                              tickFormatter={(value) => {
                                switch (value) {
                                  case 0:
                                    return 'NOT_STARTED';
                                  case 1:
                                    return 'INITIALISING';
                                  case 2:
                                    return 'RESTARTING';
                                  case 3:
                                    return 'RUNNING';
                                  case 4:
                                    return 'PAUSED';
                                  case 5:
                                    return 'MUTED';
                                  case 6:
                                    return 'TERMINATING';
                                  case 7:
                                    return 'ENDED';
                                  case 8:
                                    return 'ERROR';
                                  default:
                                    return '';
                                }
                              }}
                            />
                            <ChartTooltip content={<StateTooltip />} />
                            <Legend />
                            {stateDatasets.map((dataset) => (
                              <Line
                                key={dataset.name}
                                type="stepAfter"
                                dataKey={dataset.name}
                                stroke={stateConfig[dataset.name]?.color}
                                strokeWidth={1}
                                dot={{ r: 3 }}
                                connectNulls={false}
                              />
                            ))}
                          </LineChart>
                        </ChartContainer>
                        {/* 状态标签 */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-gray-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-gray-500"></div>
                            NOT_STARTED
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div>
                            INITIALISING
                          </Badge>
                          <Badge variant="outline" className="bg-orange-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-orange-500"></div>
                            RESTARTING
                          </Badge>
                          <Badge variant="outline" className="bg-green-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-green-500"></div>
                            RUNNING
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-yellow-500"></div>
                            PAUSED
                          </Badge>
                          <Badge variant="outline" className="bg-purple-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-purple-500"></div>
                            MUTED
                          </Badge>
                          <Badge variant="outline" className="bg-pink-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-pink-500"></div>
                            TERMINATING
                          </Badge>
                          <Badge variant="outline" className="bg-slate-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-slate-500"></div>
                            ENDED
                          </Badge>
                          <Badge variant="outline" className="bg-red-100">
                            <div className="mr-1 h-3 w-3 rounded-full bg-red-500"></div>
                            ERROR
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                        暂无状态数据
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 其他指标 */}
            {otherDatasets.length > 0 && (
              <div
                className={`${
                  stateDatasets.length > 0 && otherDatasets.length > 0
                    ? 'min-w-0 flex-1'
                    : 'w-full'
                }`}
              >
                <MetricChart
                  title="其他性能指标"
                  description="其他监控数据趋势"
                  datasets={otherDatasets}
                  chartData={otherChartData}
                  chartConfig={otherConfig}
                  onMaximize={() => setModalChart('other')}
                  icon={<Zap className="h-5 w-5" />}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 模态框展示 */}
      <ChartModal
        isOpen={modalChart === 'throughput'}
        onClose={() => setModalChart(null)}
        title="吞吐量指标 - 详细视图"
        description="系统处理能力详细趋势分析"
        chartData={throughputChartData}
        datasets={throughputDatasets}
        chartConfig={throughputConfig}
        formatTooltipValue={formatTooltipValue}
        icon={<BarChart3 className="h-5 w-5" />}
        timeAxisConfig={timeAxisConfig}
      />

      <ChartModal
        isOpen={modalChart === 'latency'}
        onClose={() => setModalChart(null)}
        title="延迟指标 - 详细视图"
        description="响应时间性能详细趋势分析"
        chartData={latencyChartData}
        datasets={latencyDatasets}
        chartConfig={latencyConfig}
        formatTooltipValue={formatTooltipValue}
        icon={<Timer className="h-5 w-5" />}
        timeAxisConfig={timeAxisConfig}
      />

      <ChartModal
        isOpen={modalChart === 'other'}
        onClose={() => setModalChart(null)}
        title="其他性能指标 - 详细视图"
        description="其他监控数据详细趋势分析"
        chartData={otherChartData}
        datasets={otherDatasets}
        chartConfig={otherConfig}
        formatTooltipValue={formatTooltipValue}
        icon={<Zap className="h-5 w-5" />}
        timeAxisConfig={timeAxisConfig}
      />

      {/* 状态图表模态框 */}
      {modalChart === 'state' && (
        <Dialog open={true} onOpenChange={() => setModalChart(null)}>
          <DialogContent className="max-h-[90vh] max-w-6xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                状态时间线 - 详细视图
              </DialogTitle>
              <DialogDescription>
                Pipeline组件状态变化详细趋势分析
              </DialogDescription>
            </DialogHeader>
            <div className="h-[60vh]">
              {stateChartData.length > 0 ? (
                <>
                  <ChartContainer
                    config={stateConfig}
                    className="h-full w-full"
                  >
                    <LineChart data={stateChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={timeAxisConfig.formatter}
                        interval={timeAxisConfig.interval}
                      />
                      <YAxis
                        domain={[0, 8]}
                        tickFormatter={(value) => {
                          switch (value) {
                            case 0:
                              return 'NOT_STARTED';
                            case 1:
                              return 'INITIALISING';
                            case 2:
                              return 'RESTARTING';
                            case 3:
                              return 'RUNNING';
                            case 4:
                              return 'PAUSED';
                            case 5:
                              return 'MUTED';
                            case 6:
                              return 'TERMINATING';
                            case 7:
                              return 'ENDED';
                            case 8:
                              return 'ERROR';
                            default:
                              return '';
                          }
                        }}
                      />
                      <ChartTooltip content={<StateTooltip />} />
                      <Legend />
                      {stateDatasets.map((dataset) => (
                        <Line
                          key={dataset.name}
                          type="stepAfter"
                          dataKey={dataset.name}
                          stroke={stateConfig[dataset.name]?.color}
                          strokeWidth={1}
                          dot={{ r: 3 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ChartContainer>
                  {/* 状态标签 */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-gray-500"></div>
                      NOT_STARTED
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div>
                      INITIALISING
                    </Badge>
                    <Badge variant="outline" className="bg-orange-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-orange-500"></div>
                      RESTARTING
                    </Badge>
                    <Badge variant="outline" className="bg-green-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-green-500"></div>
                      RUNNING
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-yellow-500"></div>
                      PAUSED
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-purple-500"></div>
                      MUTED
                    </Badge>
                    <Badge variant="outline" className="bg-pink-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-pink-500"></div>
                      TERMINATING
                    </Badge>
                    <Badge variant="outline" className="bg-slate-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-slate-500"></div>
                      ENDED
                    </Badge>
                    <Badge variant="outline" className="bg-red-100">
                      <div className="mr-1 h-3 w-3 rounded-full bg-red-500"></div>
                      ERROR
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  暂无状态数据
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
