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
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { MLPlatform } from '@/constants/models';
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
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import * as React from 'react';

const roboflowModelSchema = z.object({
  model_id: z.string().min(1, '模型ID不能为空'),
  platform: z.literal(MLPlatform.PUBLIC)
});

export type RoboflowModelFormValues = z.infer<typeof roboflowModelSchema>;

interface RoboflowModelFormProps {
  onSubmit: (values: RoboflowModelFormValues) => Promise<void>;
  workspaceId: string;
  isLoading: boolean;
}

export function RoboflowModelForm({
  onSubmit,
  workspaceId,
  isLoading
}: RoboflowModelFormProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const form = useForm<RoboflowModelFormValues>({
    resolver: zodResolver(roboflowModelSchema),
    defaultValues: {
      platform: MLPlatform.PUBLIC
    }
  });

  const {
    data: roboflowModels,
    error: modelError,
    isLoading: isLoadingModels
  } = useAuthSWR<string[]>(
    `/api/reef/workspaces/${workspaceId}/models/public/models`
  );

  const safeRoboflowModels = Array.isArray(roboflowModels)
    ? roboflowModels
    : [];

  // 过滤搜索结果
  const filteredModels = React.useMemo(() => {
    if (!searchValue) return safeRoboflowModels;
    return safeRoboflowModels.filter((model) =>
      model.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [safeRoboflowModels, searchValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="model_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公开模型</FormLabel>
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
                      {field.value || '选择公开模型'}
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
                      placeholder="搜索模型..."
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
                      <CommandEmpty>未找到匹配的模型</CommandEmpty>
                      <CommandGroup>
                        {isLoadingModels ? (
                          <CommandItem disabled>加载中...</CommandItem>
                        ) : modelError ? (
                          <CommandItem disabled>加载失败</CommandItem>
                        ) : filteredModels.length === 0 ? (
                          <CommandItem disabled>暂无可用模型</CommandItem>
                        ) : (
                          filteredModels.map((model) => (
                            <CommandItem
                              key={model}
                              value={model}
                              onSelect={(currentValue) => {
                                form.setValue('model_id', currentValue);
                                setOpen(false);
                                setSearchValue('');
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === model
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {model}
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
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            导入模型
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
