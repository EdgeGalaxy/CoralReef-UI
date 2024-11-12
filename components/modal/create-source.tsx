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
import { api } from '@/lib/utils';
import { CameraType } from '@/constants/deploy';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  type: z.nativeEnum(CameraType),
  path: z.union([z.string(), z.number()]),
  gateway_id: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateSourceDialog({
  workspaceId
}: {
  workspaceId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: CameraType.RTSP,
      path: '',
      gateway_id: ''
    }
  });

  async function onSubmit(values: FormValues) {
    try {
      const submitData = {
        ...values,
        path:
          values.type === CameraType.USB
            ? parseInt(values.path as string)
            : values.path
      };

      await api
        .post(`api/reef/workspaces/${workspaceId}/cameras/`, {
          json: submitData
        })
        .json();

      toast({
        title: '创建成功',
        description: '相机已成功创建'
      });
      setIsOpen(false);
      // reload current page
      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      });
      console.error('Failed to create camera:', error);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>创建相机</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
                        <SelectItem value={CameraType.RTSP}>
                          RTSP相机
                        </SelectItem>
                        <SelectItem value={CameraType.USB}>USB相机</SelectItem>
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
                      <Input
                        placeholder={
                          form.watch('type') === CameraType.USB
                            ? '输入USB设备编号（如：0）'
                            : form.watch('type') === CameraType.RTSP
                            ? '输入RTSP地址'
                            : '输入视频文件路径'
                        }
                        {...field}
                      />
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
                    <FormLabel>网关ID</FormLabel>
                    <FormControl>
                      <Input placeholder="输入网关ID（可选）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">创建相机</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
