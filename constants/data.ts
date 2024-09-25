import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Workflow',
    href: '/dashboard/workflow',
    icon: 'workflow',
    label: 'workflow'
  },
  {
    title: 'Deploy',
    href: '/dashboard/deploy/gateway',
    icon: 'deploy',
    label: 'deploy',
    children: [
      {
        title: 'Gateway',
        href: '/dashboard/deploy/gateway',
        icon: 'gateway',
        label: 'gateway'
      },
      {
        title: 'Source',
        href: '/dashboard/deploy/source',
        icon: 'source',
        label: 'source'
      },
      {
        title: 'Deployment',
        href: '/dashboard/deploy/deployment',
        icon: 'deployment',
        label: 'deployment'
      }
    ]
  },
  {
    title: 'Monitor',
    href: '/dashboard/monitor',
    icon: 'kanban',
    label: 'monitor'
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
    label: 'settings'
  },
  {
    title: 'Login',
    href: '/',
    icon: 'login',
    label: 'login'
  }
];
