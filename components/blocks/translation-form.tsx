'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { TranslationItem } from './translation-item';

interface PropertyItem {
  name: string;
  title: string;
  description: string;
  cn_title?: string;
  cn_description?: string;
}

interface TranslationFormProps {
  properties: Record<string, any>;
  onChange: (updatedProperties: Record<string, any>) => void;
}

export function TranslationForm({
  properties,
  onChange
}: TranslationFormProps) {
  const propertyItems = Object.entries(properties).map(([name, prop]) => ({
    name,
    title: prop.title || '',
    description: prop.description || '',
    cn_title: prop.cn_title || '',
    cn_description: prop.cn_description || ''
  }));

  const handleItemChange = (
    name: string,
    cnTitle: string,
    cnDescription: string
  ) => {
    const updatedProperties = { ...properties };
    updatedProperties[name] = {
      ...updatedProperties[name],
      cn_title: cnTitle,
      cn_description: cnDescription
    };
    onChange(updatedProperties);
  };

  return (
    <ScrollArea className="flex-1 px-6">
      <div className="space-y-6">
        {propertyItems.map((item) => (
          <TranslationItem
            key={item.name}
            name={item.name}
            originalTitle={item.title}
            originalDescription={item.description}
            cnTitle={item.cn_title}
            cnDescription={item.cn_description}
            onChange={handleItemChange}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
