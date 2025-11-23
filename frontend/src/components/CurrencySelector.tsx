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
            <label className="block text-sm font-medium text-plum-200 mb-2">
                Currency
            </label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full px-4 py-3 border-2 rounded-lg text-left bg-navy-800/50 backdrop-blur-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all text-navy-50 ${error ? 'border-red-500/50 focus:ring-red-500' : 'border-plum-500/30'
                    }`}
            >
                <span className="block truncate">
                    {selectedCurrency
                        ? `${selectedCurrency.code} - ${selectedCurrency.name} (${selectedCurrency.symbol})`
                        : 'Select currency'}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-plum-300" />
            </button>

            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-navy-800 border-2 border-plum-500/30 shadow-luxury max-h-60 rounded-lg overflow-hidden backdrop-blur-sm">
                    <div className="sticky top-0 z-10 bg-navy-800 px-2 py-2 border-b border-navy-700">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-plum-300" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-8 pr-4 py-2 border-2 border-plum-500/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 bg-navy-700/50 text-navy-50 placeholder-plum-300"
                                placeholder="Search currency..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filteredCurrencies.length === 0 ? (
                            <li className="text-plum-300 cursor-default select-none py-2 pl-3 pr-9 text-center">
                                No currency found.
                            </li>
                        ) : (
                            filteredCurrencies.map((currency) => (
                                <li
                                    key={currency.code}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors ${value === currency.code ? 'bg-plum-600/30 text-gold-400 border-l-2 border-gold-500' : 'text-navy-50 hover:bg-navy-700/50'
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
                                        <span className="text-plum-300 ml-2">{currency.symbol}</span>
                                    </div>
                                    {value === currency.code && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gold-500">
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
