'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    minSalePrice?: number | null;
    maxSalePrice?: number | null;
    allowCustomAmount: boolean;
    fixedAmounts?: number[] | null;
    fixedSalePrices?: number[] | null;
    currency: string;
    merchant: {
      id: string;
      businessName: string | null;
      businessLogo?: string | null;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  // Get first gift card value and sale price
  let displayGiftCardValue = '';
  let displaySalePrice = '';
  
  if (product.fixedAmounts && product.fixedAmounts.length > 0) {
    const firstValue = product.fixedAmounts[0];
    displayGiftCardValue = formatCurrency(firstValue, product.currency);
    
    // Get corresponding sale price
    if (product.fixedSalePrices && product.fixedSalePrices.length > 0) {
      displaySalePrice = formatCurrency(product.fixedSalePrices[0], product.currency);
    } else {
      displaySalePrice = displayGiftCardValue; // No discount
    }
  } else if (product.minAmount) {
    displayGiftCardValue = `From ${formatCurrency(product.minAmount, product.currency)}`;
    if (product.minSalePrice) {
      displaySalePrice = `From ${formatCurrency(product.minSalePrice, product.currency)}`;
    } else {
      displaySalePrice = displayGiftCardValue;
    }
  } else {
    displayGiftCardValue = 'Custom Amount';
    displaySalePrice = 'Custom Amount';
  }

  return (
    <Card className="hover:shadow-md transition-all duration-300 hover:scale-105 h-full flex flex-col">
      {product.image && (
        <div className="relative w-full h-48 mb-4 rounded-t-xl overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{product.name}</CardTitle>
        {product.merchant.businessName && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{product.merchant.businessName}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {product.description && (
          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{product.description}</p>
        )}
        <div className="mb-6">
          <div className="space-y-1">
            <p className="text-2xl font-serif font-bold bg-cyan-gradient bg-clip-text text-transparent">
              {displaySalePrice}
            </p>
            {displaySalePrice !== displayGiftCardValue && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Get {displayGiftCardValue} gift card
              </p>
            )}
            {displaySalePrice === displayGiftCardValue && (
              <p className="text-sm text-slate-600 dark:text-slate-400">Gift Card Value</p>
            )}
          </div>
          {product.allowCustomAmount && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Custom amounts available</p>
          )}
        </div>
        <div className="mt-auto">
          <Link href={`/products/${product.id}`}>
            <Button variant="primary" className="w-full text-lg py-3">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

