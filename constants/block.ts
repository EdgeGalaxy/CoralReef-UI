import { RJSFSchema } from '@rjsf/utils';

export type Kind = {
  name: string;
  description?: string;
  docs?: string;
};

// OutputDefinition
export type OutputDefinition = {
  name: string;
  kind: Kind[];
};

// BlockDescription
export type BlockDescription = {
  block_schema: RJSFSchema;
  outputs_manifest: OutputDefinition[] | [];
  block_source: string;
  fully_qualified_block_class_name: string;
  human_friendly_block_name: string;
  manifest_type_identifier: string;
  manifest_type_identifier_aliases: string[];
  execution_engine_compatibility?: string;
  input_dimensionality_offsets: Record<string, number>;
  dimensionality_reference_property?: string;
  output_dimensionality_offset: number;
};

// 定义单个属性的类型
export type PropertyDefinition = {
  manifest_type_identifier: string;
  property_name: string;
  property_description: string;
  compatible_element: string;
  is_list_element: boolean;
  is_dict_element: boolean;
};

// 定义 Batch 类型
export type KindsConnections = {
  [key: string]: PropertyDefinition[];
};

// 定义节点数据类型
export type NodeData = BlockDescription & {
  label: string;
  formData: Record<string, any>;
};

export const skipFormFields = ['type'];
