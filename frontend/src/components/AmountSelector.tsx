'use client';

import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

interface AmountSelectorProps {
  value: number; // Gift card value
  onChange: (value: number) => void;
  minAmount?: number | null; // Gift card value
  maxAmount?: number | null; // Gift card value
  minSalePrice?: number | null; // Sale price
  maxSalePrice?: number | null; // Sale price
  fixedAmounts?: number[] | null; // Gift card values
  fixedSalePrices?: number[] | null; // Sale prices
  allowCustomAmount: boolean;
  currency: string;
  error?: string;
  showSalePrice?: boolean; // Whether to show sale price info
}

export function AmountSelector({
  value,
  onChange,
  minAmount,
  maxAmount,
  minSalePrice,
  maxSalePrice,
  fixedAmounts,
  fixedSalePrices,
  allowCustomAmount,
  currency,
  error,
  showSalePrice = true,
}: AmountSelectorProps) {
  // Calculate sale price for a given gift card value
  const calculateSalePrice = (giftCardValue: number): number => {
    if (!fixedAmounts || fixedAmounts.length === 0) {
      // Custom amount - use linear interpolation
      if (minSalePrice && maxSalePrice && minAmount && maxAmount && maxAmount > minAmount) {
        const ratio = (giftCardValue - minAmount) / (maxAmount - minAmount);
        return minSalePrice + (maxSalePrice - minSalePrice) * ratio;
      }
      return giftCardValue; // No discount
    } else {
      // Fixed amount - find corresponding sale price
      const index = fixedAmounts.indexOf(giftCardValue);
      if (index !== -1 && fixedSalePrices && fixedSalePrices.length > index) {
        return fixedSalePrices[index];
      }
      return giftCardValue; // No discount
    }
  };

  const currentSalePrice = value > 0 ? calculateSalePrice(value) : 0;
  const hasDiscount = currentSalePrice < value;

  const handleFixedAmountClick = (amount: number) => {
    onChange(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      {fixedAmounts && fixedAmounts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-plum-200 mb-3">
            Select Gift Card Value
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fixedAmounts.map((amount, index) => {
              const salePrice = fixedSalePrices && fixedSalePrices.length > index 
                ? fixedSalePrices[index] 
                : amount;
              const hasDiscount = salePrice < amount;
              
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleFixedAmountClick(amount)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                    value === amount
                      ? 'border-gold-500 bg-gold-500/20 text-gold-300'
                      : 'border-navy-600 bg-navy-800/50 text-navy-50 hover:border-plum-500'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{formatCurrency(salePrice, currency)}</div>
                    {hasDiscount && showSalePrice && (
                      <div className="text-xs text-green-400 mt-1">
                        Get {formatCurrency(amount, currency)}
                      </div>
                    )}
                    {!hasDiscount && showSalePrice && (
                      <div className="text-xs text-plum-300 mt-1">
                        {formatCurrency(amount, currency)} value
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {allowCustomAmount && (
        <div>
          <Input
            label="Gift Card Value"
            type="number"
            step="0.01"
            min={minAmount || undefined}
            max={maxAmount || undefined}
            value={value || ''}
            onChange={handleCustomAmountChange}
            error={error}
            placeholder={`Enter gift card value${minAmount && maxAmount ? ` (${formatCurrency(minAmount, currency)} - ${formatCurrency(maxAmount, currency)})` : ''}`}
          />
          {minAmount && maxAmount && (
            <p className="text-sm text-plum-300 mt-2">
              Gift Card Value Range: {formatCurrency(minAmount, currency)} - {formatCurrency(maxAmount, currency)}
            </p>
          )}
          {showSalePrice && value > 0 && (
            <div className="mt-3 p-3 bg-navy-800/50 rounded-lg border border-navy-700">
              <div className="flex justify-between items-center">
                <span className="text-plum-200">You Pay:</span>
                <span className="text-xl font-serif font-bold text-gold-400">
                  {formatCurrency(currentSalePrice, currency)}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-plum-200">Gift Card Value:</span>
                  <span className="text-lg font-semibold text-green-400">
                    {formatCurrency(value, currency)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!allowCustomAmount && !fixedAmounts && (
        <div>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min={minAmount || undefined}
            max={maxAmount || undefined}
            value={value || ''}
            onChange={handleCustomAmountChange}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

