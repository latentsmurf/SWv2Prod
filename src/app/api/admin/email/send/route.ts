import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, subject, templateId, variables, html, text } = body;

        if (!to) {
            return NextResponse.json(
                { error: 'Recipient email is required' },
                { status: 400 }
            );
        }

        if (!templateId && !html && !text) {
            return NextResponse.json(
                { error: 'Either templateId or html/text content is required' },
                { status: 400 }
            );
        }

        const result = await emailService.sendEmail({
            to,
            subject: subject || 'Message from SceneWeaver',
            templateId,
            variables,
            html,
            text,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to send email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Email sent successfully',
            id: result.id,
        });
    } catch (error) {
        console.error('Send email error:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
