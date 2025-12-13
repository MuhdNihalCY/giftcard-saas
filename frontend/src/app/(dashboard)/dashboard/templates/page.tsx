'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  description?: string;
  design: any;
  isDefault: boolean;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/gift-cards/templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.delete(`/gift-cards/templates/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Gift Card Templates</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your gift card templates</p>
        </div>
        <Link href="/dashboard/templates/create">
          <Button>Create Template</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 mb-4">No templates found.</p>
              <Link href="/dashboard/templates/create">
                <Button>Create Your First Template</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    {template.isDefault && (
                      <span className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Default</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{template.description}</p>
                )}
                <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                  <span>Created {formatDate(template.createdAt)}</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

