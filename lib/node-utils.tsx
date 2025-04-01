import {
  PackageIcon,
  WorkflowIcon,
  CropIcon,
  PaletteIcon,
  CombineIcon
} from 'lucide-react';

export type NodeColorInfo = {
  icon: JSX.Element;
  border: string;
  bg: string;
};

export const getNodeColor = (type: string): NodeColorInfo => {
  switch (type.toLowerCase()) {
    case 'model':
      return {
        icon: <PackageIcon className="h-4 w-4" />,
        border: 'border-purple-200 dark:border-purple-700',
        bg: 'bg-purple-100 dark:bg-purple-900/40'
      };
    case 'formatter':
      return {
        icon: <PackageIcon className="h-4 w-4" />,
        border: 'border-green-200 dark:border-green-700',
        bg: 'bg-green-100 dark:bg-green-900/40'
      };
    case 'fusion':
      return {
        icon: <CombineIcon className="h-4 w-4" />,
        border: 'border-orange-200 dark:border-orange-700',
        bg: 'bg-orange-100 dark:bg-orange-900/40'
      };
    case 'flow_control':
      return {
        icon: <WorkflowIcon className="h-4 w-4" />,
        border: 'border-blue-200 dark:border-blue-700',
        bg: 'bg-blue-100 dark:bg-blue-900/40'
      };
    case 'sink':
      return {
        icon: <PackageIcon className="h-4 w-4" />,
        border: 'border-red-200 dark:border-red-700',
        bg: 'bg-red-100 dark:bg-red-900/40'
      };
    case 'transformation':
      return {
        icon: <CropIcon className="h-4 w-4" />,
        border: 'border-yellow-200 dark:border-yellow-700',
        bg: 'bg-yellow-100 dark:bg-yellow-900/40'
      };
    case 'visualization':
      return {
        icon: <PaletteIcon className="h-4 w-4" />,
        border: 'border-green-200 dark:border-green-700',
        bg: 'bg-green-100 dark:bg-green-900/40'
      };
    default:
      return {
        icon: <PackageIcon className="h-4 w-4" />,
        border: 'border-gray-200 dark:border-gray-700',
        bg: 'bg-gray-100 dark:bg-gray-800/40'
      };
  }
};
