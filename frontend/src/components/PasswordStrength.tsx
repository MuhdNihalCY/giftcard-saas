import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
    password?: string;
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
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
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Password Strength</span>
                        <span className="font-medium">{getStrengthLabel()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
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
                            className={`flex items-center text-xs ${isMet ? 'text-green-600' : 'text-gray-500'
                                }`}
                        >
                            {isMet ? (
                                <Check className="h-3 w-3 mr-1.5" />
                            ) : (
                                <div className="h-1 w-1 rounded-full bg-gray-400 mr-2.5 ml-1" />
                            )}
                            <span>{req.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
