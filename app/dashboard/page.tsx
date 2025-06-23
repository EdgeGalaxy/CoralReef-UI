'use client';

import { BarGraph } from '@/components/charts/bar-graph';
import { PieGraph } from '@/components/charts/pie-graph';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLoading from '@/app/dashboard/loading';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import DashboardError from './error';

export default function Page() {
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) || session.data?.user.select_workspace_id;

  const {
    data: stats,
    error,
    mutate
  } = useAuthSWR<{
    overview: { gateways: number; cameras: number; deployments: number };
    deployments_by_status: Record<string, number>;
    gateways_by_status: Record<string, number>;
  }>(workspaceId ? `/api/reef/workspace/${workspaceId}/statics` : null);

  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  if (!stats) return <DashboardLoading />;

  const overview = stats.overview || {
    gateways: 0,
    cameras: 0,
    deployments: 0
  };
  const deploymentsByStatus = stats.deployments_by_status
    ? Object.entries(stats.deployments_by_status).map(([status, count]) => ({
        status,
        count: count as number
      }))
    : [];
  const gatewaysByStatus = stats.gateways_by_status
    ? Object.entries(stats.gateways_by_status).map(([status, count]) => ({
        status,
        count: count as number
      }))
    : [];

  return (
    <PageContainer scrollable={true}>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">网关</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22a10 10 0 0 0 10-10h-2a8 8 0 0 1-8 8v2z" />
                    <path d="M2 12a10 10 0 0 1 10-10v2a8 8 0 0 0-8 8H2z" />
                    <path d="M20 12a8 8 0 0 1-8 8v2a10 10 0 0 0 10-10h-2z" />
                    <path d="M4 12a8 8 0 0 0 8 8v-2a10 10 0 0 1-10-10H4z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.gateways}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">数据源</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.cameras}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">服务</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 18v-4h16v4" />
                    <path d="M4 10V6h16v4" />
                    <path d="M12 2v4" />
                    <path d="M12 14v4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overview.deployments}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <BarGraph data={deploymentsByStatus} />
              </div>
              <div className="col-span-4 md:col-span-3">
                <PieGraph data={gatewaysByStatus} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
