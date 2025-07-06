'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutGrid, RefreshCw, Video, X, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { GatewayStatus } from '@/constants/deploy';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { DeploymentCreate } from '@/constants/deploy';
import { handleApiRequest } from '@/lib/error-handle';
import { GatewayStepSelectedItem } from './steps/gateway-step';
import { CameraStepSelectedItem } from './steps/camera-step';
import { WorkflowStepSelectedItem } from './steps/workflow-step';
import { EditableField } from '@/components/sidebar/components/editable-field';

enum DeploymentStep {
  GATEWAY = 1,
  CAMERA = 2,
  WORKFLOW = 3
}

export function CreateDeploymentModal({
  workspaceId,
  onSuccess
}: {
  workspaceId: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const api = useAuthApi();
  const [currentStep, setCurrentStep] = useState<DeploymentStep>(
    DeploymentStep.GATEWAY
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentCreate>({
    name: 'default',
    description: 'default',
    gateway: undefined,
    workflow: undefined,
    cameras: [],
    parameters: {}
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<
    Record<number, Record<string, string>>
  >({});
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      number: DeploymentStep.GATEWAY,
      title: '网关',
      icon: <LayoutGrid className="h-4 w-4" />,
      endpoint: `/api/reef/workspaces/${workspaceId}/gateways`,
      maxSelections: 1,
      filterFields: [
        {
          key: 'status',
          label: '状态',
          defaultValue: GatewayStatus.ONLINE,
          options: Object.values(GatewayStatus).map((status) =>
            status.toString()
          )
        }
      ],
      renderSelectedItem: GatewayStepSelectedItem
    },
    {
      number: DeploymentStep.CAMERA,
      title: '视频源',
      icon: <Video className="h-4 w-4" />,
      endpoint: `/api/reef/workspaces/${workspaceId}/cameras`,
      maxSelections: 4,
      renderSelectedItem: CameraStepSelectedItem
    },
    {
      number: DeploymentStep.WORKFLOW,
      title: '工作流',
      icon: <LayoutGrid className="h-4 w-4" />,
      endpoint: `/api/reef/workspaces/${workspaceId}/workflows`,
      maxSelections: 1,
      renderSelectedItem: WorkflowStepSelectedItem
    }
  ];

  const { data: stepData, mutate: refreshStepData } = useAuthSWR<any[]>(
    steps[currentStep - 1]?.endpoint || ''
  );

  // Initialize default filters
  useEffect(() => {
    const defaultFilters: Record<number, Record<string, string>> = {};
    steps.forEach((step) => {
      if (step.filterFields) {
        defaultFilters[step.number] = {};
        step.filterFields.forEach((field) => {
          if (field.defaultValue) {
            defaultFilters[step.number][field.key] = field.defaultValue;
          }
        });
      }
    });
    setFilters(defaultFilters);
  }, [deploymentConfig.gateway]);

  useEffect(() => {
    if (!stepData) {
      setSearchResults([]);
      return;
    }

    let filtered = stepData.filter((item) => {
      if (currentStep === DeploymentStep.GATEWAY)
        return item.id !== deploymentConfig.gateway?.id;
      if (currentStep === DeploymentStep.CAMERA)
        return !deploymentConfig.cameras?.some((c) => c.id === item.id);
      if (currentStep === DeploymentStep.WORKFLOW)
        return item.id !== deploymentConfig.workflow?.id;
      return true;
    });

    // Apply custom filters
    const currentFilters = filters[currentStep];
    if (currentFilters) {
      filtered = filtered.filter((item) => {
        return Object.entries(currentFilters).every(([key, value]) => {
          return !value || item[key] === value;
        });
      });
    }
    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setSearchResults(filtered);
  }, [stepData, searchQuery, currentStep, deploymentConfig, filters]);

  const handleSearch = useCallback(async () => {
    setIsRefreshing(true);
    await refreshStepData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [refreshStepData]);

  const handleSelect = (item: any) => {
    switch (currentStep) {
      case DeploymentStep.GATEWAY:
        if (deploymentConfig.gateway) {
          toast({
            variant: 'destructive',
            title: '网关已选择, 最多选择 1 个'
          });
          return;
        }
        setDeploymentConfig((prev) => ({ ...prev, gateway: item }));
        break;
      case DeploymentStep.CAMERA:
        if (
          deploymentConfig.cameras?.length >=
          steps[DeploymentStep.CAMERA - 1].maxSelections
        ) {
          toast({
            variant: 'destructive',
            title: `最多选择 ${
              steps[DeploymentStep.CAMERA - 1].maxSelections
            } 个视频源`
          });
          return;
        }
        setDeploymentConfig((prev) => ({
          ...prev,
          cameras: prev.cameras ? [...prev.cameras, item] : [item]
        }));
        break;
      case DeploymentStep.WORKFLOW:
        if (deploymentConfig.workflow) {
          toast({
            variant: 'destructive',
            title: '工作流已选择, 最多选择 1 个'
          });
          return;
        }
        setDeploymentConfig((prev) => ({ ...prev, workflow: item }));
        break;
    }
  };

  const resetDeploymentConfig = () => {
    setDeploymentConfig({
      name: '',
      description: '',
      gateway: undefined,
      workflow: undefined,
      cameras: [],
      parameters: {}
    });
    setCurrentStep(DeploymentStep.GATEWAY);
  };

  const handleSubmit = async () => {
    if (!deploymentConfig.name?.trim()) {
      toast({
        variant: 'destructive',
        title: '请输入部署名称'
      });
      return;
    }

    setIsLoading(true);
    try {
      await handleApiRequest(
        () =>
          api.post(`api/reef/workspaces/${workspaceId}/deployments`, {
            json: {
              name: deploymentConfig.name,
              description: deploymentConfig.description,
              gateway_id: deploymentConfig.gateway?.id,
              workflow_id: deploymentConfig.workflow?.id,
              camera_ids: deploymentConfig.cameras?.map((c) => c.id),
              parameters: deploymentConfig.parameters
            }
          }),
        {
          toast: toast,
          successTitle: '部署创建成功',
          errorTitle: '部署创建失败',
          onSuccess: () => {
            onSuccess();
            setOpen(false);
            resetDeploymentConfig();
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (
    type: 'gateway' | 'workflow' | 'camera',
    itemId?: string
  ) => {
    setIsLoading(true);
    try {
      if (type === 'gateway') {
        setDeploymentConfig((prev) => ({ ...prev, gateway: undefined }));
      } else if (type === 'workflow') {
        setDeploymentConfig((prev) => ({ ...prev, workflow: undefined }));
      } else if (type === 'camera' && itemId) {
        setDeploymentConfig((prev) => ({
          ...prev,
          cameras: prev.cameras?.filter((c) => c.id !== itemId)
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectedItem = () => {
    if (currentStep === DeploymentStep.GATEWAY && deploymentConfig.gateway) {
      return (
        <GatewayStepSelectedItem
          selectedItem={deploymentConfig.gateway}
          handleRemoveItem={() => handleRemoveItem('gateway')}
        />
      );
    }

    if (
      currentStep === DeploymentStep.CAMERA &&
      deploymentConfig.cameras?.length > 0
    ) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {deploymentConfig.cameras.map((camera) => (
            <CameraStepSelectedItem
              key={camera.id}
              selectedItem={camera}
              handleRemoveItem={() => handleRemoveItem('camera', camera.id)}
            />
          ))}
        </div>
      );
    }

    if (currentStep === DeploymentStep.WORKFLOW && deploymentConfig.workflow) {
      return (
        <WorkflowStepSelectedItem
          selectedItem={deploymentConfig.workflow}
          handleRemoveItem={() => handleRemoveItem('workflow')}
          onParameterChange={(name, value) => {
            setDeploymentConfig((prev) => ({
              ...prev,
              parameters: {
                ...prev.parameters,
                [name]: value
              }
            }));
          }}
        />
      );
    }

    return null;
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        [field]: value
      }
    }));
  };

  const clearFilter = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        [field]: ''
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>创建部署</Button>
      </DialogTrigger>
      <DialogContent
        className="flex h-full w-full flex-col sm:max-h-[80vh] sm:max-w-[70vw]"
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
          <DialogTitle className="text-lg font-bold">创建服务</DialogTitle>
          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <EditableField
                value={deploymentConfig.name}
                label="部署名称"
                onUpdate={async (newValue) => {
                  if (!newValue?.trim()) {
                    toast({
                      variant: 'destructive',
                      title: '部署名称不能为空'
                    });
                    return;
                  }
                  setDeploymentConfig((prev) => ({ ...prev, name: newValue }));
                }}
              />
            </div>
            <div className="flex-[2]">
              <EditableField
                value={deploymentConfig.description}
                label="部署描述"
                onUpdate={async (newValue) => {
                  setDeploymentConfig((prev) => ({
                    ...prev,
                    description: newValue
                  }));
                }}
              />
            </div>
          </div>
        </DialogHeader>

        {/* Main content wrapper - Add relative positioning and padding-bottom */}
        <div className="relative flex-1 overflow-y-auto pb-16">
          {/* Stepper */}
          <div className="mb-8 flex items-center">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex items-center"
                onClick={() => {
                  // Only allow going back or to completed steps
                  if (
                    step.number < currentStep ||
                    (step.number === currentStep + 1 &&
                      ((currentStep === DeploymentStep.GATEWAY &&
                        deploymentConfig.gateway) ||
                        (currentStep === DeploymentStep.CAMERA &&
                          deploymentConfig.cameras?.length > 0) ||
                        (currentStep === DeploymentStep.WORKFLOW &&
                          deploymentConfig.workflow)))
                  ) {
                    setCurrentStep(step.number);
                  }
                }}
                style={{
                  cursor: step.number <= currentStep ? 'pointer' : 'default'
                }}
              >
                <div
                  className={`flex items-center ${
                    currentStep >= step.number
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.number
                        ? 'bg-primary/20'
                        : 'bg-muted'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="ml-2 flex items-center">
                    {step.icon}
                    <span className="ml-2">{step.title}</span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-[2px] w-24 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={`Search ${steps[currentStep - 1].title}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsFocused(false), 200);
                  }}
                  className="pl-10"
                  autoFocus={false}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {isFocused && searchResults && (
                  <div className="absolute z-10 mt-1 max-h-[200px] w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="cursor-pointer p-2 hover:bg-accent"
                        onClick={() => {
                          handleSelect(item);
                          setSearchQuery('');
                          setIsFocused(false);
                        }}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {steps[currentStep - 1].filterFields && (
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                      {Object.keys(filters[currentStep] || {}).length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {Object.keys(filters[currentStep] || {}).length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" sideOffset={5} align="end">
                    <div className="space-y-4">
                      {steps[currentStep - 1].filterFields?.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              {field.label}
                            </label>
                            {filters[currentStep]?.[field.key] && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => clearFilter(field.key)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {field.options ? (
                            <Select
                              value={filters[currentStep]?.[field.key] || ''}
                              onValueChange={(value) =>
                                handleFilterChange(field.key, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={`All ${field.label}`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={filters[currentStep]?.[field.key] || ''}
                              onChange={(e) =>
                                handleFilterChange(field.key, e.target.value)
                              }
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSearch}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            {/* Selected Item Display */}
            {renderSelectedItem()}
          </div>
        </div>

        {/* Footer - Add fixed positioning */}
        <div className="absolute bottom-0 left-0 right-0 mt-auto flex justify-between border-t bg-background p-4 pt-4">
          {currentStep > DeploymentStep.GATEWAY ? (
            <Button
              variant="outline"
              onClick={() =>
                setCurrentStep((prev) => (prev - 1) as DeploymentStep)
              }
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={() =>
              currentStep === DeploymentStep.WORKFLOW
                ? handleSubmit()
                : setCurrentStep(
                    (prev) =>
                      Math.min(
                        prev + 1,
                        DeploymentStep.WORKFLOW
                      ) as DeploymentStep
                  )
            }
            disabled={
              (currentStep === DeploymentStep.GATEWAY &&
                !deploymentConfig.gateway) ||
              (currentStep === DeploymentStep.CAMERA &&
                (!deploymentConfig.cameras ||
                  deploymentConfig.cameras.length === 0)) ||
              (currentStep === DeploymentStep.WORKFLOW &&
                !deploymentConfig.workflow)
            }
          >
            {currentStep === DeploymentStep.WORKFLOW ? '部署' : '下一步'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
