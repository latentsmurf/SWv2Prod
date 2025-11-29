// ============================================================================
// ADMIN DATA STORE
// In-memory store for admin data (replace with database in production)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: 'user' | 'pro' | 'studio' | 'enterprise' | 'admin';
    status: 'active' | 'suspended' | 'pending';
    credits: number;
    total_spent: number;
    projects_count: number;
    created_at: string;
    last_login?: string;
    subscription?: {
        plan: string;
        status: 'active' | 'cancelled' | 'past_due';
        started_at: string;
        next_billing: string;
    };
}

export interface AdminSettings {
    general: Record<string, any>;
    security: Record<string, any>;
    ai: Record<string, any>;
    storage: Record<string, any>;
    email: Record<string, any>;
    notifications: Record<string, any>;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user_id?: string;
    user_email?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    details: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
}

export interface SystemHealth {
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    uptime: number;
    lastCheck: string;
    endpoint: string;
    category: 'ai' | 'storage' | 'database' | 'payment' | 'core';
}

export interface DashboardStats {
    users: { total: number; active: number; new: number; growth: number };
    projects: { total: number; active: number; completed: number; growth: number };
    credits: { consumed: number; remaining: number; revenue: number; growth: number };
    system: { uptime: number; latency: number; errorRate: number };
}

// ============================================================================
// IN-MEMORY STORE
// ============================================================================

class AdminStore {
    private users: AdminUser[] = [];
    private settings!: AdminSettings;
    private auditLog: AuditLogEntry[] = [];
    private healthChecks: Map<string, SystemHealth> = new Map();
    
    constructor() {
        this.initializeDefaults();
    }
    
    private initializeDefaults() {
        // Initialize with sample users
        this.users = [
            {
                id: 'user-1',
                email: 'john@example.com',
                name: 'John Smith',
                role: 'pro',
                status: 'active',
                credits: 1500,
                total_spent: 299,
                projects_count: 12,
                created_at: '2024-01-15T10:00:00Z',
                last_login: new Date().toISOString(),
                subscription: { plan: 'Pro', status: 'active', started_at: '2024-01-15T10:00:00Z', next_billing: '2025-01-15T10:00:00Z' }
            },
            {
                id: 'user-2',
                email: 'sarah@studio.com',
                name: 'Sarah Chen',
                role: 'studio',
                status: 'active',
                credits: 8500,
                total_spent: 1188,
                projects_count: 45,
                created_at: '2024-03-20T10:00:00Z',
                last_login: new Date(Date.now() - 3600000).toISOString(),
                subscription: { plan: 'Studio', status: 'active', started_at: '2024-03-20T10:00:00Z', next_billing: '2025-01-20T10:00:00Z' }
            },
            {
                id: 'user-3',
                email: 'netflix@partner.com',
                name: 'Netflix Studios',
                role: 'enterprise',
                status: 'active',
                credits: 125000,
                total_spent: 59880,
                projects_count: 234,
                created_at: '2024-01-10T10:00:00Z',
                last_login: new Date(Date.now() - 1800000).toISOString(),
                subscription: { plan: 'Enterprise', status: 'active', started_at: '2024-01-10T10:00:00Z', next_billing: '2025-01-10T10:00:00Z' }
            },
            {
                id: 'user-4',
                email: 'mike@films.io',
                name: 'Mike Johnson',
                role: 'pro',
                status: 'active',
                credits: 200,
                total_spent: 174,
                projects_count: 8,
                created_at: '2024-06-01T10:00:00Z',
                last_login: new Date(Date.now() - 86400000).toISOString(),
                subscription: { plan: 'Pro', status: 'active', started_at: '2024-06-01T10:00:00Z', next_billing: '2025-01-01T10:00:00Z' }
            },
            {
                id: 'user-5',
                email: 'emma@prod.co',
                name: 'Emma Wilson',
                role: 'user',
                status: 'pending',
                credits: 50,
                total_spent: 0,
                projects_count: 2,
                created_at: '2024-11-20T10:00:00Z',
            },
            {
                id: 'user-6',
                email: 'spam@bad.com',
                name: 'Suspended User',
                role: 'user',
                status: 'suspended',
                credits: 0,
                total_spent: 0,
                projects_count: 0,
                created_at: '2024-10-15T10:00:00Z',
            },
        ];
        
        // Initialize settings
        this.settings = {
            general: {
                site_name: 'SceneWeaver',
                site_url: 'https://app.sceneweaver.ai',
                support_email: 'support@sceneweaver.ai',
                default_language: 'en',
                timezone: 'UTC',
                maintenance_mode: false,
            },
            security: {
                require_email_verification: true,
                session_timeout: 24,
                max_login_attempts: 5,
                lockout_duration: 15,
                require_2fa_admin: true,
                allowed_domains: '',
            },
            ai: {
                openai_api_key: process.env.OPENAI_API_KEY || '',
                anthropic_api_key: process.env.ANTHROPIC_API_KEY || '',
                replicate_api_key: process.env.REPLICATE_API_TOKEN || '',
                elevenlabs_api_key: process.env.ELEVENLABS_API_KEY || '',
                default_model: 'gpt-4o',
                rate_limit_per_minute: 60,
            },
            storage: {
                storage_provider: 'gcs',
                gcs_bucket: process.env.GCS_BUCKET || 'sceneweaver-media',
                gcs_project_id: process.env.GCS_PROJECT_ID || '',
                max_upload_size: 500,
                allowed_file_types: 'jpg,jpeg,png,gif,mp4,mov,webm,mp3,wav',
                auto_cleanup_days: 90,
            },
            email: {
                email_provider: 'resend',
                resend_api_key: process.env.RESEND_API_KEY || '',
                from_email: process.env.RESEND_FROM_EMAIL || 'noreply@sceneweaver.ai',
                from_name: 'SceneWeaver',
                reply_to: 'support@sceneweaver.ai',
            },
            notifications: {
                notify_new_user: true,
                notify_new_subscription: true,
                notify_payment_failed: true,
                notify_api_errors: true,
                notify_high_usage: true,
                slack_webhook: '',
                discord_webhook: '',
            },
        };
        
        // Initialize audit log
        this.auditLog = [
            { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), user_email: 'admin@sceneweaver.ai', action: 'settings.update', resource_type: 'settings', details: { section: 'general', field: 'site_name' } },
            { id: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), user_email: 'admin@sceneweaver.ai', action: 'user.suspend', resource_type: 'user', resource_id: 'user-6', details: { reason: 'Spam activity' } },
            { id: '3', timestamp: new Date(Date.now() - 86400000).toISOString(), user_email: 'admin@sceneweaver.ai', action: 'user.credits.adjust', resource_type: 'user', resource_id: 'user-3', details: { amount: 10000, reason: 'Promotional credits' } },
        ];
        
        // Initialize health checks
        const services: SystemHealth[] = [
            { service: 'OpenAI GPT-4', status: 'healthy', latency: 234, uptime: 99.98, lastCheck: new Date().toISOString(), endpoint: 'api.openai.com', category: 'ai' },
            { service: 'OpenAI DALL-E', status: 'healthy', latency: 1850, uptime: 99.95, lastCheck: new Date().toISOString(), endpoint: 'api.openai.com', category: 'ai' },
            { service: 'Replicate (Video)', status: 'healthy', latency: 3200, uptime: 99.87, lastCheck: new Date().toISOString(), endpoint: 'api.replicate.com', category: 'ai' },
            { service: 'ElevenLabs', status: 'healthy', latency: 189, uptime: 99.92, lastCheck: new Date().toISOString(), endpoint: 'api.elevenlabs.io', category: 'ai' },
            { service: 'Anthropic Claude', status: 'healthy', latency: 312, uptime: 99.96, lastCheck: new Date().toISOString(), endpoint: 'api.anthropic.com', category: 'ai' },
            { service: 'Google Cloud Storage', status: 'healthy', latency: 45, uptime: 99.99, lastCheck: new Date().toISOString(), endpoint: 'storage.googleapis.com', category: 'storage' },
            { service: 'MongoDB Atlas', status: 'healthy', latency: 23, uptime: 99.99, lastCheck: new Date().toISOString(), endpoint: 'cluster0.mongodb.net', category: 'database' },
            { service: 'Stripe Payments', status: 'healthy', latency: 156, uptime: 99.99, lastCheck: new Date().toISOString(), endpoint: 'api.stripe.com', category: 'payment' },
            { service: 'Next.js API', status: 'healthy', latency: 45, uptime: 99.97, lastCheck: new Date().toISOString(), endpoint: 'api.sceneweaver.ai', category: 'core' },
            { service: 'Python Backend', status: 'healthy', latency: 78, uptime: 99.95, lastCheck: new Date().toISOString(), endpoint: 'python.internal:8000', category: 'core' },
        ];
        
        services.forEach(s => this.healthChecks.set(s.service, s));
    }
    
    // ========================================================================
    // USER METHODS
    // ========================================================================
    
    getUsers(filters?: { role?: string; status?: string; search?: string }): AdminUser[] {
        let users = [...this.users];
        
        if (filters?.role && filters.role !== 'all') {
            users = users.filter(u => u.role === filters.role);
        }
        if (filters?.status && filters.status !== 'all') {
            users = users.filter(u => u.status === filters.status);
        }
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            users = users.filter(u => 
                u.email.toLowerCase().includes(q) || 
                u.name.toLowerCase().includes(q)
            );
        }
        
        return users;
    }
    
    getUser(id: string): AdminUser | undefined {
        return this.users.find(u => u.id === id);
    }
    
    updateUser(id: string, updates: Partial<AdminUser>): AdminUser | null {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) return null;
        
        this.users[index] = { ...this.users[index], ...updates };
        return this.users[index];
    }
    
    adjustUserCredits(id: string, amount: number, reason: string): AdminUser | null {
        const user = this.getUser(id);
        if (!user) return null;
        
        user.credits += amount;
        this.addAuditLog({
            user_email: 'admin@sceneweaver.ai',
            action: 'user.credits.adjust',
            resource_type: 'user',
            resource_id: id,
            details: { amount, reason, new_balance: user.credits }
        });
        
        return user;
    }
    
    suspendUser(id: string, reason: string): AdminUser | null {
        const user = this.updateUser(id, { status: 'suspended' });
        if (user) {
            this.addAuditLog({
                user_email: 'admin@sceneweaver.ai',
                action: 'user.suspend',
                resource_type: 'user',
                resource_id: id,
                details: { reason }
            });
        }
        return user;
    }
    
    activateUser(id: string): AdminUser | null {
        const user = this.updateUser(id, { status: 'active' });
        if (user) {
            this.addAuditLog({
                user_email: 'admin@sceneweaver.ai',
                action: 'user.activate',
                resource_type: 'user',
                resource_id: id,
                details: {}
            });
        }
        return user;
    }
    
    // ========================================================================
    // SETTINGS METHODS
    // ========================================================================
    
    getSettings(): AdminSettings {
        // Mask sensitive values
        const masked = JSON.parse(JSON.stringify(this.settings));
        
        // Mask API keys
        if (masked.ai.openai_api_key) masked.ai.openai_api_key = '••••••••••••••••';
        if (masked.ai.anthropic_api_key) masked.ai.anthropic_api_key = '••••••••••••••••';
        if (masked.ai.replicate_api_key) masked.ai.replicate_api_key = '••••••••••••••••';
        if (masked.ai.elevenlabs_api_key) masked.ai.elevenlabs_api_key = '••••••••••••••••';
        if (masked.email.resend_api_key) masked.email.resend_api_key = '••••••••••••••••';
        
        return masked;
    }
    
    updateSettings(section: string, updates: Record<string, any>): AdminSettings {
        if (this.settings[section as keyof AdminSettings]) {
            // Don't update masked passwords unless a new value is provided
            Object.keys(updates).forEach(key => {
                if (updates[key] !== '••••••••••••••••') {
                    (this.settings[section as keyof AdminSettings] as any)[key] = updates[key];
                }
            });
            
            this.addAuditLog({
                user_email: 'admin@sceneweaver.ai',
                action: 'settings.update',
                resource_type: 'settings',
                details: { section, fields: Object.keys(updates) }
            });
        }
        
        return this.getSettings();
    }
    
    // ========================================================================
    // AUDIT LOG METHODS
    // ========================================================================
    
    getAuditLog(filters?: { action?: string; resource_type?: string; limit?: number }): AuditLogEntry[] {
        let logs = [...this.auditLog].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        if (filters?.action) {
            logs = logs.filter(l => l.action.includes(filters.action!));
        }
        if (filters?.resource_type) {
            logs = logs.filter(l => l.resource_type === filters.resource_type);
        }
        if (filters?.limit) {
            logs = logs.slice(0, filters.limit);
        }
        
        return logs;
    }
    
    addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
        const newEntry: AuditLogEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...entry
        };
        this.auditLog.unshift(newEntry);
        return newEntry;
    }
    
    // ========================================================================
    // HEALTH CHECK METHODS
    // ========================================================================
    
    getHealthChecks(): SystemHealth[] {
        return Array.from(this.healthChecks.values());
    }
    
    async runHealthCheck(service?: string): Promise<SystemHealth[]> {
        const services = service 
            ? [this.healthChecks.get(service)].filter(Boolean) as SystemHealth[]
            : Array.from(this.healthChecks.values());
        
        // Simulate health check with random latency variation
        for (const svc of services) {
            svc.lastCheck = new Date().toISOString();
            svc.latency = Math.floor(svc.latency * (0.9 + Math.random() * 0.2));
            
            // Random chance of degraded status (5%)
            if (Math.random() < 0.05) {
                svc.status = 'degraded';
            } else {
                svc.status = 'healthy';
            }
        }
        
        return services;
    }
    
    // ========================================================================
    // DASHBOARD STATS
    // ========================================================================
    
    getDashboardStats(): DashboardStats {
        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const newUsers = this.users.filter(u => {
            const created = new Date(u.created_at);
            const dayAgo = new Date(Date.now() - 86400000);
            return created > dayAgo;
        }).length;
        
        const totalCredits = this.users.reduce((sum, u) => sum + u.credits, 0);
        const totalSpent = this.users.reduce((sum, u) => sum + u.total_spent, 0);
        
        return {
            users: {
                total: this.users.length,
                active: activeUsers,
                new: newUsers,
                growth: 12.5
            },
            projects: {
                total: this.users.reduce((sum, u) => sum + u.projects_count, 0),
                active: Math.floor(this.users.reduce((sum, u) => sum + u.projects_count, 0) * 0.3),
                completed: Math.floor(this.users.reduce((sum, u) => sum + u.projects_count, 0) * 0.7),
                growth: 8.3
            },
            credits: {
                consumed: Math.floor(totalCredits * 0.6),
                remaining: totalCredits,
                revenue: totalSpent,
                growth: 23.7
            },
            system: {
                uptime: 99.97,
                latency: 142,
                errorRate: 0.03
            }
        };
    }
    
    getRecentActivity(limit: number = 10): any[] {
        // Combine various activities
        const activities: any[] = [];
        
        // Recent user signups
        this.users
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .forEach(u => {
                activities.push({
                    id: `signup-${u.id}`,
                    type: 'user_signup',
                    message: 'New user registered',
                    user: u.email,
                    timestamp: u.created_at
                });
            });
        
        // Recent audit log entries
        this.auditLog.slice(0, 5).forEach(log => {
            activities.push({
                id: log.id,
                type: log.action.includes('payment') ? 'payment' : 
                      log.action.includes('credits') ? 'generation' : 
                      log.action.includes('error') ? 'error' : 'project_created',
                message: `${log.action}: ${log.resource_type}`,
                user: log.user_email,
                timestamp: log.timestamp
            });
        });
        
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
}

// Export singleton instance
export const adminStore = new AdminStore();
