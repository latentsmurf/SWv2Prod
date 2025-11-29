import { NextResponse } from 'next/server';
import { blogStore } from '@/lib/blog';

// GET /api/blog/tags - List all tags
export async function GET() {
    const tags = blogStore.getAllTags();
    return NextResponse.json({ tags });
}
