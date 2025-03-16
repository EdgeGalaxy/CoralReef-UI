export enum MLPlatform {
  PUBLIC = 'public',
  CUSTOM = 'custom'
}

export enum MLTaskType {
  OBJECT_DETECTION = 'object-detection',
  CLASSIFICATION = 'classification',
  SEGMENTATION = 'segmentation',
  KEYPOINT = 'keypoint'
}

export enum DatasetType {
  COCO = 'coco',
  YOLO = 'yolo'
}

export interface PreprocessingConfig {
  auto_orient: {
    enabled: boolean;
  };
  resize: {
    format: string;
    width: number;
    height: number;
    enabled: boolean;
  };
  additional_configs: Record<string, any>;
}

export interface MLModelBase {
  name: string;
  description?: string;
  platform: MLPlatform;
  dataset_url?: string;
  dataset_type?: DatasetType;
  preprocessing_config: PreprocessingConfig;
  class_mapping: Record<string, string>;
  class_colors?: Record<string, string>;
  task_type: MLTaskType;
  model_type: string;
  onnx_model_url: string;
  rknn_model_url?: string;
  version: string;
  is_public: boolean;
}

export interface MLModelCreate extends MLModelBase {
  batch_size: number;
  workspace_id: string;
}

export interface MLModelUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface MLModel extends MLModelBase {
  id: string;
  workspace_id?: string;
  workspace_name?: string;
  created_at: string;
  updated_at: string;
}
