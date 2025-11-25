'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export interface Recipient {
  email: string;
  name?: string;
  customMessage?: string;
  amount: number;
}

interface RecipientFormProps {
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
  defaultAmount?: number;
  currency?: string;
}

export function RecipientForm({
  recipients,
  onChange,
  defaultAmount = 0,
  currency: _currency = 'USD',
}: RecipientFormProps) {
  const addRecipient = () => {
    onChange([
      ...recipients,
      {
        email: '',
        name: '',
        customMessage: '',
        amount: defaultAmount,
      },
    ]);
  };

  const removeRecipient = (index: number) => {
    onChange(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string | number) => {
    const updated = [...recipients];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-plum-200">
          Recipients ({recipients.length})
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRecipient}
        >
          + Add Recipient
        </Button>
      </div>

      {recipients.map((recipient, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-plum-300">
                Recipient {index + 1}
              </h4>
              {recipients.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecipient(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email *"
                type="email"
                value={recipient.email}
                onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                placeholder="recipient@example.com"
                required
              />
              <Input
                label="Name"
                type="text"
                value={recipient.name || ''}
                onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                placeholder="John Doe"
              />
              <Input
                label="Amount *"
                type="number"
                step="0.01"
                min="0.01"
                value={recipient.amount || ''}
                onChange={(e) => updateRecipient(index, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
              <Input
                label="Custom Message"
                type="text"
                value={recipient.customMessage || ''}
                onChange={(e) => updateRecipient(index, 'customMessage', e.target.value)}
                placeholder="Happy Birthday!"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {recipients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-plum-300 mb-4">No recipients added yet</p>
            <Button type="button" variant="outline" onClick={addRecipient}>
              Add First Recipient
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

