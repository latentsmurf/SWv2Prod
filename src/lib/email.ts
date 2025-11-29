import { Resend } from 'resend';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    description: string;
    htmlContent: string;
    textContent: string;
    category: 'transactional' | 'marketing' | 'notification' | 'onboarding';
    variables: string[]; // e.g., ['{{name}}', '{{email}}', '{{link}}']
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    status: 'active' | 'unsubscribed' | 'bounced' | 'pending';
    source: 'website' | 'import' | 'api' | 'manual';
    tags: string[];
    subscribedAt: string;
    unsubscribedAt?: string;
    metadata?: Record<string, string>;
}

export interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    templateId: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
    scheduledFor?: string;
    sentAt?: string;
    recipientCount: number;
    openCount: number;
    clickCount: number;
    tags: string[];
    createdAt: string;
}

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    templateId?: string;
    variables?: Record<string, string>;
    replyTo?: string;
    tags?: string[];
}

// ============================================================================
// EMAIL SERVICE
// ============================================================================

class EmailService {
    private resend: Resend | null = null;
    private fromEmail: string = 'SceneWeaver <noreply@sceneweaver.ai>';

    constructor() {
        if (process.env.RESEND_API_KEY) {
            this.resend = new Resend(process.env.RESEND_API_KEY);
        }
        if (process.env.RESEND_FROM_EMAIL) {
            this.fromEmail = process.env.RESEND_FROM_EMAIL;
        }
    }

    private ensureClient(): Resend {
        if (!this.resend) {
            throw new Error('Resend API key not configured. Set RESEND_API_KEY in environment.');
        }
        return this.resend;
    }

    /**
     * Send a single email
     */
    async sendEmail(options: SendEmailOptions): Promise<{ id: string; success: boolean; error?: string }> {
        try {
            const client = this.ensureClient();
            
            let html = options.html;
            let text = options.text;
            
            // If using a template, fetch and process it
            if (options.templateId) {
                const template = await this.getTemplate(options.templateId);
                if (template) {
                    html = this.processTemplate(template.htmlContent, options.variables || {});
                    text = this.processTemplate(template.textContent, options.variables || {});
                }
            }

            const { data, error } = await client.emails.send({
                from: this.fromEmail,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: html || '',
                text: text,
                replyTo: options.replyTo,
                tags: options.tags?.map(tag => ({ name: tag, value: 'true' })),
            });

            if (error) {
                console.error('Resend error:', error);
                return { id: '', success: false, error: error.message };
            }

            return { id: data?.id || '', success: true };
        } catch (err) {
            console.error('Email send error:', err);
            return { id: '', success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    /**
     * Send bulk emails (for campaigns)
     */
    async sendBulkEmails(
        emails: Array<{ to: string; variables?: Record<string, string> }>,
        options: { subject: string; templateId: string }
    ): Promise<{ sent: number; failed: number; errors: string[] }> {
        const results = { sent: 0, failed: 0, errors: [] as string[] };
        
        const template = await this.getTemplate(options.templateId);
        if (!template) {
            return { sent: 0, failed: emails.length, errors: ['Template not found'] };
        }

        // Send in batches to avoid rate limits
        const batchSize = 100;
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            
            await Promise.all(
                batch.map(async (email) => {
                    const result = await this.sendEmail({
                        to: email.to,
                        subject: options.subject,
                        html: this.processTemplate(template.htmlContent, email.variables || {}),
                        text: this.processTemplate(template.textContent, email.variables || {}),
                    });

                    if (result.success) {
                        results.sent++;
                    } else {
                        results.failed++;
                        if (result.error) results.errors.push(`${email.to}: ${result.error}`);
                    }
                })
            );

            // Small delay between batches
            if (i + batchSize < emails.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    /**
     * Process template variables
     */
    private processTemplate(content: string, variables: Record<string, string>): string {
        let processed = content;
        for (const [key, value] of Object.entries(variables)) {
            processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return processed;
    }

    /**
     * Get template by ID (mock - in production, fetch from database)
     */
    async getTemplate(templateId: string): Promise<EmailTemplate | null> {
        // In production, this would fetch from a database
        const templates = getDefaultTemplates();
        return templates.find(t => t.id === templateId) || null;
    }

    /**
     * Verify email address
     */
    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ============================================================================
// DEFAULT EMAIL TEMPLATES
// ============================================================================

export function getDefaultTemplates(): EmailTemplate[] {
    return [
        {
            id: 'welcome',
            name: 'Welcome Email',
            subject: 'Welcome to SceneWeaver! 🎬',
            description: 'Sent when a new user signs up',
            category: 'onboarding',
            variables: ['{{name}}', '{{email}}'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #eab308, #f59e0b); border-radius: 12px; line-height: 60px; font-size: 28px;">🎬</div>
                            <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 0;">Welcome to SceneWeaver!</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px 40px;">
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Hi {{name}},
                            </p>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                We're thrilled to have you join SceneWeaver, the AI-powered film production studio that transforms your scripts into stunning visuals.
                            </p>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                                Here's what you can do:
                            </p>
                            <ul style="color: #a1a1aa; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-left: 20px;">
                                <li>Generate stunning visuals from your scripts</li>
                                <li>Create professional storyboards in seconds</li>
                                <li>Collaborate with your team in real-time</li>
                                <li>Export production-ready assets</li>
                            </ul>
                            <a href="https://sceneweaver.ai/production" style="display: inline-block; background: linear-gradient(135deg, #eab308, #f59e0b); color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Start Creating →
                            </a>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                            <p style="color: #71717a; font-size: 14px; margin: 0;">
                                © 2024 SceneWeaver. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
            textContent: `Welcome to SceneWeaver!

Hi {{name}},

We're thrilled to have you join SceneWeaver, the AI-powered film production studio that transforms your scripts into stunning visuals.

Here's what you can do:
- Generate stunning visuals from your scripts
- Create professional storyboards in seconds
- Collaborate with your team in real-time
- Export production-ready assets

Get started: https://sceneweaver.ai/production

© 2024 SceneWeaver. All rights reserved.`,
        },
        {
            id: 'newsletter-welcome',
            name: 'Newsletter Welcome',
            subject: 'Thanks for subscribing! 🎬',
            description: 'Sent when someone subscribes to the newsletter',
            category: 'marketing',
            variables: ['{{email}}', '{{unsubscribe_link}}'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <tr>
                        <td style="padding: 40px; text-align: center;">
                            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #eab308, #f59e0b); border-radius: 12px; line-height: 60px; font-size: 28px;">📬</div>
                            <h1 style="color: #ffffff; font-size: 24px; margin: 20px 0 10px;">You're on the list!</h1>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Thanks for subscribing to the SceneWeaver newsletter. You'll be the first to know about new features, tips, and exclusive offers.
                            </p>
                            <p style="color: #71717a; font-size: 14px; margin: 20px 0 0;">
                                <a href="{{unsubscribe_link}}" style="color: #71717a;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
            textContent: `You're on the list!

Thanks for subscribing to the SceneWeaver newsletter. You'll be the first to know about new features, tips, and exclusive offers.

Unsubscribe: {{unsubscribe_link}}`,
        },
        {
            id: 'promotional',
            name: 'Promotional Email',
            subject: '{{subject}}',
            description: 'General promotional template',
            category: 'marketing',
            variables: ['{{name}}', '{{subject}}', '{{headline}}', '{{body}}', '{{cta_text}}', '{{cta_link}}', '{{unsubscribe_link}}'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 20px; line-height: 1.3;">{{headline}}</h1>
                            <div style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                                {{body}}
                            </div>
                            <a href="{{cta_link}}" style="display: inline-block; background: linear-gradient(135deg, #eab308, #f59e0b); color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                {{cta_text}}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                            <p style="color: #71717a; font-size: 14px; margin: 0;">
                                <a href="{{unsubscribe_link}}" style="color: #71717a;">Unsubscribe</a> · © 2024 SceneWeaver
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
            textContent: `{{headline}}

{{body}}

{{cta_text}}: {{cta_link}}

---
Unsubscribe: {{unsubscribe_link}}
© 2024 SceneWeaver`,
        },
        {
            id: 'password-reset',
            name: 'Password Reset',
            subject: 'Reset your SceneWeaver password',
            description: 'Sent when user requests password reset',
            category: 'transactional',
            variables: ['{{name}}', '{{reset_link}}'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">Reset Your Password</h1>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Hi {{name}}, we received a request to reset your password. Click the button below to create a new one.
                            </p>
                            <a href="{{reset_link}}" style="display: inline-block; background: linear-gradient(135deg, #eab308, #f59e0b); color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Reset Password
                            </a>
                            <p style="color: #71717a; font-size: 14px; margin: 30px 0 0;">
                                If you didn't request this, you can safely ignore this email. This link expires in 1 hour.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
            textContent: `Reset Your Password

Hi {{name}}, we received a request to reset your password.

Reset your password: {{reset_link}}

If you didn't request this, you can safely ignore this email. This link expires in 1 hour.`,
        },
        {
            id: 'new-feature',
            name: 'New Feature Announcement',
            subject: '🚀 New in SceneWeaver: {{feature_name}}',
            description: 'Announce new features to users',
            category: 'notification',
            variables: ['{{name}}', '{{feature_name}}', '{{feature_description}}', '{{feature_image}}', '{{learn_more_link}}', '{{unsubscribe_link}}'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px;">
                            <span style="display: inline-block; background: linear-gradient(135deg, #eab308, #f59e0b); color: #000000; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">New Feature</span>
                            <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 10px;">{{feature_name}}</h1>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0;">
                                {{feature_description}}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px 40px;">
                            <a href="{{learn_more_link}}" style="display: inline-block; background: linear-gradient(135deg, #eab308, #f59e0b); color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Try It Now →
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                            <p style="color: #71717a; font-size: 14px; margin: 0;">
                                <a href="{{unsubscribe_link}}" style="color: #71717a;">Unsubscribe</a> · © 2024 SceneWeaver
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
            textContent: `🚀 New Feature: {{feature_name}}

{{feature_description}}

Try it now: {{learn_more_link}}

---
Unsubscribe: {{unsubscribe_link}}
© 2024 SceneWeaver`,
        },
    ];
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const emailService = new EmailService();
