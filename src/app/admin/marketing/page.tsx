'use client';

import React, { useState } from 'react';
import {
    Globe, Layout, Type, Image as ImageIcon, Star, MessageSquare,
    CreditCard, HelpCircle, Users, Megaphone, Link2, Search, Save,
    Plus, Trash2, Edit2, Eye, ChevronDown, ChevronRight, GripVertical,
    Upload, X, Check, ExternalLink, Sparkles, Play, Award
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface HeroSection {
    headline: string;
    subheadline: string;
    cta_primary: { text: string; url: string };
    cta_secondary: { text: string; url: string };
    background_video?: string;
    background_image?: string;
    show_demo_reel: boolean;
}

interface Feature {
    id: string;
    icon: string;
    title: string;
    description: string;
    image?: string;
}

interface Testimonial {
    id: string;
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar?: string;
    rating: number;
}

interface PricingTier {
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

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

interface SocialProof {
    metric: string;
    label: string;
}

interface Announcement {
    id: string;
    text: string;
    link?: string;
    type: 'info' | 'promo' | 'warning';
    active: boolean;
    expires?: Date;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const INITIAL_HERO: HeroSection = {
    headline: 'AI-Powered Video Production Studio',
    subheadline: 'Transform your scripts into stunning visual content with our cutting-edge AI tools. From storyboarding to final cut.',
    cta_primary: { text: 'Start Creating Free', url: '/signup' },
    cta_secondary: { text: 'Watch Demo', url: '#demo' },
    background_video: '/videos/hero-reel.mp4',
    background_image: '/hero-background.png',
    show_demo_reel: true
};

const INITIAL_FEATURES: Feature[] = [
    { id: '1', icon: 'Sparkles', title: 'AI Script Analysis', description: 'Our AI breaks down your script into scenes, shots, and visual descriptions automatically.', image: '/features/script.png' },
    { id: '2', icon: 'Image', title: 'Shot Generation', description: 'Generate cinematic shots from text descriptions using state-of-the-art AI models.', image: '/features/generation.png' },
    { id: '3', icon: 'Film', title: 'Style Consistency', description: 'Maintain visual consistency across your entire project with character and style locking.', image: '/features/style.png' },
    { id: '4', icon: 'Wand2', title: 'Repair Shop', description: 'Fine-tune and edit generated content with our powerful AI-assisted editing tools.', image: '/features/repair.png' },
    { id: '5', icon: 'Video', title: 'Timeline Editor', description: 'Professional timeline editing with transitions, effects, and audio synchronization.', image: '/features/timeline.png' },
    { id: '6', icon: 'Share2', title: 'Multi-Platform Export', description: 'Export optimized content for any platform - YouTube, TikTok, Instagram, and more.', image: '/features/export.png' },
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
    { id: '1', quote: 'SceneWeaver has revolutionized our pre-production workflow. What used to take weeks now takes hours.', author: 'Sarah Chen', role: 'Creative Director', company: 'Indie Films Co', rating: 5 },
    { id: '2', quote: 'The AI consistency features are incredible. Our characters look the same across hundreds of shots.', author: 'Marcus Johnson', role: 'VFX Supervisor', company: 'Digital Dreams', rating: 5 },
    { id: '3', quote: 'Finally, a tool that understands the creative process. The script-to-shot pipeline is magical.', author: 'Elena Rodriguez', role: 'Showrunner', company: 'StreamNet Originals', rating: 5 },
];

const INITIAL_PRICING: PricingTier[] = [
    { id: 'free', name: 'Starter', price: 0, billing: 'monthly', description: 'Perfect for trying out', features: ['50 credits/month', 'Basic generation', 'Community support', 'Watermarked exports'], cta: 'Start Free', popular: false, enterprise: false },
    { id: 'pro', name: 'Pro', price: 29, billing: 'monthly', description: 'For serious creators', features: ['500 credits/month', 'HD generation', 'Priority support', 'No watermarks', 'API access', 'Custom styles'], cta: 'Go Pro', popular: true, enterprise: false },
    { id: 'studio', name: 'Studio', price: 99, billing: 'monthly', description: 'For production teams', features: ['2,500 credits/month', '4K generation', 'Dedicated support', 'Team collaboration', 'Custom styles', 'White-label exports', 'Analytics'], cta: 'Get Studio', popular: false, enterprise: false },
    { id: 'enterprise', name: 'Enterprise', price: 0, billing: 'monthly', description: 'Custom solutions', features: ['Unlimited credits', '8K generation', 'SLA guarantee', 'Dedicated manager', 'Custom integrations', 'On-premise option', 'Training'], cta: 'Contact Sales', popular: false, enterprise: true },
];

const INITIAL_FAQS: FAQ[] = [
    { id: '1', question: 'What AI models do you use?', answer: 'We use a combination of state-of-the-art models including GPT-4 for script analysis, Stable Diffusion and DALL-E for image generation, and proprietary models for video synthesis.', category: 'Technology' },
    { id: '2', question: 'How many credits do I need per video?', answer: 'Credit usage varies by quality and length. A typical 1-minute video at HD quality uses about 50-100 credits. 4K and longer videos use proportionally more.', category: 'Pricing' },
    { id: '3', question: 'Can I use generated content commercially?', answer: 'Yes! All paid plans include full commercial rights to your generated content. Free plan content is for personal use only.', category: 'Legal' },
    { id: '4', question: 'Do you offer refunds?', answer: 'We offer a 14-day money-back guarantee on all paid plans. Credits that have been used cannot be refunded.', category: 'Pricing' },
];

const INITIAL_SOCIAL_PROOF: SocialProof[] = [
    { metric: '50,000+', label: 'Creators' },
    { metric: '2M+', label: 'Videos Generated' },
    { metric: '99.9%', label: 'Uptime' },
    { metric: '4.9/5', label: 'User Rating' },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    { id: '1', text: '🎉 New: 4K video generation now available for Pro users!', link: '/blog/4k-launch', type: 'promo', active: true },
];

// ============================================================================
// NAVIGATION
// ============================================================================

const SECTIONS = [
    { id: 'hero', name: 'Hero Section', icon: Layout },
    { id: 'features', name: 'Features', icon: Star },
    { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
    { id: 'pricing', name: 'Pricing', icon: CreditCard },
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
    { id: 'social-proof', name: 'Social Proof', icon: Users },
    { id: 'announcements', name: 'Announcements', icon: Megaphone },
    { id: 'seo', name: 'SEO & Meta', icon: Search },
    { id: 'footer', name: 'Footer', icon: Link2 },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MarketingPage() {
    const [activeSection, setActiveSection] = useState('hero');
    const [hero, setHero] = useState(INITIAL_HERO);
    const [features, setFeatures] = useState(INITIAL_FEATURES);
    const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
    const [pricing, setPricing] = useState(INITIAL_PRICING);
    const [faqs, setFaqs] = useState(INITIAL_FAQS);
    const [socialProof, setSocialProof] = useState(INITIAL_SOCIAL_PROOF);
    const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // Modal states
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [editingPricing, setEditingPricing] = useState<PricingTier | null>(null);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    // SEO state
    const [seo, setSeo] = useState({
        title: 'SceneWeaver - AI Video Production Studio',
        description: 'Transform your scripts into stunning visual content with AI-powered video production tools.',
        keywords: 'AI video, video production, AI filmmaking, script to video, storyboarding',
        og_image: '/og-image.png',
        twitter_handle: '@sceneweaver'
    });

    // Footer state
    const [footer, setFooter] = useState({
        tagline: 'AI-powered creativity for everyone.',
        links: [
            { category: 'Product', items: ['Features', 'Pricing', 'API', 'Changelog'] },
            { category: 'Company', items: ['About', 'Blog', 'Careers', 'Press'] },
            { category: 'Resources', items: ['Documentation', 'Tutorials', 'Community', 'Support'] },
            { category: 'Legal', items: ['Privacy', 'Terms', 'Cookies', 'Licenses'] },
        ],
        social: [
            { platform: 'Twitter', url: 'https://twitter.com/sceneweaver' },
            { platform: 'YouTube', url: 'https://youtube.com/@sceneweaver' },
            { platform: 'Discord', url: 'https://discord.gg/sceneweaver' },
            { platform: 'LinkedIn', url: 'https://linkedin.com/company/sceneweaver' },
        ]
    });

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        setHasChanges(false);
    };

    const markChanged = () => setHasChanges(true);

    // Feature handlers
    const addFeature = () => {
        const newFeature: Feature = {
            id: Date.now().toString(),
            icon: 'Star',
            title: 'New Feature',
            description: 'Describe this feature...'
        };
        setFeatures([...features, newFeature]);
        setEditingFeature(newFeature);
        markChanged();
    };

    const deleteFeature = (id: string) => {
        setFeatures(features.filter(f => f.id !== id));
        markChanged();
    };

    // Testimonial handlers
    const addTestimonial = () => {
        const newTestimonial: Testimonial = {
            id: Date.now().toString(),
            quote: 'Amazing product!',
            author: 'John Doe',
            role: 'CEO',
            company: 'Acme Inc',
            rating: 5
        };
        setTestimonials([...testimonials, newTestimonial]);
        setEditingTestimonial(newTestimonial);
        markChanged();
    };

    const deleteTestimonial = (id: string) => {
        setTestimonials(testimonials.filter(t => t.id !== id));
        markChanged();
    };

    // FAQ handlers
    const addFaq = () => {
        const newFaq: FAQ = {
            id: Date.now().toString(),
            question: 'New Question?',
            answer: 'Answer here...',
            category: 'General'
        };
        setFaqs([...faqs, newFaq]);
        setEditingFaq(newFaq);
        markChanged();
    };

    const deleteFaq = (id: string) => {
        setFaqs(faqs.filter(f => f.id !== id));
        markChanged();
    };

    // Announcement handlers
    const addAnnouncement = () => {
        setAnnouncements([...announcements, {
            id: Date.now().toString(),
            text: 'New announcement',
            type: 'info',
            active: false
        }]);
        markChanged();
    };

    const deleteAnnouncement = (id: string) => {
        setAnnouncements(announcements.filter(a => a.id !== id));
        markChanged();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Marketing Pages</h1>
                    <p className="text-sm text-gray-500">Configure landing page content and SEO</p>
                </div>
                <div className="flex items-center gap-3">
                    <a 
                        href="/" 
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white"
                    >
                        <Eye size={16} />
                        Preview Site
                        <ExternalLink size={12} />
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 text-black font-semibold rounded-lg text-sm"
                    >
                        <Save size={16} />
                        {saving ? 'Publishing...' : 'Publish Changes'}
                    </button>
                </div>
            </div>

            {/* Unsaved indicator */}
            {hasChanges && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    Unpublished changes
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                    activeSection === section.id
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <section.icon size={18} />
                                <span className="text-sm font-medium">{section.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {/* Hero Section */}
                    {activeSection === 'hero' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5">
                                <h2 className="text-lg font-semibold text-white">Hero Section</h2>
                                <p className="text-sm text-gray-500">The main banner on your landing page</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Headline</label>
                                    <input
                                        type="text"
                                        value={hero.headline}
                                        onChange={(e) => { setHero({...hero, headline: e.target.value}); markChanged(); }}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Subheadline</label>
                                    <textarea
                                        value={hero.subheadline}
                                        onChange={(e) => { setHero({...hero, subheadline: e.target.value}); markChanged(); }}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Primary CTA Text</label>
                                        <input
                                            type="text"
                                            value={hero.cta_primary.text}
                                            onChange={(e) => { setHero({...hero, cta_primary: {...hero.cta_primary, text: e.target.value}}); markChanged(); }}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Primary CTA URL</label>
                                        <input
                                            type="text"
                                            value={hero.cta_primary.url}
                                            onChange={(e) => { setHero({...hero, cta_primary: {...hero.cta_primary, url: e.target.value}}); markChanged(); }}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Secondary CTA Text</label>
                                        <input
                                            type="text"
                                            value={hero.cta_secondary.text}
                                            onChange={(e) => { setHero({...hero, cta_secondary: {...hero.cta_secondary, text: e.target.value}}); markChanged(); }}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Secondary CTA URL</label>
                                        <input
                                            type="text"
                                            value={hero.cta_secondary.url}
                                            onChange={(e) => { setHero({...hero, cta_secondary: {...hero.cta_secondary, url: e.target.value}}); markChanged(); }}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Background Image URL</label>
                                    <input
                                        type="text"
                                        value={hero.background_image}
                                        onChange={(e) => { setHero({...hero, background_image: e.target.value}); markChanged(); }}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => { setHero({...hero, show_demo_reel: !hero.show_demo_reel}); markChanged(); }}
                                        className={`w-12 h-6 rounded-full transition-colors ${hero.show_demo_reel ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${hero.show_demo_reel ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                    <span className="text-sm text-gray-400">Show demo reel video</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features Section */}
                    {activeSection === 'features' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Features</h2>
                                    <p className="text-sm text-gray-500">Highlight your product's key features</p>
                                </div>
                                <button
                                    onClick={addFeature}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm"
                                >
                                    <Plus size={14} />
                                    Add Feature
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {features.map((feature, index) => (
                                    <div key={feature.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group">
                                        <GripVertical size={16} className="text-gray-600 cursor-grab" />
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{feature.title}</div>
                                            <div className="text-xs text-gray-500 truncate">{feature.description}</div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setEditingFeature(feature)}
                                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deleteFeature(feature.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Testimonials Section */}
                    {activeSection === 'testimonials' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Testimonials</h2>
                                    <p className="text-sm text-gray-500">Customer reviews and success stories</p>
                                </div>
                                <button
                                    onClick={addTestimonial}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm"
                                >
                                    <Plus size={14} />
                                    Add Testimonial
                                </button>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="p-4 bg-white/5 rounded-lg group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={12} className={i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setEditingTestimonial(testimonial)}
                                                    className="p-1 text-gray-500 hover:text-white"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteTestimonial(testimonial.id)}
                                                    className="p-1 text-gray-500 hover:text-red-400"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 italic mb-3">"{testimonial.quote}"</p>
                                        <div>
                                            <div className="text-sm font-medium text-white">{testimonial.author}</div>
                                            <div className="text-xs text-gray-500">{testimonial.role}, {testimonial.company}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pricing Section */}
                    {activeSection === 'pricing' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5">
                                <h2 className="text-lg font-semibold text-white">Pricing Tiers</h2>
                                <p className="text-sm text-gray-500">Configure your pricing display</p>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pricing.map((tier) => (
                                    <div key={tier.id} className={`p-4 rounded-lg border ${tier.popular ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10 bg-white/5'}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">{tier.name}</span>
                                                    {tier.popular && <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded">POPULAR</span>}
                                                </div>
                                                <div className="text-2xl font-bold text-white mt-1">
                                                    {tier.enterprise ? 'Custom' : `$${tier.price}`}
                                                    {!tier.enterprise && <span className="text-sm text-gray-500">/mo</span>}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setEditingPricing(tier)}
                                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">{tier.description}</p>
                                        <ul className="space-y-1">
                                            {tier.features.slice(0, 4).map((f, i) => (
                                                <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Check size={10} className="text-green-400" />
                                                    {f}
                                                </li>
                                            ))}
                                            {tier.features.length > 4 && (
                                                <li className="text-xs text-gray-500">+{tier.features.length - 4} more</li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FAQ Section */}
                    {activeSection === 'faq' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">FAQ</h2>
                                    <p className="text-sm text-gray-500">Frequently asked questions</p>
                                </div>
                                <button
                                    onClick={addFaq}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm"
                                >
                                    <Plus size={14} />
                                    Add Question
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {faqs.map((faq) => (
                                    <div key={faq.id} className="p-3 bg-white/5 rounded-lg group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-white">{faq.question}</span>
                                                    <span className="px-1.5 py-0.5 bg-white/10 text-gray-400 text-[10px] rounded">{faq.category}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2">{faq.answer}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setEditingFaq(faq)}
                                                    className="p-1 text-gray-500 hover:text-white"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteFaq(faq.id)}
                                                    className="p-1 text-gray-500 hover:text-red-400"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Proof Section */}
                    {activeSection === 'social-proof' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5">
                                <h2 className="text-lg font-semibold text-white">Social Proof</h2>
                                <p className="text-sm text-gray-500">Key metrics to build trust</p>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                {socialProof.map((item, index) => (
                                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                                        <label className="block text-xs text-gray-500 mb-1">Metric</label>
                                        <input
                                            type="text"
                                            value={item.metric}
                                            onChange={(e) => {
                                                const updated = [...socialProof];
                                                updated[index].metric = e.target.value;
                                                setSocialProof(updated);
                                                markChanged();
                                            }}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-lg font-bold mb-2"
                                        />
                                        <label className="block text-xs text-gray-500 mb-1">Label</label>
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => {
                                                const updated = [...socialProof];
                                                updated[index].label = e.target.value;
                                                setSocialProof(updated);
                                                markChanged();
                                            }}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Announcements Section */}
                    {activeSection === 'announcements' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Announcements</h2>
                                    <p className="text-sm text-gray-500">Site-wide banners and notifications</p>
                                </div>
                                <button
                                    onClick={addAnnouncement}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm"
                                >
                                    <Plus size={14} />
                                    Add Announcement
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => {
                                                    setAnnouncements(announcements.map(a => 
                                                        a.id === announcement.id ? {...a, active: !a.active} : a
                                                    ));
                                                    markChanged();
                                                }}
                                                className={`w-10 h-5 rounded-full shrink-0 transition-colors ${announcement.active ? 'bg-green-500' : 'bg-gray-600'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${announcement.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </button>
                                            <div className="flex-1 space-y-3">
                                                <input
                                                    type="text"
                                                    value={announcement.text}
                                                    onChange={(e) => {
                                                        setAnnouncements(announcements.map(a => 
                                                            a.id === announcement.id ? {...a, text: e.target.value} : a
                                                        ));
                                                        markChanged();
                                                    }}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={announcement.link || ''}
                                                        onChange={(e) => {
                                                            setAnnouncements(announcements.map(a => 
                                                                a.id === announcement.id ? {...a, link: e.target.value} : a
                                                            ));
                                                            markChanged();
                                                        }}
                                                        placeholder="Link URL (optional)"
                                                        className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-600"
                                                    />
                                                    <select
                                                        value={announcement.type}
                                                        onChange={(e) => {
                                                            setAnnouncements(announcements.map(a => 
                                                                a.id === announcement.id ? {...a, type: e.target.value as any} : a
                                                            ));
                                                            markChanged();
                                                        }}
                                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm"
                                                    >
                                                        <option value="info">Info</option>
                                                        <option value="promo">Promo</option>
                                                        <option value="warning">Warning</option>
                                                    </select>
                                                    <button 
                                                        onClick={() => deleteAnnouncement(announcement.id)}
                                                        className="p-1.5 text-gray-500 hover:text-red-400"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {announcements.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Megaphone size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No announcements yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SEO Section */}
                    {activeSection === 'seo' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5">
                                <h2 className="text-lg font-semibold text-white">SEO & Meta Tags</h2>
                                <p className="text-sm text-gray-500">Optimize for search engines and social sharing</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Page Title</label>
                                    <input
                                        type="text"
                                        value={seo.title}
                                        onChange={(e) => { setSeo({...seo, title: e.target.value}); markChanged(); }}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">{seo.title.length}/60 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
                                    <textarea
                                        value={seo.description}
                                        onChange={(e) => { setSeo({...seo, description: e.target.value}); markChanged(); }}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">{seo.description.length}/160 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Keywords</label>
                                    <input
                                        type="text"
                                        value={seo.keywords}
                                        onChange={(e) => { setSeo({...seo, keywords: e.target.value}); markChanged(); }}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">OG Image URL</label>
                                    <input
                                        type="text"
                                        value={seo.og_image}
                                        onChange={(e) => { setSeo({...seo, og_image: e.target.value}); markChanged(); }}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Twitter Handle</label>
                                    <input
                                        type="text"
                                        value={seo.twitter_handle}
                                        onChange={(e) => { setSeo({...seo, twitter_handle: e.target.value}); markChanged(); }}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>

                                {/* Preview */}
                                <div className="pt-4 border-t border-white/5">
                                    <h3 className="text-sm font-medium text-gray-400 mb-3">Search Preview</h3>
                                    <div className="p-4 bg-white rounded-lg">
                                        <div className="text-blue-600 text-lg hover:underline cursor-pointer">{seo.title}</div>
                                        <div className="text-green-700 text-sm">https://sceneweaver.ai</div>
                                        <div className="text-gray-600 text-sm mt-1">{seo.description}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Section */}
                    {activeSection === 'footer' && (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5">
                                <h2 className="text-lg font-semibold text-white">Footer</h2>
                                <p className="text-sm text-gray-500">Footer content and links</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Tagline</label>
                                    <input
                                        type="text"
                                        value={footer.tagline}
                                        onChange={(e) => { setFooter({...footer, tagline: e.target.value}); markChanged(); }}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-3">Link Columns</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {footer.links.map((column, colIndex) => (
                                            <div key={colIndex} className="p-3 bg-white/5 rounded-lg">
                                                <input
                                                    type="text"
                                                    value={column.category}
                                                    onChange={(e) => {
                                                        const updated = {...footer};
                                                        updated.links[colIndex].category = e.target.value;
                                                        setFooter(updated);
                                                        markChanged();
                                                    }}
                                                    className="w-full px-2 py-1 bg-transparent border-b border-white/10 text-white text-sm font-medium mb-2"
                                                />
                                                <div className="space-y-1">
                                                    {column.items.map((item, itemIndex) => (
                                                        <input
                                                            key={itemIndex}
                                                            type="text"
                                                            value={item}
                                                            onChange={(e) => {
                                                                const updated = {...footer};
                                                                updated.links[colIndex].items[itemIndex] = e.target.value;
                                                                setFooter(updated);
                                                                markChanged();
                                                            }}
                                                            className="w-full px-2 py-1 bg-white/5 rounded text-gray-400 text-xs"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-3">Social Links</label>
                                    <div className="space-y-2">
                                        {footer.social.map((social, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={social.platform}
                                                    onChange={(e) => {
                                                        const updated = {...footer};
                                                        updated.social[index].platform = e.target.value;
                                                        setFooter(updated);
                                                        markChanged();
                                                    }}
                                                    className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={social.url}
                                                    onChange={(e) => {
                                                        const updated = {...footer};
                                                        updated.social[index].url = e.target.value;
                                                        setFooter(updated);
                                                        markChanged();
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Feature Edit Modal */}
            {editingFeature && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Edit Feature</h3>
                            <button onClick={() => setEditingFeature(null)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editingFeature.title}
                                    onChange={(e) => setEditingFeature({...editingFeature, title: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={editingFeature.description}
                                    onChange={(e) => setEditingFeature({...editingFeature, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Icon Name</label>
                                <input
                                    type="text"
                                    value={editingFeature.icon}
                                    onChange={(e) => setEditingFeature({...editingFeature, icon: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    placeholder="Lucide icon name (e.g., Star, Sparkles)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={editingFeature.image || ''}
                                    onChange={(e) => setEditingFeature({...editingFeature, image: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setEditingFeature(null)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setFeatures(features.map(f => f.id === editingFeature.id ? editingFeature : f));
                                    setEditingFeature(null);
                                    markChanged();
                                }}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg"
                            >
                                Save Feature
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Testimonial Edit Modal */}
            {editingTestimonial && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Edit Testimonial</h3>
                            <button onClick={() => setEditingTestimonial(null)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Quote</label>
                                <textarea
                                    value={editingTestimonial.quote}
                                    onChange={(e) => setEditingTestimonial({...editingTestimonial, quote: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Author Name</label>
                                    <input
                                        type="text"
                                        value={editingTestimonial.author}
                                        onChange={(e) => setEditingTestimonial({...editingTestimonial, author: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Role</label>
                                    <input
                                        type="text"
                                        value={editingTestimonial.role}
                                        onChange={(e) => setEditingTestimonial({...editingTestimonial, role: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={editingTestimonial.company}
                                    onChange={(e) => setEditingTestimonial({...editingTestimonial, company: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(n => (
                                        <button 
                                            key={n}
                                            onClick={() => setEditingTestimonial({...editingTestimonial, rating: n})}
                                            className={`p-2 rounded ${n <= editingTestimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                        >
                                            <Star size={20} className={n <= editingTestimonial.rating ? 'fill-yellow-400' : ''} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setEditingTestimonial(null)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t));
                                    setEditingTestimonial(null);
                                    markChanged();
                                }}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg"
                            >
                                Save Testimonial
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Edit Modal */}
            {editingFaq && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Edit FAQ</h3>
                            <button onClick={() => setEditingFaq(null)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Question</label>
                                <input
                                    type="text"
                                    value={editingFaq.question}
                                    onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Answer</label>
                                <textarea
                                    value={editingFaq.answer}
                                    onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})}
                                    rows={4}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Category</label>
                                <select
                                    value={editingFaq.category}
                                    onChange={(e) => setEditingFaq({...editingFaq, category: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                >
                                    <option value="General">General</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Pricing">Pricing</option>
                                    <option value="Legal">Legal</option>
                                    <option value="Support">Support</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setEditingFaq(null)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setFaqs(faqs.map(f => f.id === editingFaq.id ? editingFaq : f));
                                    setEditingFaq(null);
                                    markChanged();
                                }}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg"
                            >
                                Save FAQ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
