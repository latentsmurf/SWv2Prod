'use client';

import React from 'react';
import ThemeCustomizer from '@/components/settings/ThemeCustomizer';
import { ThemeCustomizationProvider } from '@/contexts/ThemeCustomizationContext';

export default function AppearanceSettingsPage() {
    return (
        <ThemeCustomizationProvider>
            <div className="max-w-4xl mx-auto py-8 px-4">
                <ThemeCustomizer />
            </div>
        </ThemeCustomizationProvider>
    );
}
