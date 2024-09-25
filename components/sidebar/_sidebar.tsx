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
    <Card className="fixed right-0 top-0 flex h-full w-1/2 flex-col shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
        <div className="flex flex-col">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <Icons.close />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {detailContent}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mb-4 grid w-full grid-cols-5">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
