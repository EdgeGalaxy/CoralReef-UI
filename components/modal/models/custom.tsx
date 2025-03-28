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
import { MLPlatform, MLTaskType, DatasetType } from '@/constants/models';
import { Textarea } from '@/components/ui/textarea';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useState } from 'react';
import { FileUpload } from '@/components/model-file-upload';

const preprocessingConfigSchema = z.object({
  auto_orient: z.object({
    enabled: z.boolean()
  }),
  resize: z.object({
    format: z.string(),
    width: z.number(),
    height: z.number(),
    enabled: z.boolean()
  }),
  additional_configs: z.record(z.string(), z.any())
});

const customModelSchema = z.object({
  description: z.string().optional(),
  platform: z.literal(MLPlatform.CUSTOM),
  dataset_url: z.string().optional(),
  dataset_type: z.nativeEnum(DatasetType),
  preprocessing_config: preprocessingConfigSchema,
  class_mapping: z.record(z.string(), z.string()),
  task_type: z.nativeEnum(MLTaskType),
  model_type: z.string().min(1, '模型类型不能为空'),
  onnx_model_url: z.string().min(1, 'ONNX模型地址不能为空'),
  rknn_model_url: z.string().optional(),
  is_public: z.boolean(),
  batch_size: z.number().int().positive(),
  workspace_id: z.string()
});

export type CustomModelFormValues = z.infer<typeof customModelSchema>;

interface CustomModelFormProps {
  onSubmit: (values: CustomModelFormValues) => Promise<void>;
  isLoading: boolean;
  workspaceId: string;
}

// 使用 Zod 的内置方法检查字段是否必填
const isFieldRequired = (
  schema: z.ZodObject<any>,
  fieldName: string
): boolean => {
  try {
    // 尝试用空值验证该字段
    const testObj = { [fieldName]: undefined };
    const result = schema.safeParse(testObj);

    // 如果验证失败且错误信息中包含该字段，说明该字段是必填的
    return (
      !result.success &&
      result.error.issues.some(
        (issue) => issue.path[0] === fieldName && issue.code === 'invalid_type'
      )
    );
  } catch {
    return false;
  }
};

// 创建一个可复用的带必填标识的 Label 组件
interface LabelWithRequiredProps {
  children: React.ReactNode;
  fieldName: keyof CustomModelFormValues;
}

const LabelWithRequired = ({ children, fieldName }: LabelWithRequiredProps) => (
  <FormLabel>
    {children}
    {isFieldRequired(customModelSchema, fieldName) && (
      <span className="ml-1 text-red-500">*</span>
    )}
  </FormLabel>
);

export function CustomModelForm({
  onSubmit,
  isLoading,
  workspaceId
}: CustomModelFormProps) {
  const { data: modelTypes } = useAuthSWR(
    `/api/reef/workspaces/${workspaceId}/models/type`
  );

  const form = useForm<CustomModelFormValues>({
    resolver: zodResolver(customModelSchema),
    defaultValues: {
      platform: MLPlatform.CUSTOM,
      preprocessing_config: {
        auto_orient: {
          enabled: true
        },
        resize: {
          format: 'stretch',
          width: 640,
          height: 640,
          enabled: true
        },
        additional_configs: {}
      },
      is_public: false,
      batch_size: 8,
      workspace_id: workspaceId,
      class_mapping: {}
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <LabelWithRequired fieldName="description">
                模型描述
              </LabelWithRequired>
              <FormControl>
                <Textarea placeholder="输入模型描述" {...field} />
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
              <LabelWithRequired fieldName="task_type">
                任务类型
              </LabelWithRequired>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(MLTaskType).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key}
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
          name="dataset_type"
          render={({ field }) => (
            <FormItem>
              <LabelWithRequired fieldName="dataset_type">
                数据集类型
              </LabelWithRequired>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择数据集类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(DatasetType).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key}
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
          name="dataset_url"
          render={({ field }) => (
            <FormItem>
              <LabelWithRequired fieldName="dataset_url">
                数据集地址
              </LabelWithRequired>
              <FormControl>
                <Input placeholder="输入数据集地址" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model_type"
          render={({ field }) => {
            const [open, setOpen] = React.useState(false);
            const [searchValue, setSearchValue] = React.useState('');

            const filteredTypes = React.useMemo(() => {
              if (!Array.isArray(modelTypes)) return [];
              if (!searchValue) return modelTypes;
              return modelTypes.filter((type) =>
                type.toLowerCase().includes(searchValue.toLowerCase())
              );
            }, [modelTypes, searchValue]);

            return (
              <FormItem>
                <LabelWithRequired fieldName="model_type">
                  模型类型
                </LabelWithRequired>
                <Popover open={open} onOpenChange={setOpen} modal>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value || '选择模型类型'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                    align="start"
                  >
                    <Command className="max-h-[300px] overflow-hidden">
                      <CommandInput
                        placeholder="搜索模型类型..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandList
                        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 max-h-[200px] overflow-auto"
                        onWheel={(e) => {
                          const element = e.currentTarget;
                          element.scrollTop += e.deltaY;
                          e.preventDefault();
                        }}
                      >
                        <CommandEmpty>未找到匹配的类型</CommandEmpty>
                        <CommandGroup>
                          {!Array.isArray(modelTypes) ? (
                            <CommandItem disabled>加载中...</CommandItem>
                          ) : filteredTypes.length === 0 ? (
                            <CommandItem disabled>暂无可用类型</CommandItem>
                          ) : (
                            filteredTypes.map((type) => (
                              <CommandItem
                                key={type}
                                value={type}
                                onSelect={(currentValue) => {
                                  form.setValue('model_type', currentValue);
                                  setOpen(false);
                                  setSearchValue('');
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === type
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {type}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="onnx_model_url"
          render={({ field }) => (
            <FormItem>
              <LabelWithRequired fieldName="onnx_model_url">
                ONNX模型
              </LabelWithRequired>
              <FormControl>
                <div className="space-y-2">
                  <FileUpload
                    onUploadComplete={(key) => {
                      field.onChange(key);
                      form.setValue('onnx_model_url', key);
                    }}
                    label="ONNX模型"
                    directory="custom_models"
                    accept=".onnx"
                    disabled={isLoading}
                  />
                  {field.value && (
                    <div className="truncate text-sm text-muted-foreground">
                      当前文件: {field.value}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rknn_model_url"
          render={({ field }) => (
            <FormItem>
              <LabelWithRequired fieldName="rknn_model_url">
                RKNN模型
              </LabelWithRequired>
              <FormControl>
                <div className="space-y-2">
                  <FileUpload
                    onUploadComplete={(url) => {
                      field.onChange(url);
                      form.setValue('rknn_model_url', url);
                    }}
                    label="RKNN模型"
                    directory="custom_models"
                    accept=".rknn"
                    disabled={isLoading}
                  />
                  {field.value && (
                    <div className="truncate text-sm text-muted-foreground">
                      当前文件: {field.value}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class_mapping"
          render={({ field }) => {
            const [inputValue, setInputValue] = useState(
              JSON.stringify(field.value, null, 2)
            );
            const [hasError, setHasError] = useState(false);

            const handleChange = (
              e: React.ChangeEvent<HTMLTextAreaElement>
            ) => {
              setInputValue(e.target.value);
              try {
                const value = JSON.parse(e.target.value);
                field.onChange(value);
                setHasError(false);
              } catch {
                setHasError(true);
              }
            };

            return (
              <FormItem>
                <LabelWithRequired fieldName="class_mapping">
                  类别映射
                </LabelWithRequired>
                <FormControl>
                  <Textarea
                    placeholder='输入类别映射 (JSON格式)，例如：{"cat": "0", "dog": "1"}'
                    value={inputValue}
                    onChange={handleChange}
                    className={cn(
                      hasError && 'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                </FormControl>
                {hasError && (
                  <p className="text-sm text-red-500">请输入有效的 JSON 格式</p>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="batch_size"
          render={({ field }) => (
            <FormItem>
              <LabelWithRequired fieldName="batch_size">
                批处理大小
              </LabelWithRequired>
              <FormControl>
                <Input
                  type="number"
                  placeholder="输入批处理大小"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem>
              <LabelWithRequired fieldName="is_public">
                是否公开
              </LabelWithRequired>
              <Select
                onValueChange={(value) => field.onChange(value === 'true')}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择是否公开" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">预处理配置</h3>

          <FormField
            control={form.control}
            name="preprocessing_config.auto_orient.enabled"
            render={({ field }) => (
              <FormItem>
                <LabelWithRequired fieldName="preprocessing_config">
                  自动方向校正
                </LabelWithRequired>
                <Select
                  onValueChange={(value) => field.onChange(value === 'true')}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择是否启用" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">启用</SelectItem>
                    <SelectItem value="false">禁用</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preprocessing_config.resize.enabled"
            render={({ field }) => (
              <FormItem>
                <LabelWithRequired fieldName="preprocessing_config">
                  启用调整大小
                </LabelWithRequired>
                <Select
                  onValueChange={(value) => field.onChange(value === 'true')}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择是否启用" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">启用</SelectItem>
                    <SelectItem value="false">禁用</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preprocessing_config.resize.format"
            render={({ field }) => (
              <FormItem>
                <LabelWithRequired fieldName="preprocessing_config">
                  调整格式
                </LabelWithRequired>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择调整格式" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="stretch">拉伸</SelectItem>
                    <SelectItem value="fit">适应</SelectItem>
                    <SelectItem value="fill">填充</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="preprocessing_config.resize.width"
              render={({ field }) => (
                <FormItem>
                  <LabelWithRequired fieldName="preprocessing_config">
                    宽度
                  </LabelWithRequired>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="输入宽度"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preprocessing_config.resize.height"
              render={({ field }) => (
                <FormItem>
                  <LabelWithRequired fieldName="preprocessing_config">
                    高度
                  </LabelWithRequired>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="输入高度"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            建模型
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
