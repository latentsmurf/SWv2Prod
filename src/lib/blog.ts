// ============================================================================
// BLOG TYPES AND DATA STORE
// ============================================================================

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML content
    contentMarkdown?: string; // Original markdown if applicable
    coverImage?: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    publishedAt?: string;
    scheduledFor?: string;
    createdAt: string;
    updatedAt: string;
    categories: string[];
    tags: string[];
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        ogImage?: string;
    };
    readingTime?: number; // minutes
    viewCount: number;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    postCount: number;
}

export interface BlogSettings {
    title: string;
    description: string;
    postsPerPage: number;
    allowComments: boolean;
    defaultAuthor: {
        id: string;
        name: string;
        email: string;
    };
}

// ============================================================================
// IN-MEMORY DATA STORE (Replace with database in production)
// ============================================================================

class BlogStore {
    private posts: Map<string, BlogPost> = new Map();
    private categories: Map<string, BlogCategory> = new Map();
    private settings: BlogSettings = {
        title: 'SceneWeaver Blog',
        description: 'Insights, tutorials, and updates from the SceneWeaver team',
        postsPerPage: 10,
        allowComments: true,
        defaultAuthor: {
            id: 'author_1',
            name: 'SceneWeaver Team',
            email: 'team@sceneweaver.ai',
        },
    };

    constructor() {
        this.seedData();
    }

    private seedData() {
        // Seed categories
        const defaultCategories: BlogCategory[] = [
            { id: 'cat_1', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides', postCount: 2 },
            { id: 'cat_2', name: 'Product Updates', slug: 'product-updates', description: 'New features and improvements', postCount: 2 },
            { id: 'cat_3', name: 'Industry Insights', slug: 'industry-insights', description: 'Film and AI industry news', postCount: 1 },
            { id: 'cat_4', name: 'Case Studies', slug: 'case-studies', description: 'Success stories from our users', postCount: 1 },
            { id: 'cat_5', name: 'Behind the Scenes', slug: 'behind-the-scenes', description: 'How we build SceneWeaver', postCount: 1 },
        ];
        defaultCategories.forEach(cat => this.categories.set(cat.id, cat));

        // Seed posts
        const defaultPosts: BlogPost[] = [
            {
                id: 'post_1',
                slug: 'introducing-sceneweaver-2-0',
                title: 'Introducing SceneWeaver 2.0: The Future of AI Film Production',
                excerpt: 'Today we\'re excited to announce SceneWeaver 2.0, our biggest update yet with revolutionary new AI capabilities.',
                content: `
<p>Today marks a significant milestone in our journey to democratize film production. We're thrilled to announce <strong>SceneWeaver 2.0</strong>, our most ambitious update yet.</p>

<h2>What's New in 2.0</h2>

<p>This release introduces several groundbreaking features:</p>

<ul>
<li><strong>AI Storyboarding</strong> - Transform your scripts into visual storyboards with a single click</li>
<li><strong>Real-time Collaboration</strong> - Work with your team simultaneously on any project</li>
<li><strong>Advanced Shot Generation</strong> - Our new AI model produces cinema-quality visuals</li>
<li><strong>Voice Synthesis</strong> - Generate natural voiceovers in multiple languages</li>
</ul>

<h2>The Vision Behind 2.0</h2>

<p>When we started SceneWeaver, we had a simple goal: make professional film production accessible to everyone. With 2.0, we're taking a giant leap toward that vision.</p>

<blockquote>
<p>"SceneWeaver 2.0 isn't just an update—it's a complete reimagining of what's possible in AI-assisted filmmaking."</p>
<cite>— Sarah Chen, CEO</cite>
</blockquote>

<h2>Getting Started</h2>

<p>All existing users have been automatically upgraded to 2.0. New users can sign up at <a href="https://sceneweaver.ai">sceneweaver.ai</a> and start creating immediately.</p>

<p>We can't wait to see what you create!</p>
                `,
                coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=630&fit=crop',
                author: { id: 'author_1', name: 'Sarah Chen', email: 'sarah@sceneweaver.ai', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                status: 'published',
                publishedAt: '2024-02-15T10:00:00Z',
                createdAt: '2024-02-14T08:00:00Z',
                updatedAt: '2024-02-15T09:30:00Z',
                categories: ['Product Updates'],
                tags: ['announcement', 'product', 'ai', 'release'],
                seo: { metaTitle: 'SceneWeaver 2.0 Launch - AI Film Production', metaDescription: 'Discover the revolutionary new features in SceneWeaver 2.0' },
                readingTime: 4,
                viewCount: 3420,
            },
            {
                id: 'post_2',
                slug: 'getting-started-with-ai-storyboarding',
                title: 'Getting Started with AI Storyboarding: A Complete Guide',
                excerpt: 'Learn how to transform your screenplay into professional storyboards using SceneWeaver\'s AI tools.',
                content: `
<p>Storyboarding is one of the most crucial steps in pre-production, yet it's often overlooked due to time and budget constraints. With SceneWeaver's AI Storyboarding, you can create professional storyboards in minutes.</p>

<h2>Step 1: Import Your Script</h2>

<p>Start by uploading your screenplay in any standard format (PDF, FDX, or plain text). SceneWeaver automatically parses scene headings, action lines, and dialogue.</p>

<h2>Step 2: Configure Your Style</h2>

<p>Choose from our library of visual styles or create your own. Options include:</p>

<ul>
<li>Cinematic realism</li>
<li>Animated/cartoon</li>
<li>Noir</li>
<li>Custom trained styles</li>
</ul>

<h2>Step 3: Generate Boards</h2>

<p>Click "Generate Storyboard" and watch as AI creates frame-by-frame visualizations of your script. Each board includes:</p>

<ul>
<li>Camera angle suggestions</li>
<li>Character positioning</li>
<li>Lighting notes</li>
<li>Movement indicators</li>
</ul>

<h2>Step 4: Refine and Export</h2>

<p>Fine-tune individual frames, add annotations, and export to PDF, PNG, or directly to your production management software.</p>

<h2>Pro Tips</h2>

<ol>
<li>Be specific in your action lines for better AI interpretation</li>
<li>Use the "regenerate" feature to explore alternative compositions</li>
<li>Lock frames you like to prevent changes during batch regeneration</li>
</ol>

<p>Ready to try it yourself? <a href="/production">Start creating now →</a></p>
                `,
                coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=630&fit=crop',
                author: { id: 'author_2', name: 'Marcus Rodriguez', email: 'marcus@sceneweaver.ai', avatar: 'https://i.pravatar.cc/150?u=marcus' },
                status: 'published',
                publishedAt: '2024-02-10T14:00:00Z',
                createdAt: '2024-02-08T11:00:00Z',
                updatedAt: '2024-02-10T13:45:00Z',
                categories: ['Tutorials'],
                tags: ['tutorial', 'storyboarding', 'ai', 'guide', 'beginner'],
                seo: { metaTitle: 'AI Storyboarding Tutorial - SceneWeaver', metaDescription: 'Complete guide to creating professional storyboards with AI' },
                readingTime: 6,
                viewCount: 2180,
            },
            {
                id: 'post_3',
                slug: 'how-indie-filmmakers-are-using-ai',
                title: 'How Indie Filmmakers Are Using AI to Compete with Studios',
                excerpt: 'Discover how independent creators are leveraging AI tools to produce studio-quality content on indie budgets.',
                content: `
<p>The democratization of filmmaking has entered a new era. Independent filmmakers are now using AI tools to achieve production values that were previously only possible with major studio backing.</p>

<h2>The New Landscape</h2>

<p>Traditional barriers to entry in film production—expensive equipment, large crews, and extensive post-production facilities—are being disrupted by AI technologies.</p>

<h2>Real Stories from Indie Creators</h2>

<h3>Case Study: "Neon Dreams"</h3>

<p>Director Jamie Liu used SceneWeaver to pre-visualize their entire feature film before shooting a single frame. The result? A 40% reduction in shooting days and a Sundance selection.</p>

<blockquote>
<p>"AI didn't replace my creative vision—it amplified it. I could show my team exactly what I saw in my head."</p>
<cite>— Jamie Liu, Director</cite>
</blockquote>

<h3>Case Study: "The Last Signal"</h3>

<p>A team of just three people created a sci-fi short that's been viewed over 2 million times on YouTube, using AI for storyboarding, concept art, and visual effects planning.</p>

<h2>What This Means for the Industry</h2>

<p>We're witnessing a fundamental shift in how films are made. The focus is moving from "can we afford to make this?" to "how do we want to tell this story?"</p>

<p>The future belongs to storytellers with vision, regardless of their budget.</p>
                `,
                coverImage: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=630&fit=crop',
                author: { id: 'author_3', name: 'Alex Thompson', email: 'alex@sceneweaver.ai', avatar: 'https://i.pravatar.cc/150?u=alex' },
                status: 'published',
                publishedAt: '2024-02-05T09:00:00Z',
                createdAt: '2024-02-03T15:00:00Z',
                updatedAt: '2024-02-05T08:30:00Z',
                categories: ['Industry Insights', 'Case Studies'],
                tags: ['indie', 'filmmaking', 'ai', 'case-study', 'industry'],
                readingTime: 5,
                viewCount: 4560,
            },
            {
                id: 'post_4',
                slug: 'mastering-ai-shot-composition',
                title: 'Mastering AI Shot Composition: Advanced Techniques',
                excerpt: 'Take your AI-generated visuals to the next level with these professional composition techniques.',
                content: `
<p>Once you've mastered the basics of AI image generation, it's time to explore advanced composition techniques that will make your shots truly cinematic.</p>

<h2>Understanding the Language of Prompts</h2>

<p>The key to professional results is learning to "speak" to the AI effectively. Here are advanced prompting strategies:</p>

<h3>1. Cinematic References</h3>
<p>Instead of generic descriptions, reference specific cinematographers or films:</p>
<ul>
<li>"Roger Deakins lighting style"</li>
<li>"Emmanuel Lubezki long take aesthetic"</li>
<li>"Wes Anderson symmetrical composition"</li>
</ul>

<h3>2. Technical Camera Specifications</h3>
<p>Specify lens and camera parameters for more control:</p>
<ul>
<li>"Shot on 35mm anamorphic, shallow depth of field"</li>
<li>"Wide angle lens distortion, 16mm"</li>
<li>"Telephoto compression, 200mm"</li>
</ul>

<h3>3. Lighting Descriptors</h3>
<p>Be specific about lighting setups:</p>
<ul>
<li>"Three-point lighting with soft key"</li>
<li>"Golden hour rim lighting"</li>
<li>"Chiaroscuro, single source from screen left"</li>
</ul>

<h2>Composition Rules in AI Generation</h2>

<p>Classic composition rules still apply:</p>
<ul>
<li>Rule of thirds</li>
<li>Leading lines</li>
<li>Frame within frame</li>
<li>Negative space</li>
</ul>

<p>Include these in your prompts for more intentional compositions.</p>

<h2>Practice Exercise</h2>

<p>Try generating the same scene with different composition approaches. Compare a centered composition with rule-of-thirds placement. Note how the emotional impact changes.</p>
                `,
                coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=630&fit=crop',
                author: { id: 'author_2', name: 'Marcus Rodriguez', email: 'marcus@sceneweaver.ai', avatar: 'https://i.pravatar.cc/150?u=marcus' },
                status: 'published',
                publishedAt: '2024-01-28T11:00:00Z',
                createdAt: '2024-01-26T14:00:00Z',
                updatedAt: '2024-01-28T10:30:00Z',
                categories: ['Tutorials'],
                tags: ['tutorial', 'composition', 'advanced', 'cinematography', 'prompts'],
                readingTime: 7,
                viewCount: 1890,
            },
            {
                id: 'post_5',
                slug: 'building-sceneweaver-technical-deep-dive',
                title: 'Building SceneWeaver: A Technical Deep Dive',
                excerpt: 'A behind-the-scenes look at the technology powering SceneWeaver\'s AI film production platform.',
                content: `
<p>Ever wondered what goes on under the hood of SceneWeaver? In this post, we're pulling back the curtain to share some of the technical challenges and solutions behind our platform.</p>

<h2>The Architecture</h2>

<p>SceneWeaver is built on a modern stack designed for performance and scalability:</p>

<ul>
<li><strong>Frontend:</strong> Next.js with React, optimized for real-time collaboration</li>
<li><strong>Backend:</strong> Distributed microservices handling different aspects of generation</li>
<li><strong>AI Pipeline:</strong> Custom orchestration layer managing multiple AI models</li>
<li><strong>Storage:</strong> Cloud-native object storage with global CDN</li>
</ul>

<h2>The AI Challenge</h2>

<p>Generating consistent, high-quality visuals that maintain character and style consistency across an entire production is incredibly challenging. Our solution involves:</p>

<ol>
<li>Custom fine-tuned models for different aspects of generation</li>
<li>A "style memory" system that learns from your project</li>
<li>Ensemble approaches combining multiple model outputs</li>
</ol>

<h2>Real-time Collaboration</h2>

<p>Supporting multiple users editing the same project simultaneously required innovative solutions in conflict resolution and state synchronization.</p>

<h2>What's Next</h2>

<p>We're constantly pushing the boundaries. Current R&D focuses include:</p>
<ul>
<li>Video generation from storyboards</li>
<li>3D scene reconstruction</li>
<li>Automated editing suggestions</li>
</ul>

<p>Stay tuned for more technical deep dives!</p>
                `,
                coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop',
                author: { id: 'author_4', name: 'Dr. Emily Zhang', email: 'emily@sceneweaver.ai', avatar: 'https://i.pravatar.cc/150?u=emily' },
                status: 'published',
                publishedAt: '2024-01-20T16:00:00Z',
                createdAt: '2024-01-18T10:00:00Z',
                updatedAt: '2024-01-20T15:30:00Z',
                categories: ['Behind the Scenes'],
                tags: ['engineering', 'ai', 'technical', 'architecture', 'behind-the-scenes'],
                readingTime: 8,
                viewCount: 2340,
            },
            {
                id: 'post_6',
                slug: 'upcoming-features-roadmap-2024',
                title: 'SceneWeaver Roadmap: What\'s Coming in 2024',
                excerpt: 'A preview of exciting new features and improvements planned for SceneWeaver this year.',
                content: `
<p>We're excited to share our product roadmap for 2024. Based on your feedback and our vision for the future of AI filmmaking, here's what's coming:</p>

<h2>Q1 2024 ✓</h2>
<ul>
<li>✓ SceneWeaver 2.0 launch</li>
<li>✓ AI Storyboarding</li>
<li>✓ Real-time collaboration</li>
</ul>

<h2>Q2 2024</h2>
<ul>
<li>Video clip generation (beta)</li>
<li>Enhanced character consistency</li>
<li>Mobile app preview</li>
</ul>

<h2>Q3 2024</h2>
<ul>
<li>Full video generation</li>
<li>Audio/music integration</li>
<li>API for developers</li>
</ul>

<h2>Q4 2024</h2>
<ul>
<li>3D scene export</li>
<li>Virtual production tools</li>
<li>Enterprise features</li>
</ul>

<h2>Your Voice Matters</h2>

<p>This roadmap is shaped by your feedback. Have a feature request? Let us know in our community Discord or through the feedback button in the app.</p>

<p>Together, we're building the future of filmmaking.</p>
                `,
                coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop',
                author: { id: 'author_1', name: 'Sarah Chen', email: 'sarah@sceneweaver.ai', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                status: 'published',
                publishedAt: '2024-01-15T09:00:00Z',
                createdAt: '2024-01-14T11:00:00Z',
                updatedAt: '2024-01-15T08:30:00Z',
                categories: ['Product Updates'],
                tags: ['roadmap', 'features', 'product', '2024', 'announcement'],
                readingTime: 3,
                viewCount: 5120,
            },
        ];
        defaultPosts.forEach(post => this.posts.set(post.id, post));
    }

    // ============================================================================
    // POSTS CRUD
    // ============================================================================

    getAllPosts(): BlogPost[] {
        return Array.from(this.posts.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    getPublishedPosts(): BlogPost[] {
        return this.getAllPosts().filter(p => p.status === 'published');
    }

    getPostById(id: string): BlogPost | null {
        return this.posts.get(id) || null;
    }

    getPostBySlug(slug: string): BlogPost | null {
        return Array.from(this.posts.values()).find(p => p.slug === slug) || null;
    }

    getPostsByCategory(category: string): BlogPost[] {
        return this.getPublishedPosts().filter(p => p.categories.includes(category));
    }

    getPostsByTag(tag: string): BlogPost[] {
        return this.getPublishedPosts().filter(p => p.tags.includes(tag));
    }

    createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): BlogPost {
        const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const newPost: BlogPost = {
            ...post,
            id,
            createdAt: now,
            updatedAt: now,
            viewCount: 0,
            readingTime: this.calculateReadingTime(post.content),
        };
        this.posts.set(id, newPost);
        return newPost;
    }

    updatePost(id: string, updates: Partial<BlogPost>): BlogPost | null {
        const existing = this.posts.get(id);
        if (!existing) return null;

        const updated: BlogPost = {
            ...existing,
            ...updates,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString(),
        };

        if (updates.content) {
            updated.readingTime = this.calculateReadingTime(updates.content);
        }

        this.posts.set(id, updated);
        return updated;
    }

    deletePost(id: string): boolean {
        return this.posts.delete(id);
    }

    incrementViewCount(id: string): void {
        const post = this.posts.get(id);
        if (post) {
            post.viewCount++;
            this.posts.set(id, post);
        }
    }

    // ============================================================================
    // CATEGORIES CRUD
    // ============================================================================

    getAllCategories(): BlogCategory[] {
        return Array.from(this.categories.values());
    }

    getCategoryBySlug(slug: string): BlogCategory | null {
        return Array.from(this.categories.values()).find(c => c.slug === slug) || null;
    }

    // ============================================================================
    // SETTINGS
    // ============================================================================

    getSettings(): BlogSettings {
        return this.settings;
    }

    updateSettings(updates: Partial<BlogSettings>): BlogSettings {
        this.settings = { ...this.settings, ...updates };
        return this.settings;
    }

    // ============================================================================
    // HELPERS
    // ============================================================================

    private calculateReadingTime(content: string): number {
        const plainText = content.replace(/<[^>]*>/g, '');
        const wordCount = plainText.split(/\s+/).length;
        return Math.ceil(wordCount / 200); // Assuming 200 WPM reading speed
    }

    generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    getAllTags(): string[] {
        const tags = new Set<string>();
        this.posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }
}

// Export singleton instance
export const blogStore = new BlogStore();
