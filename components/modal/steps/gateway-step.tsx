import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Gateway, GatewayStatus } from '@/constants/deploy';
import { Badge } from '@/components/ui/badge';

interface GatewayStepSelectedItemProps {
  selectedItem: Gateway; // Replace 'any' with your specific type
  handleRemoveItem: () => void;
}

export const GatewayStepSelectedItem: React.FC<
  GatewayStepSelectedItemProps
> = ({ selectedItem, handleRemoveItem }) => {
  return (
    <Card className="relative mt-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={() => handleRemoveItem()}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{selectedItem.name}</CardTitle>
          <Badge
            variant={
              selectedItem.status === GatewayStatus.ONLINE
                ? 'default'
                : 'destructive'
            }
          >
            {selectedItem.status}
          </Badge>
        </div>
        <CardDescription className="space-y-1">
          <p>{selectedItem.description}</p>
          <div className="text-sm text-muted-foreground">
            <p>版本: {selectedItem.version}</p>
            {selectedItem.ip_address && <p>地址: {selectedItem.ip_address}</p>}
            <p>平台: {selectedItem.platform}</p>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
