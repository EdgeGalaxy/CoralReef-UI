'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuthApi } from '@/hooks/useAuthReq';
import { CameraType, Gateway } from '@/constants/deploy';
import { handleApiRequest } from '@/lib/error-handle';
import { RefreshCw } from 'lucide-react';
import { ModelFileUpload } from '@/components/model-file-upload';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  type: z.nativeEnum(CameraType),
  path: z.string().superRefine((val, ctx) => {
    const type = ctx.path[0];
    if (type === CameraType.RTSP && !val.startsWith('rtsp://')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RTSP地址必须以rtsp://开头'
      });
    } else if (type === CameraType.USB) {
      const num = parseInt(val);
      if (isNaN(num) || num < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'USB设备编号必须是非负整数'
        });
      }
    }
  }),
  gateway_id: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateSourceDialog({
  workspaceId,
  gateways,
  onSuccess
}: {
  workspaceId: string;
  gateways: Gateway[];
  onSuccess?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const api = useAuthApi();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: CameraType.RTSP,
      path: '',
      gateway_id: ''
    },
    mode: 'onChange'
  });

  // 监听相机类型变化，重置path字段
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type') {
        form.setValue('path', '');
        form.clearErrors('path');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: FormValues) {
    // 手动验证路径
    let isValid = true;

    if (values.type === CameraType.RTSP && !values.path.startsWith('rtsp://')) {
      form.setError('path', { message: 'RTSP地址必须以rtsp://开头' });
      isValid = false;
    } else if (values.type === CameraType.USB) {
      const num = parseInt(values.path as string);
      if (isNaN(num) || num < 0) {
        form.setError('path', { message: 'USB设备编号必须是非负整数' });
        isValid = false;
      }
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      await handleApiRequest(
        () => {
          const submitData = {
            ...values,
            path:
              values.type === CameraType.USB
                ? parseInt(values.path as string)
                : values.path
          };

          return api.post(`api/reef/workspaces/${workspaceId}/cameras/`, {
            json: submitData
          });
        },
        {
          toast,
          successTitle: '创建成功',
          errorTitle: '创建失败',
          onSuccess: () => {
            setIsOpen(false);
            onSuccess?.();
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={isLoading}>
        创建相机
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          )}
          <DialogHeader>
            <DialogTitle>创建相机</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>相机名称</FormLabel>
                    <FormControl>
                      <Input placeholder="输入相机名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Input placeholder="输入描述信息" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>相机类型</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择相机类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CameraType.RTSP}>RTSP流</SelectItem>
                        <SelectItem value={CameraType.USB}>USB设备</SelectItem>
                        <SelectItem value={CameraType.FILE}>
                          视频文件
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('type') === CameraType.USB
                        ? '设备编号'
                        : '相机路径'}
                    </FormLabel>
                    <FormControl>
                      {form.watch('type') === CameraType.FILE ? (
                        <div className="space-y-2">
                          <ModelFileUpload
                            onUploadComplete={(key) => {
                              field.onChange(key);
                              form.setValue('path', key);
                            }}
                            label="上传视频文件"
                            accept=".mp4"
                            disabled={isLoading}
                          />
                          {field.value && (
                            <div className="truncate text-sm text-muted-foreground">
                              当前文件: {field.value}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          placeholder={
                            form.watch('type') === CameraType.USB
                              ? '输入USB设备编号（如：0）'
                              : form.watch('type') === CameraType.RTSP
                              ? '输入RTSP地址（以rtsp://开头）'
                              : '输入视频文件路径'
                          }
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);

                            // 实时验证
                            const type = form.getValues('type');
                            if (
                              type === CameraType.RTSP &&
                              !e.target.value.startsWith('rtsp://')
                            ) {
                              form.setError('path', {
                                message: 'RTSP地址必须以rtsp://开头'
                              });
                            } else if (type === CameraType.USB) {
                              const num = parseInt(e.target.value);
                              if (isNaN(num) || num < 0) {
                                form.setError('path', {
                                  message: 'USB设备编号必须是非负整数'
                                });
                              } else {
                                form.clearErrors('path');
                              }
                            } else {
                              form.clearErrors('path');
                            }
                          }}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gateway_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网关</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择网关（可选）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gateways?.map((gateway: Gateway) => (
                          <SelectItem key={gateway.id} value={gateway.id}>
                            {gateway.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '创建中...' : '创建相机'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
