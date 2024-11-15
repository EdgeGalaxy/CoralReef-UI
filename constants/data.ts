import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: '首页',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: '工作流',
    href: '/dashboard/workflow',
    icon: 'workflow',
    label: 'workflow'
  },
  {
    title: '部署',
    href: '/dashboard/deploy/gateway',
    icon: 'deploy',
    label: 'deploy',
    children: [
      {
        title: '网关',
        href: '/dashboard/deploy/gateway',
        icon: 'gateway',
        label: 'gateway'
      },
      {
        title: '数据源',
        href: '/dashboard/deploy/source',
        icon: 'source',
        label: 'source'
      },
      {
        title: '服务',
        href: '/dashboard/deploy/deployment',
        icon: 'deployment',
        label: 'deployment'
      }
    ]
  },
  {
    title: '监控',
    href: '/dashboard/monitor',
    icon: 'kanban',
    label: 'monitor'
  },
  {
    title: '设置',
    href: '/dashboard/settings',
    icon: 'settings',
    label: 'settings'
  }
];
