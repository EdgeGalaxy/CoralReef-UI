'use client';

import React from 'react';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Event } from '../../../constants/events';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface EventLogProps {
  workspaceId: string;
  gatewayId?: string;
  deploymentId?: string;
}

const eventTypeMapping: Record<
  string,
  { label: string; icon: keyof typeof Icons; color: string }
> = {
  gateway_register: {
    label: '网关注册',
    icon: 'gateway',
    color: 'bg-blue-500'
  },
  gateway_online: { label: '网关上线', icon: 'online', color: 'bg-green-500' },
  gateway_offline: { label: '网关下线', icon: 'offline', color: 'bg-red-500' },
  deployment_create: {
    label: '服务创建',
    icon: 'deploy',
    color: 'bg-blue-500'
  },
  deployment_delete: { label: '服务删除', icon: 'trash', color: 'bg-red-500' },
  deployment_pause: {
    label: '服务暂停',
    icon: 'stopped',
    color: 'bg-yellow-500'
  },
  deployment_resume: { label: '服务恢复', icon: 'play', color: 'bg-green-500' },
  deployment_restart: {
    label: '服务重启',
    icon: 'refreshCw',
    color: 'bg-purple-500'
  }
};

const getKey = (
  pageIndex: number,
  previousPageData: Event[] | null,
  workspaceId: string,
  gatewayId?: string,
  deploymentId?: string
) => {
  if (previousPageData && !previousPageData.length) return null;

  const params = new URLSearchParams();
  params.append('skip', (pageIndex * 20).toString());
  params.append('limit', '20');
  if (gatewayId) params.append('gateway_id', gatewayId);
  if (deploymentId) params.append('deployment_id', deploymentId);

  return `api/reef/workspaces/${workspaceId}/events?${params.toString()}`;
};

export function EventLog({
  workspaceId,
  gatewayId,
  deploymentId
}: EventLogProps) {
  const api = useAuthApi();
  const { ref, inView } = useInView();

  const { data, error, size, setSize, isValidating } = useSWRInfinite<Event[]>(
    (pageIndex, previousPageData) =>
      getKey(pageIndex, previousPageData, workspaceId, gatewayId, deploymentId),
    (url: string) => api.get(url).then((res) => res.json()),
    {
      revalidateFirstPage: true
    }
  );

  const events = data ? ([] as Event[]).concat(...data) : [];
  const isLoadingMore =
    (!data && !error) ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 20);

  React.useEffect(() => {
    if (inView && !isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  }, [inView, isReachingEnd, isValidating, setSize, size]);

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">加载日志失败</div>;
  }

  if (isEmpty) {
    return (
      <div className="p-4 text-center text-muted-foreground">暂无操作日志</div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="relative p-4">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />
        {events.map((event, index) => {
          const eventConfig = eventTypeMapping[event.event_type] || {
            label: event.event_type,
            icon: 'helpCircle',
            color: 'bg-gray-400'
          };
          const Icon = Icons[eventConfig.icon];
          return (
            <div key={event.id} className="relative mb-6 flex items-start">
              <div
                className={`z-10 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-border ${eventConfig.color}`}
              >
                <Icon className="h-3 w-3 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{eventConfig.label}</Badge>
                  {event.details && Object.keys(event.details).length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer text-muted-foreground">
                            <Icons.help className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-xs whitespace-pre-wrap"
                        >
                          <pre className="text-xs">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={ref} className="flex items-center justify-center p-4">
          {isLoadingMore && !isReachingEnd && (
            <Icons.spinner className="h-6 w-6 animate-spin" />
          )}
          {isReachingEnd && (
            <p className="text-sm text-muted-foreground">已加载全部日志</p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
