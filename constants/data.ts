import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: '首页',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    is_superuser: false
  },
  {
    title: '工作流',
    href: '/dashboard/workflow',
    icon: 'workflow',
    label: 'workflow',
    is_superuser: false
  },
  {
    title: '部署',
    href: '/dashboard/deploy/gateway',
    icon: 'deploy',
    label: 'deploy',
    is_superuser: false,
    children: [
      {
        title: '网关',
        href: '/dashboard/deploy/gateway',
        icon: 'gateway',
        label: 'gateway',
        is_superuser: false
      },
      {
        title: '数据源',
        href: '/dashboard/deploy/source',
        icon: 'source',
        label: 'source',
        is_superuser: false
      },
      {
        title: '服务',
        href: '/dashboard/deploy/deployment',
        icon: 'deployment',
        label: 'deployment',
        is_superuser: false
      }
    ]
  },
  {
    title: '模型',
    href: '/dashboard/ml-models',
    icon: 'model',
    label: 'model',
    is_superuser: false
  },
  // {
  //   title: '监控',
  //   href: '/dashboard/monitor',
  //   icon: 'kanban',
  //   label: 'monitor'
  // },
  {
    title: '设置',
    href: '/dashboard/settings',
    icon: 'settings',
    label: 'settings',
    is_superuser: false
  }
];
