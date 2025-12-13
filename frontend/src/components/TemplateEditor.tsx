'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { TemplatePreview } from './TemplatePreview';
import type { TemplateDesignData } from '@/lib/template-design';
import { COLOR_SCHEMES, applyColorScheme } from '@/lib/color-schemes';

interface TemplateEditorProps {
  designData: TemplateDesignData;
  onChange: (designData: TemplateDesignData) => void;
}

export function TemplateEditor({ designData, onChange }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<'schemes' | 'colors' | 'typography' | 'images' | 'layout' | 'effects'>('schemes');

  const updateDesign = (updates: Partial<TemplateDesignData>) => {
    onChange({
      ...designData,
      ...updates,
    });
  };

  const updateColors = (colorUpdates: Partial<NonNullable<TemplateDesignData['colors']>>) => {
    updateDesign({
      colors: {
        ...designData.colors,
        ...colorUpdates,
      },
    });
  };

  const updateTypography = (typographyUpdates: Partial<NonNullable<TemplateDesignData['typography']>>) => {
    updateDesign({
      typography: {
        ...designData.typography,
        ...typographyUpdates,
      },
    });
  };

  const updateImages = (imageUpdates: Partial<NonNullable<TemplateDesignData['images']>>) => {
    updateDesign({
      images: {
        ...designData.images,
        ...imageUpdates,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Design Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-navy-700 pb-2">
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-4 py-2 font-semibold text-sm ${
                activeTab === 'schemes'
                  ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              Color Schemes
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-4 py-2 font-semibold text-sm ${
                activeTab === 'colors'
                  ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              Custom Colors
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`px-4 py-2 font-semibold text-sm ${
                activeTab === 'typography'
                  ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              Typography
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 font-semibold text-sm ${
                activeTab === 'images'
                  ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-4 py-2 font-semibold text-sm ${
                activeTab === 'layout'
                  ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              Layout
            </button>
            <button
              onClick={() => setActiveTab('effects')}
              className={`px-4 py-2 font-semibold text-sm ${
                activeTab === 'effects'
                  ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              Effects
            </button>
          </div>

          {/* Color Schemes Tab */}
          {activeTab === 'schemes' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Choose a professional color scheme or customize your own colors
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.name}
                    onClick={() => onChange(applyColorScheme(scheme, designData))}
                    className="group relative p-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all text-left"
                  >
                    <div
                      className="w-full h-16 rounded mb-2"
                      style={{ background: scheme.preview }}
                    />
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{scheme.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{scheme.description}</p>
                    <div className="flex gap-1 mt-2">
                      {Object.values(scheme.colors).slice(0, 5).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designData.colors?.primary || '#667eea'}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="w-16 h-10 rounded border border-slate-300 dark:border-slate-700"
                  />
                  <Input
                    value={designData.colors?.primary || '#667eea'}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designData.colors?.secondary || '#764ba2'}
                    onChange={(e) => updateColors({ secondary: e.target.value })}
                    className="w-16 h-10 rounded border border-slate-300 dark:border-slate-700"
                  />
                  <Input
                    value={designData.colors?.secondary || '#764ba2'}
                    onChange={(e) => updateColors({ secondary: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designData.colors?.background || '#ffffff'}
                    onChange={(e) => updateColors({ background: e.target.value })}
                    className="w-16 h-10 rounded border border-navy-600"
                  />
                  <Input
                    value={designData.colors?.background || '#ffffff'}
                    onChange={(e) => updateColors({ background: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designData.colors?.text || '#000000'}
                    onChange={(e) => updateColors({ text: e.target.value })}
                    className="w-16 h-10 rounded border border-slate-300 dark:border-slate-700"
                  />
                  <Input
                    value={designData.colors?.text || '#000000'}
                    onChange={(e) => updateColors({ text: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designData.colors?.accent || '#667eea'}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="w-16 h-10 rounded border border-slate-300 dark:border-slate-700"
                  />
                  <Input
                    value={designData.colors?.accent || '#667eea'}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Font Family
                </label>
                <select
                  value={designData.typography?.fontFamily || 'Inter, sans-serif'}
                  onChange={(e) => updateTypography({ fontFamily: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <optgroup label="Modern Sans-Serif">
                    <option value="Inter, -apple-system, BlinkMacSystemFont, sans-serif">Inter (Recommended)</option>
                    <option value="Poppins, sans-serif">Poppins</option>
                    <option value="Montserrat, sans-serif">Montserrat</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Open Sans, sans-serif">Open Sans</option>
                  </optgroup>
                  <optgroup label="Classic Sans-Serif">
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Helvetica, sans-serif">Helvetica</option>
                  </optgroup>
                  <optgroup label="Serif">
                    <option value="Playfair Display, serif">Playfair Display</option>
                    <option value="Merriweather, serif">Merriweather</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                  </optgroup>
                  <optgroup label="Monospace">
                    <option value="Courier New, monospace">Courier New</option>
                    <option value="'Fira Code', monospace">Fira Code</option>
                  </optgroup>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Selected: <span style={{ fontFamily: designData.typography?.fontFamily || 'Inter' }}>
                    {designData.typography?.fontFamily?.split(',')[0] || 'Inter'}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Heading Size: {designData.typography?.headingSize || '24px'}
                </label>
                <input
                  type="range"
                  min="18"
                  max="48"
                  value={parseInt(designData.typography?.headingSize || '24px') || 24}
                  onChange={(e) => updateTypography({ headingSize: `${e.target.value}px` })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Small (18px)</span>
                  <span>Large (48px)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Body Size: {designData.typography?.bodySize || '16px'}
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={parseInt(designData.typography?.bodySize || '16px') || 16}
                  onChange={(e) => updateTypography({ bodySize: `${e.target.value}px` })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-plum-400 mt-1">
                  <span>Small (12px)</span>
                  <span>Large (24px)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Font Weight
                </label>
                <select
                  value={designData.typography?.fontWeight || '600'}
                  onChange={(e) => updateTypography({ fontWeight: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi Bold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Logo URL
                </label>
                <Input
                  type="url"
                  value={designData.images?.logo || ''}
                  onChange={(e) => updateImages({ logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {designData.images?.logo && (
                  <img
                    src={designData.images.logo}
                    alt="Logo preview"
                    className="mt-2 w-32 h-32 object-contain rounded border border-slate-300 dark:border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Background Image URL
                </label>
                <Input
                  type="url"
                  value={designData.images?.background || ''}
                  onChange={(e) => updateImages({ background: e.target.value })}
                  placeholder="https://example.com/background.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pattern URL
                </label>
                <Input
                  type="url"
                  value={designData.images?.pattern || ''}
                  onChange={(e) => updateImages({ pattern: e.target.value })}
                  placeholder="https://example.com/pattern.png"
                />
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <p className="text-sm text-plum-200 mb-4">
                Choose a layout style that matches your brand
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'classic', label: 'Classic', desc: 'Traditional elegance' },
                  { value: 'modern', label: 'Modern', desc: 'Bold and contemporary' },
                  { value: 'minimal', label: 'Minimal', desc: 'Ultra-clean design' },
                  { value: 'premium', label: 'Premium', desc: 'Luxury feel' },
                  { value: 'bold', label: 'Bold', desc: 'High contrast' },
                  { value: 'elegant', label: 'Elegant', desc: 'Refined spacing' },
                ].map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => updateDesign({ layout: layout.value as any })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      designData.layout === layout.value
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400'
                    }`}
                  >
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{layout.label}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{layout.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Border Radius
                </label>
                <Input
                  type="text"
                  value={designData.borderRadius || '8px'}
                  onChange={(e) => updateDesign({ borderRadius: e.target.value })}
                  placeholder="8px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Padding
                </label>
                <Input
                  type="text"
                  value={designData.spacing?.padding || '20px'}
                  onChange={(e) =>
                    updateDesign({
                      spacing: {
                        ...designData.spacing,
                        padding: e.target.value,
                      },
                    })
                  }
                  placeholder="20px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Margin
                </label>
                <Input
                  type="text"
                  value={designData.spacing?.margin || '10px'}
                  onChange={(e) =>
                    updateDesign({
                      spacing: {
                        ...designData.spacing,
                        margin: e.target.value,
                      },
                    })
                  }
                  placeholder="10px"
                />
              </div>

            </div>
          )}

          {/* Effects Tab */}
          {activeTab === 'effects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-plum-300">
                  Enable Shadows
                </label>
                <input
                  type="checkbox"
                  id="shadows"
                  checked={designData.shadows !== false}
                  onChange={(e) => updateDesign({ shadows: e.target.checked })}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Border Radius: {designData.borderRadius || '8px'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={parseInt(designData.borderRadius || '8px') || 8}
                  onChange={(e) => updateDesign({ borderRadius: `${e.target.value}px` })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-plum-400 mt-1">
                  <span>Sharp (0px)</span>
                  <span>Rounded (32px)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Padding: {designData.spacing?.padding || '20px'}
                </label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={parseInt(designData.spacing?.padding || '20px') || 20}
                  onChange={(e) =>
                    updateDesign({
                      spacing: {
                        ...designData.spacing,
                        padding: `${e.target.value}px`,
                      },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-plum-400 mt-1">
                  <span>Tight (8px)</span>
                  <span>Spacious (64px)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <div>
        <TemplatePreview designData={designData} />
      </div>
    </div>
  );
}

