// ============================================================================
// MARKETING PAGE DATA
// Types and initial data for the marketing CMS
// ============================================================================

import { Layout, Star, MessageSquare, CreditCard, HelpCircle, Users, Megaphone, Search, Link2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface HeroSection {
    headline: string;
    subheadline: string;
    cta_primary: { text: string; url: string };
    cta_secondary: { text: string; url: string };
    background_video?: string;
    background_image?: string;
    show_demo_reel: boolean;
}

export interface Feature {
    id: string;
    icon: string;
    title: string;
    description: string;
    image?: string;
}

export interface Testimonial {
    id: string;
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar?: string;
    rating: number;
}

export interface PricingTier {
    id: string;
    name: string;
    price: number;
    billing: 'monthly' | 'yearly';
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
    enterprise: boolean;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface SocialProof {
    metric: string;
    label: string;
}

export interface Announcement {
    id: string;
    text: string;
    link?: string;
    type: 'info' | 'promo' | 'warning';
    active: boolean;
    expires?: Date;
}

export interface FooterLink {
    id: string;
    label: string;
    url: string;
}

export interface FooterColumn {
    id: string;
    title: string;
    links: FooterLink[];
}

export interface SEOSettings {
    title: string;
    description: string;
    keywords: string[];
    og_image: string;
    twitter_card: string;
}

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

export const SECTIONS = [
    { id: 'hero', name: 'Hero Section', icon: Layout },
    { id: 'features', name: 'Features', icon: Star },
    { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
    { id: 'pricing', name: 'Pricing', icon: CreditCard },
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
    { id: 'social-proof', name: 'Social Proof', icon: Users },
    { id: 'announcements', name: 'Announcements', icon: Megaphone },
    { id: 'seo', name: 'SEO & Meta', icon: Search },
    { id: 'footer', name: 'Footer', icon: Link2 },
] as const;

export type SectionId = typeof SECTIONS[number]['id'];

// ============================================================================
// INITIAL DATA
// ============================================================================

export const INITIAL_HERO: HeroSection = {
    headline: 'AI-Powered Video Production Studio',
    subheadline: 'Transform your scripts into stunning visual content with our cutting-edge AI tools. From storyboarding to final cut.',
    cta_primary: { text: 'Start Creating Free', url: '/signup' },
    cta_secondary: { text: 'Watch Demo', url: '#demo' },
    background_video: '/videos/hero-reel.mp4',
    background_image: '/hero-background.png',
    show_demo_reel: true
};

export const INITIAL_FEATURES: Feature[] = [
    { id: '1', icon: 'Sparkles', title: 'AI Script Analysis', description: 'Our AI breaks down your script into scenes, shots, and visual descriptions automatically.', image: '/features/script.png' },
    { id: '2', icon: 'Image', title: 'Shot Generation', description: 'Generate cinematic shots from text descriptions using state-of-the-art AI models.', image: '/features/generation.png' },
    { id: '3', icon: 'Film', title: 'Style Consistency', description: 'Maintain visual consistency across your entire project with character and style locking.', image: '/features/style.png' },
    { id: '4', icon: 'Wand2', title: 'Repair Shop', description: 'Fine-tune and edit generated content with our powerful AI-assisted editing tools.', image: '/features/repair.png' },
    { id: '5', icon: 'Video', title: 'Timeline Editor', description: 'Professional timeline editing with transitions, effects, and audio synchronization.', image: '/features/timeline.png' },
    { id: '6', icon: 'Share2', title: 'Multi-Platform Export', description: 'Export optimized content for any platform - YouTube, TikTok, Instagram, and more.', image: '/features/export.png' },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
    { id: '1', quote: 'SceneWeaver has revolutionized our pre-production workflow. What used to take weeks now takes hours.', author: 'Sarah Chen', role: 'Creative Director', company: 'Indie Films Co', rating: 5 },
    { id: '2', quote: 'The AI consistency features are incredible. Our characters look the same across hundreds of shots.', author: 'Marcus Johnson', role: 'VFX Supervisor', company: 'Digital Dreams', rating: 5 },
    { id: '3', quote: 'Finally, a tool that understands the creative process. The script-to-shot pipeline is magical.', author: 'Elena Rodriguez', role: 'Showrunner', company: 'StreamNet Originals', rating: 5 },
];

export const INITIAL_PRICING: PricingTier[] = [
    { id: 'free', name: 'Starter', price: 0, billing: 'monthly', description: 'Perfect for trying out', features: ['50 credits/month', 'Basic generation', 'Community support', 'Watermarked exports'], cta: 'Start Free', popular: false, enterprise: false },
    { id: 'pro', name: 'Pro', price: 29, billing: 'monthly', description: 'For serious creators', features: ['500 credits/month', 'HD generation', 'Priority support', 'No watermarks', 'API access', 'Custom styles'], cta: 'Go Pro', popular: true, enterprise: false },
    { id: 'studio', name: 'Studio', price: 99, billing: 'monthly', description: 'For production teams', features: ['2,500 credits/month', '4K generation', 'Dedicated support', 'Team collaboration', 'Custom styles', 'White-label exports', 'Analytics'], cta: 'Get Studio', popular: false, enterprise: false },
    { id: 'enterprise', name: 'Enterprise', price: 0, billing: 'monthly', description: 'Custom solutions', features: ['Unlimited credits', '8K generation', 'SLA guarantee', 'Dedicated manager', 'Custom integrations', 'On-premise option', 'Training'], cta: 'Contact Sales', popular: false, enterprise: true },
];

export const INITIAL_FAQS: FAQ[] = [
    { id: '1', question: 'What AI models do you use?', answer: 'We use a combination of state-of-the-art models including GPT-4 for script analysis, Stable Diffusion and DALL-E for image generation, and proprietary models for video synthesis.', category: 'Technology' },
    { id: '2', question: 'How many credits do I need per video?', answer: 'Credit usage varies by quality and length. A typical 1-minute video at HD quality uses about 50-100 credits. 4K and longer videos use proportionally more.', category: 'Pricing' },
    { id: '3', question: 'Can I use generated content commercially?', answer: 'Yes! All paid plans include full commercial rights to your generated content. Free plan content is for personal use only.', category: 'Legal' },
    { id: '4', question: 'Do you offer refunds?', answer: 'We offer a 14-day money-back guarantee on all paid plans. Credits that have been used cannot be refunded.', category: 'Pricing' },
];

export const INITIAL_SOCIAL_PROOF: SocialProof[] = [
    { metric: '50,000+', label: 'Creators' },
    { metric: '2M+', label: 'Videos Generated' },
    { metric: '99.9%', label: 'Uptime' },
    { metric: '4.9/5', label: 'User Rating' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    { id: '1', text: '🎉 New: 4K video generation now available for Pro users!', link: '/blog/4k-launch', type: 'promo', active: true },
];

export const INITIAL_FOOTER_COLUMNS: FooterColumn[] = [
    {
        id: 'product',
        title: 'Product',
        links: [
            { id: '1', label: 'Features', url: '/features' },
            { id: '2', label: 'Pricing', url: '/pricing' },
            { id: '3', label: 'Changelog', url: '/changelog' },
            { id: '4', label: 'Roadmap', url: '/roadmap' },
        ]
    },
    {
        id: 'resources',
        title: 'Resources',
        links: [
            { id: '1', label: 'Documentation', url: '/docs' },
            { id: '2', label: 'Tutorials', url: '/tutorials' },
            { id: '3', label: 'API Reference', url: '/api' },
            { id: '4', label: 'Community', url: '/community' },
        ]
    },
    {
        id: 'company',
        title: 'Company',
        links: [
            { id: '1', label: 'About', url: '/about' },
            { id: '2', label: 'Blog', url: '/blog' },
            { id: '3', label: 'Careers', url: '/careers' },
            { id: '4', label: 'Contact', url: '/contact' },
        ]
    },
    {
        id: 'legal',
        title: 'Legal',
        links: [
            { id: '1', label: 'Privacy', url: '/privacy' },
            { id: '2', label: 'Terms', url: '/terms' },
            { id: '3', label: 'Cookies', url: '/cookies' },
            { id: '4', label: 'Licenses', url: '/licenses' },
        ]
    },
];

export const INITIAL_SEO: SEOSettings = {
    title: 'SceneWeaver - AI Video Production Studio',
    description: 'Transform your scripts into stunning visual content with AI-powered video generation, editing, and post-production tools.',
    keywords: ['AI video', 'video generation', 'film production', 'storyboarding', 'visual effects'],
    og_image: '/og-image.png',
    twitter_card: 'summary_large_image',
};

// ============================================================================
// ICON MAPPING
// ============================================================================

export const FEATURE_ICONS = [
    'Sparkles', 'Image', 'Film', 'Wand2', 'Video', 'Share2', 
    'Zap', 'Globe', 'Shield', 'Rocket', 'Heart', 'Star',
    'Camera', 'Mic', 'Music', 'Palette', 'Layers', 'Grid'
];

export const FAQ_CATEGORIES = ['Technology', 'Pricing', 'Legal', 'Features', 'Support'];
