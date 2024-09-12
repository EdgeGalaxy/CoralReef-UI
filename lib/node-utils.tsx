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
        border: 'border-purple-200',
        bg: 'bg-purple-100'
      };
    case 'formatter':
      return {
        icon: <PackageIcon className="h-4 w-4" />,
        border: 'border-green-200',
        bg: 'bg-green-100'
      };
    case 'fusion':
      return {
        icon: <CombineIcon className="h-4 w-4" />,
        border: 'border-orange-200',
        bg: 'bg-orange-100'
      };
    case 'flow_control':
      return {
        icon: <WorkflowIcon className="h-4 w-4" />,
        border: 'border-blue-200',
        bg: 'bg-blue-100'
      };
    case 'sink':
      return {
        icon: <PackageIcon className="h-4 w-4" />,
        border: 'border-red-200',
        bg: 'bg-red-100'
      };
    case 'transformation':
      return {
        icon: <CropIcon className="h-4 w-4" />,
        border: 'border-yellow-200',
        bg: 'bg-yellow-100'
      };
    case 'visualization':
      return {
        icon: <PaletteIcon className="h-4 w-4" />,
        border: 'border-green-200',
        bg: 'bg-green-100'
      };
    default:
      return {
        icon: <PackageIcon className="h-4 w-4" />,
        border: 'border-gray-200',
        bg: 'bg-gray-100'
      };
  }
};
