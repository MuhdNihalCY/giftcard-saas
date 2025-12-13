import React from 'react';
import { Check } from 'lucide-react';

interface PasswordStrengthProps {
    password?: string;
    hasError?: boolean;
}

export function PasswordStrength({ password = '', hasError = false }: PasswordStrengthProps) {
    const requirements = [
        {
            id: 'length',
            label: 'At least 8 characters',
            test: (p: string) => p.length >= 8,
        },
        {
            id: 'uppercase',
            label: 'At least one uppercase letter',
            test: (p: string) => /[A-Z]/.test(p),
        },
        {
            id: 'lowercase',
            label: 'At least one lowercase letter',
            test: (p: string) => /[a-z]/.test(p),
        },
        {
            id: 'number',
            label: 'At least one number',
            test: (p: string) => /[0-9]/.test(p),
        },
        {
            id: 'special',
            label: 'At least one special character',
            test: (p: string) => /[^A-Za-z0-9]/.test(p),
        },
    ];

    // Only show requirements when password is being entered or there's an error
    const shouldShow = password.length > 0 || hasError;

    if (!shouldShow) {
        return null;
    }

    const strength = requirements.reduce((acc, req) => {
        return acc + (req.test(password) ? 1 : 0);
    }, 0);

    const getStrengthColor = () => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = () => {
        if (strength <= 2) return 'Weak';
        if (strength <= 4) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="mt-2 space-y-3">
            {/* Strength Bar */}
            {password.length > 0 && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Password Strength</span>
                        <span className="font-medium">{getStrengthLabel()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: `${(strength / 5) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Requirements List */}
            <div className="space-y-1">
                {requirements.map((req) => {
                    const isMet = req.test(password);
                    return (
                        <div
                            key={req.id}
                            className={`flex items-center text-xs ${isMet ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            {isMet ? (
                                <Check className="h-3 w-3 mr-1.5" />
                            ) : (
                                <div className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500 mr-2.5 ml-1" />
                            )}
                            <span>{req.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
