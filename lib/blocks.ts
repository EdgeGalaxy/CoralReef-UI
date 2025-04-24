import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from './error-handle';
import { toast } from '@/components/ui/use-toast';

export type Language = 'ZH' | 'EN';

export interface BlockTranslation {
  id: string;
  language: Language;
  human_friendly_block_name: string;
  block_schema: Record<string, any>;
  manifest_type_identifier: string;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockTranslationUpdate {
  language?: Language;
  human_friendly_block_name?: string;
  block_schema?: Record<string, any>;
  manifest_type_identifier?: string;
  disabled?: boolean;
}

export interface BlockTranslationSync {
  source_url: string;
  language: Language;
}
