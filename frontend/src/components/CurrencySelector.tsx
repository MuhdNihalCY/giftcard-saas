import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { currencies } from '@/lib/currencies';

interface CurrencySelectorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function CurrencySelector({ value, onChange, error }: CurrencySelectorProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useOnClickOutside(ref, () => setOpen(false));

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const filteredCurrencies = currencies.filter((currency) =>
        currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCurrency = currencies.find((c) => c.code === value);

    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium text-gray-900 mb-1">
                Currency
            </label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full px-4 py-2 border rounded-lg text-left bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
            >
                <span className="block truncate">
                    {selectedCurrency
                        ? `${selectedCurrency.code} - ${selectedCurrency.name} (${selectedCurrency.symbol})`
                        : 'Select currency'}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </button>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    <div className="sticky top-0 z-10 bg-white px-2 py-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Search currency..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filteredCurrencies.length === 0 ? (
                            <li className="text-gray-500 cursor-default select-none py-2 pl-3 pr-9 text-center">
                                No currency found.
                            </li>
                        ) : (
                            filteredCurrencies.map((currency) => (
                                <li
                                    key={currency.code}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${value === currency.code ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                                        }`}
                                    onClick={() => {
                                        onChange(currency.code);
                                        setOpen(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <span className="font-medium w-12">{currency.code}</span>
                                        <span className="truncate flex-1">{currency.name}</span>
                                        <span className="text-gray-500 ml-2">{currency.symbol}</span>
                                    </div>
                                    {value === currency.code && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
