import { NextRequest, NextResponse } from 'next/server';
import { getDefaultTemplates, EmailTemplate } from '@/lib/email';

// In-memory store for custom templates (in production, use database)
const customTemplates: Map<string, EmailTemplate> = new Map();

// Initialize with default templates
getDefaultTemplates().forEach(t => customTemplates.set(t.id, t));

export async function GET() {
    const templates = Array.from(customTemplates.values());
    return NextResponse.json({
        templates,
        total: templates.length,
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, subject, description, htmlContent, textContent, category, variables } = body;

        if (!name || !subject || !htmlContent) {
            return NextResponse.json(
                { error: 'Name, subject, and HTML content are required' },
                { status: 400 }
            );
        }

        const template: EmailTemplate = {
            id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            subject,
            description: description || '',
            htmlContent,
            textContent: textContent || '',
            category: category || 'marketing',
            variables: variables || [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        customTemplates.set(template.id, template);

        return NextResponse.json({
            message: 'Template created successfully',
            template,
        });
    } catch (error) {
        console.error('Create template error:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Template ID is required' },
                { status: 400 }
            );
        }

        const existing = customTemplates.get(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        const updated: EmailTemplate = {
            ...existing,
            ...updates,
            id: existing.id, // Prevent ID change
            createdAt: existing.createdAt, // Prevent createdAt change
            updatedAt: new Date().toISOString(),
        };

        customTemplates.set(id, updated);

        return NextResponse.json({
            message: 'Template updated successfully',
            template: updated,
        });
    } catch (error) {
        console.error('Update template error:', error);
        return NextResponse.json(
            { error: 'Failed to update template' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'Template ID is required' },
            { status: 400 }
        );
    }

    if (!customTemplates.has(id)) {
        return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
        );
    }

    customTemplates.delete(id);

    return NextResponse.json({
        message: 'Template deleted successfully',
    });
}
