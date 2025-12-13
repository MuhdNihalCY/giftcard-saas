'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { TemplatePreview } from './TemplatePreview';
import api from '@/lib/api';
import logger from '@/lib/logger';

interface Template {
  id: string;
  name: string;
  description?: string;
  designData: any;
  isPublic?: boolean;
  createdAt: string;
}

interface TemplateSelectorProps {
  value?: string;
  onChange: (templateId: string | undefined) => void;
  label?: string;
  showPreview?: boolean;
  error?: string;
}

export function TemplateSelector({
  value,
  onChange,
  label = 'Template',
  showPreview = true,
  error,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (value && templates.length > 0) {
      const template = templates.find(t => t.id === value);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [value, templates]);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/gift-cards/templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch templates', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (templateId: string) => {
    onChange(templateId);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  if (isLoading) {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-plum-200 mb-2">{label}</label>}
        <div className="flex items-center justify-center h-32 border border-navy-700 rounded-lg bg-navy-800/30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-plum-200 mb-2">
          {label} <span className="text-plum-400 text-xs">(Optional)</span>
        </label>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {templates.length === 0 ? (
        <div className="border border-navy-700 rounded-lg bg-navy-800/30 p-6 text-center">
          <p className="text-plum-300 mb-2">No templates available</p>
          <p className="text-sm text-plum-400 mb-4">Create a template to customize your gift card design</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/dashboard/templates/create', '_blank')}
          >
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Template List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-plum-300 font-medium">Select a template</span>
              {value && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <button
                type="button"
                onClick={handleClear}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  !value
                    ? 'border-gold-400 bg-gold-400/10'
                    : 'border-navy-600 hover:border-navy-500 bg-navy-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-plum-300">Default Template</p>
                    <p className="text-xs text-plum-400 mt-1">System default design</p>
                  </div>
                  {!value && (
                    <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                  )}
                </div>
              </button>
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    value === template.id
                      ? 'border-gold-400 bg-gold-400/10'
                      : 'border-navy-600 hover:border-navy-500 bg-navy-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-plum-300">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-plum-400 mt-1">{template.description}</p>
                      )}
                    </div>
                    {value === template.id && (
                      <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div>
              {selectedTemplate ? (
                <TemplatePreview designData={selectedTemplate.designData} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-plum-400">
                      <p>Select a template to see preview</p>
                      <p className="text-sm mt-2">Or use the default template</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

