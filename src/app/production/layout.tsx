import React from 'react';
import ProductionLayout from '@/components/layout/ProductionLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ProductionLayout projectName="The Last Starship">
            {children}
        </ProductionLayout>
    );
}
