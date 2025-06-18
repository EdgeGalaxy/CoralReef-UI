import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 顶部统计卡片骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[125px] w-full rounded-xl" />
        ))}
      </div>

      {/* 图表区域骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="h-[400px] rounded-xl lg:col-span-4" />
        <Skeleton className="h-[400px] rounded-xl lg:col-span-3" />
      </div>

      {/* 表格区域骨架 */}
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
