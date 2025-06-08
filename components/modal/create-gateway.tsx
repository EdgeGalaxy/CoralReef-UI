'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface GatewayProps {
  name: string;
  description: string;
  codeSnippet: string;
}

export function CreateGatewayModal({
  name,
  description,
  codeSnippet
}: GatewayProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>创建网关</Button>
      </DialogTrigger>
      <DialogContent
        className="flex h-full w-full flex-col sm:max-h-[60vh] sm:max-w-[70vw]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            {/* <Label>描述</Label> */}
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <div>
            <Label>运行脚本</Label>
            <div className="relative mt-1">
              <SyntaxHighlighter
                language="shell"
                style={vs}
                className="pr-10 text-sm"
              >
                {codeSnippet}
              </SyntaxHighlighter>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
