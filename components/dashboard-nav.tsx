'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/types';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface DashboardNavProps {
  items: NavItem[];
  isMinimized: boolean;
  expandedItems: string[];
  onItemClick: (item: NavItem) => void;
}

export function DashboardNav({
  items,
  isMinimized,
  expandedItems,
  onItemClick
}: DashboardNavProps) {
  const path = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = Icons[item.icon || 'arrowRight'];
        const isActive = path === item.href;
        const isExpanded = expandedItems.includes(item.title);

        return (
          <div key={index}>
            <Button
              asChild={!item.children}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isMinimized && 'justify-center px-2'
              )}
              onClick={() => onItemClick(item)}
            >
              {item.children ? (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="mr-2 h-4 w-4" />
                    {!isMinimized && <span>{item.title}</span>}
                  </div>
                  {!isMinimized && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {!isMinimized && <span>{item.title}</span>}
                </Link>
              )}
            </Button>
            {item.children && isExpanded && !isMinimized && (
              <div className="ml-4 mt-2 space-y-1">
                {item.children.map((child, childIndex) => (
                  <Button
                    key={childIndex}
                    asChild
                    variant={path === child.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <Link href={child.href}>{child.title}</Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
