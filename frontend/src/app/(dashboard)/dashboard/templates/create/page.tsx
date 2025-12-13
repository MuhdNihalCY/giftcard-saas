'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TemplateEditor } from '@/components/TemplateEditor';
import api from '@/lib/api';
import type { TemplateDesignData } from '@/lib/template-design';
import { TEMPLATE_PRESETS } from '@/lib/template-presets';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const defaultDesignData: TemplateDesignData = {
  colors: {
    primary: '#1a365d',      // Deep navy - professional and modern
    secondary: '#2d3748',    // Charcoal - sophisticated
    background: '#ffffff',   // Pure white - clean
    text: '#1a202c',         // Dark gray - excellent readability
    accent: '#d69e2e',       // Gold accent - premium feel
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    headingSize: '32px',
    bodySize: '16px',
    fontWeight: '700',
  },
  layout: 'modern',
  spacing: {
    padding: '32px',
    margin: '16px',
  },
  borderRadius: '16px',
  shadows: true,
};

export default function CreateTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [designData, setDesignData] = useState<TemplateDesignData>(defaultDesignData);
  const [showPresets, setShowPresets] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      isPublic: false,
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const payload = {
        ...data,
        designData,
      };

      await api.post('/gift-cards/templates', payload);
      router.push('/dashboard/templates');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Template</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Create a new gift card template with custom design</p>
      </div>

      {/* Template Presets */}
      {showPresets && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Start from Template</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresets(false)}
              >
                Skip
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Choose a preset template to get started quickly, or start from scratch
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEMPLATE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setDesignData(preset.designData);
                    setShowPresets(false);
                  }}
                  className="group p-4 rounded-lg border-2 border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all text-left"
                >
                  <div
                    className="w-full h-20 rounded mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${preset.designData.colors?.primary} 0%, ${preset.designData.colors?.secondary} 100%)`,
                    }}
                  />
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">{preset.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{preset.category}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{preset.preview}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={() => setShowPresets(false)}
                className="w-full"
              >
                Start from Scratch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Input
              label="Template Name"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-plum-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-navy-600 rounded-lg text-navy-50 bg-navy-800"
                rows={4}
                {...register('description')}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('isPublic')}
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-plum-300">
                Make template public (visible to all merchants)
              </label>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Visual Editor */}
      <TemplateEditor designData={designData} onChange={setDesignData} />

      {/* Submit Button */}
      <div className="mt-6 flex space-x-4">
        <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
          Create Template
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

