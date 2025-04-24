'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface TranslationItemProps {
  name: string;
  originalTitle: string;
  originalDescription: string;
  cnTitle: string;
  cnDescription: string;
  onChange: (name: string, cnTitle: string, cnDescription: string) => void;
}

export function TranslationItem({
  name,
  originalTitle,
  originalDescription,
  cnTitle,
  cnDescription,
  onChange
}: TranslationItemProps) {
  return (
    <div className="space-y-4">
      <div className="font-medium">{name}</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>原始标题</Label>
          <Input value={originalTitle} readOnly className="bg-muted" />
        </div>
        <div>
          <Label>中文标题</Label>
          <Input
            value={cnTitle}
            onChange={(e) => onChange(name, e.target.value, cnDescription)}
            placeholder="请输入中文标题"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>原始描述</Label>
          <Input value={originalDescription} readOnly className="bg-muted" />
        </div>
        <div>
          <Label>中文描述</Label>
          <Input
            value={cnDescription}
            onChange={(e) => onChange(name, cnTitle, e.target.value)}
            placeholder="请输入中文描述"
          />
        </div>
      </div>
      <Separator className="my-4" />
    </div>
  );
}
