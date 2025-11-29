import { NextRequest, NextResponse } from 'next/server';
import { blogStore, BlogPost } from '@/lib/blog';

// GET /api/blog/posts - List all posts (with optional filters)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    let posts = status === 'all' 
        ? blogStore.getAllPosts() 
        : blogStore.getPublishedPosts();

    // Filter by category
    if (category) {
        posts = posts.filter(p => p.categories.includes(category));
    }

    // Filter by tag
    if (tag) {
        posts = posts.filter(p => p.tags.includes(tag));
    }

    // Search
    if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter(p => 
            p.title.toLowerCase().includes(searchLower) ||
            p.excerpt.toLowerCase().includes(searchLower) ||
            p.content.toLowerCase().includes(searchLower)
        );
    }

    // Pagination
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedPosts = posts.slice(offset, offset + limit);

    return NextResponse.json({
        posts: paginatedPosts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
        },
    });
}

// POST /api/blog/posts - Create a new post
export async function POST(request: NextRequest) {
    try {
        // Check for API key authentication for external tools
        const apiKey = request.headers.get('X-API-Key');
        const authHeader = request.headers.get('Authorization');
        
        // In production, verify API key or auth token
        // For now, we'll allow authenticated requests
        
        const body = await request.json();
        const { title, content, excerpt, coverImage, categories, tags, status, slug, author } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        const settings = blogStore.getSettings();
        const postSlug = slug || blogStore.generateSlug(title);

        // Check for duplicate slug
        const existingPost = blogStore.getPostBySlug(postSlug);
        if (existingPost) {
            return NextResponse.json(
                { error: 'A post with this slug already exists' },
                { status: 409 }
            );
        }

        const post = blogStore.createPost({
            title,
            slug: postSlug,
            content,
            excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
            coverImage,
            categories: categories || [],
            tags: tags || [],
            status: status || 'draft',
            publishedAt: status === 'published' ? new Date().toISOString() : undefined,
            author: author || settings.defaultAuthor,
        });

        return NextResponse.json({
            message: 'Post created successfully',
            post,
        }, { status: 201 });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
