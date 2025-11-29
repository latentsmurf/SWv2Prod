import { NextRequest, NextResponse } from 'next/server';
import { blogStore } from '@/lib/blog';

// GET /api/blog/posts/[id] - Get a single post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    // Check if id is a slug or an actual id
    let post = blogStore.getPostById(id);
    if (!post) {
        post = blogStore.getPostBySlug(id);
    }

    if (!post) {
        return NextResponse.json(
            { error: 'Post not found' },
            { status: 404 }
        );
    }

    // Increment view count for published posts
    if (post.status === 'published') {
        blogStore.incrementViewCount(post.id);
    }

    return NextResponse.json({ post });
}

// PUT /api/blog/posts/[id] - Update a post
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { title, content, excerpt, coverImage, categories, tags, status, slug } = body;

        // Check if changing slug to one that already exists
        if (slug) {
            const existingPost = blogStore.getPostBySlug(slug);
            if (existingPost && existingPost.id !== id) {
                return NextResponse.json(
                    { error: 'A post with this slug already exists' },
                    { status: 409 }
                );
            }
        }

        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (excerpt !== undefined) updates.excerpt = excerpt;
        if (coverImage !== undefined) updates.coverImage = coverImage;
        if (categories !== undefined) updates.categories = categories;
        if (tags !== undefined) updates.tags = tags;
        if (slug !== undefined) updates.slug = slug;
        if (status !== undefined) {
            updates.status = status;
            // Set publishedAt when publishing
            if (status === 'published') {
                const existing = blogStore.getPostById(id);
                if (existing && !existing.publishedAt) {
                    updates.publishedAt = new Date().toISOString();
                }
            }
        }

        const post = blogStore.updatePost(id, updates);

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Post updated successfully',
            post,
        });
    } catch (error) {
        console.error('Update post error:', error);
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        );
    }
}

// DELETE /api/blog/posts/[id] - Delete a post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const deleted = blogStore.deletePost(id);

    if (!deleted) {
        return NextResponse.json(
            { error: 'Post not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({
        message: 'Post deleted successfully',
    });
}
