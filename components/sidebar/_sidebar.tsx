'use client';

import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface TabConfig {
  value: string;
  label: string;
  content: ReactNode;
}

interface SidebarProps {
  title: string;
  onClose: () => void;
  detailContent: ReactNode;
  tabs: TabConfig[];
  defaultTab?: string;
}

export function Sidebar({
  title,
  onClose,
  detailContent,
  tabs,
  defaultTab
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].value);

  return (
    <Card className="fixed right-0 top-0 z-50 flex h-full w-full flex-col shadow-lg sm:w-1/2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6">
        <div className="flex flex-col">
          <CardTitle className="text-xl font-bold md:text-2xl">
            {title}
          </CardTitle>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <Icons.close />
        </Button>
      </CardHeader>
      <CardContent className="overflow-y-auto p-4 md:p-6">
        {detailContent}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mb-4 flex w-full flex-wrap gap-2">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="min-w-[100px] max-w-[200px] flex-1 text-sm md:text-base"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
