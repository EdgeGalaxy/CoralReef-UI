import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Video, Usb, File } from 'lucide-react';
import { SourceDataModel, CameraType } from '@/constants/deploy';

interface CameraStepSelectedItemProps {
  selectedItem: SourceDataModel; // Replace 'any' with your specific type
  handleRemoveItem: () => void;
}

export const CameraStepSelectedItem: React.FC<CameraStepSelectedItemProps> = ({
  selectedItem,
  handleRemoveItem
}) => {
  const getCameraIcon = (type: CameraType) => {
    switch (type) {
      case CameraType.RTSP:
        return <Video className="h-4 w-4" />;
      case CameraType.USB:
        return <Usb className="h-4 w-4" />;
      case CameraType.FILE:
        return <File className="h-4 w-4" />;
    }
  };

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
          <div className="text-muted-foreground">
            {getCameraIcon(selectedItem.type)}
          </div>
          <CardTitle>{selectedItem.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {selectedItem.type}
          </Badge>
        </div>
        <CardDescription className="space-y-1">
          <p>{selectedItem.description}</p>
          <div className="text-sm text-muted-foreground">
            <p>路径: {selectedItem.path}</p>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
