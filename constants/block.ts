import { RJSFSchema } from '@rjsf/utils';

// OutputDefinition
export type OutputDefinition = {
  name: string;
  type: string;
  description?: string;
};

// BlockDescription
export type BlockDescription = {
  block_schema: RJSFSchema;
  outputs_manifest: OutputDefinition[];
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
