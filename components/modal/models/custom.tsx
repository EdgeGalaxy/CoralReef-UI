import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { MLPlatform, MLTaskType } from '@/constants/models';

const customModelSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
  platform: z.literal(MLPlatform.CUSTOM),
  task_type: z.nativeEnum(MLTaskType),
  onnx_model_url: z.string().min(1, 'ONNX模型地址不能为空')
});

export type CustomModelFormValues = z.infer<typeof customModelSchema>;

interface CustomModelFormProps {
  onSubmit: (values: CustomModelFormValues) => Promise<void>;
  isLoading: boolean;
}

export function CustomModelForm({ onSubmit, isLoading }: CustomModelFormProps) {
  const form = useForm<CustomModelFormValues>({
    resolver: zodResolver(customModelSchema),
    defaultValues: {
      platform: MLPlatform.CUSTOM
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>模型名称</FormLabel>
              <FormControl>
                <Input placeholder="输入模型名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="task_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务类型</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(MLTaskType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="onnx_model_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ONNX模型地址</FormLabel>
              <FormControl>
                <Input placeholder="输入ONNX模型地址" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            创建模型
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
